# backend/routers/repositories.py (Complete Fixed Version)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import logging

from database import get_db
from models import Repository as RepositoryModel, User as UserModel, RepositoryCollaborator
from schemas import Repository, RepositoryCreate, RepositoryUpdate
from auth import verify_clerk_token, contributor_required
from audit import log_activity

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=Repository, status_code=status.HTTP_201_CREATED)
async def create_repository(
    repo_data: RepositoryCreate,
    current_user: UserModel = Depends(contributor_required),
    db: Session = Depends(get_db)
):
    """Create a new repository"""
    try:
        logger.info(f"Creating repository: {repo_data.dict()} for user: {current_user.email}")
        
        # Check if repository name is unique for this user
        existing_repo = db.query(RepositoryModel).filter(
            RepositoryModel.name == repo_data.name,
            RepositoryModel.owner_id == current_user.id
        ).first()
        
        if existing_repo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Repository with this name already exists"
            )
        
        # Create repository - use model_dump() instead of dict() for Pydantic v2
        repo_dict = repo_data.model_dump() if hasattr(repo_data, 'model_dump') else repo_data.dict()
        db_repo = RepositoryModel(
            **repo_dict,
            owner_id=current_user.id
        )
        
        db.add(db_repo)
        db.commit()
        db.refresh(db_repo)

        logger.info(f"Repository created successfully: {db_repo.id}")

        # Audit log for repository creation
        log_activity(
            db=db,
            action="repository_create",
            user_id=current_user.id,
            repository_id=db_repo.id,
            details={
                "repository_id": db_repo.id,
                "name": db_repo.name,
                "is_private": db_repo.is_private
            }
        )
        
        return db_repo

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating repository: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create repository"
        )


@router.get("/", response_model=List[Repository])
async def list_repositories(
    skip: int = 0,
    limit: int = 100,
    is_private: Optional[bool] = None,
    owner_id: Optional[str] = None,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """List repositories with optional filters"""
    try:
        logger.info(f"Listing repositories for user: {current_user.email}")
        
        query = db.query(RepositoryModel).options(
            joinedload(RepositoryModel.owner),
            joinedload(RepositoryModel.collaborators)
        )

        # Filter by privacy (only show public repos unless user is owner/collaborator)
        if is_private is not None:
            query = query.filter(RepositoryModel.is_private == is_private)
        else:
            # Show public repos + user's private repos + repos shared with user
            query = query.filter(
                (RepositoryModel.is_private == False) |
                (RepositoryModel.owner_id == current_user.id) |
                (RepositoryModel.collaborators.any(RepositoryCollaborator.user_id == current_user.id))
            )
        
        if owner_id:
            query = query.filter(RepositoryModel.owner_id == owner_id)
        
        repositories = query.offset(skip).limit(limit).all()
        
        logger.info(f"Found {len(repositories)} repositories")
        return repositories

    except Exception as e:
        logger.error(f"Error listing repositories: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve repositories"
        )


@router.get("/{repo_id}", response_model=Repository)
async def get_repository(
    repo_id: str,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Get repository by ID"""
    try:
        repo = db.query(RepositoryModel).options(
            joinedload(RepositoryModel.owner),
            joinedload(RepositoryModel.collaborators)
        ).filter(RepositoryModel.id == repo_id).first()

        if not repo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Repository not found"
            )
        
        # Check access permissions for private repos
        if repo.is_private and repo.owner_id != current_user.id:
            is_collaborator = db.query(RepositoryCollaborator).filter(
                RepositoryCollaborator.repository_id == repo_id,
                RepositoryCollaborator.user_id == current_user.id
            ).first()
            
            if not is_collaborator:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to private repository"
                )
        
        return repo

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting repository {repo_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve repository"
        )


@router.put("/{repo_id}", response_model=Repository)
async def update_repository(
    repo_id: str,
    repo_update: RepositoryUpdate,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Update repository (owner only)"""
    try:
        repo = db.query(RepositoryModel).filter(RepositoryModel.id == repo_id).first()
        
        if not repo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Repository not found"
            )
        
        if repo.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only repository owner can update repository"
            )
        
        # Use model_dump() for Pydantic v2 compatibility
        update_data = repo_update.model_dump(exclude_unset=True) if hasattr(repo_update, 'model_dump') else repo_update.dict(exclude_unset=True)
        
        # Check if name is being changed and if it's unique
        if "name" in update_data:
            existing_repo = db.query(RepositoryModel).filter(
                RepositoryModel.name == update_data["name"],
                RepositoryModel.owner_id == current_user.id,
                RepositoryModel.id != repo_id
            ).first()
            if existing_repo:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Repository with this name already exists"
                )
        
        for field, value in update_data.items():
            setattr(repo, field, value)
        
        db.commit()
        db.refresh(repo)

        # Audit log for repository update
        log_activity(
            db=db,
            action="repository_update",
            user_id=current_user.id,
            repository_id=repo.id,
            details={
                "repository_id": repo.id,
                "name": repo.name,
                "updated_fields": list(update_data.keys())
            }
        )
        
        return repo

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating repository {repo_id}: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update repository"
        )


@router.delete("/{repo_id}")
async def delete_repository(
    repo_id: str,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Delete repository (owner only)"""
    try:
        repo = db.query(RepositoryModel).filter(RepositoryModel.id == repo_id).first()
        
        if not repo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Repository not found"
            )
        
        if repo.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only repository owner can delete repository"
            )
        
        # Store repo info for audit log before deletion
        repo_name = repo.name
        
        db.delete(repo)
        db.commit()

        # Audit log for repository deletion
        log_activity(
            db=db,
            action="repository_delete",
            user_id=current_user.id,
            repository_id=repo_id,
            details={
                "repository_id": repo_id,
                "name": repo_name
            }
        )
        
        return {"message": "Repository deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting repository {repo_id}: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete repository"
        )


@router.post("/{repo_id}/fork", response_model=Repository, status_code=status.HTTP_201_CREATED)
async def fork_repository(
    repo_id: str,
    current_user: UserModel = Depends(contributor_required),
    db: Session = Depends(get_db)
):
    """Fork a repository"""
    try:
        original_repo = db.query(RepositoryModel).options(
            joinedload(RepositoryModel.owner)
        ).filter(RepositoryModel.id == repo_id).first()
        
        if not original_repo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Repository not found"
            )
        
        # Check if user already has a fork
        existing_fork = db.query(RepositoryModel).filter(
            RepositoryModel.forked_from_id == repo_id,
            RepositoryModel.owner_id == current_user.id
        ).first()
        
        if existing_fork:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have a fork of this repository"
            )
        
        # Create fork with unique name
        fork_name = f"{original_repo.name}-fork"
        counter = 1
        while db.query(RepositoryModel).filter(
            RepositoryModel.name == fork_name,
            RepositoryModel.owner_id == current_user.id
        ).first():
            fork_name = f"{original_repo.name}-fork-{counter}"
            counter += 1
        
        fork_repo = RepositoryModel(
            name=fork_name,
            description=f"Fork of {original_repo.owner.username}/{original_repo.name}",
            owner_id=current_user.id,
            is_private=original_repo.is_private,
            forked_from_id=repo_id
        )
        
        db.add(fork_repo)
        
        # Increment fork count on original repo
        original_repo.fork_count += 1
        
        db.commit()
        db.refresh(fork_repo)

        # Audit log for repository fork
        log_activity(
            db=db,
            action="repository_fork",
            user_id=current_user.id,
            repository_id=fork_repo.id,
            details={
                "forked_from_id": repo_id,
                "fork_id": fork_repo.id,
                "fork_name": fork_repo.name
            }
        )
        
        return fork_repo

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error forking repository {repo_id}: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fork repository"
        )