from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import Repository as RepositoryModel, User as UserModel, RepositoryCollaborator
from schemas import Repository, RepositoryCreate, RepositoryUpdate
from auth import verify_clerk_token, contributor_required

router = APIRouter()

@router.post("/", response_model=Repository)
async def create_repository(
    repo_data: RepositoryCreate,
    current_user: UserModel = Depends(contributor_required),
    db: Session = Depends(get_db)
):
    """Create a new repository"""
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
    
    # Create repository
    db_repo = RepositoryModel(
        **repo_data.dict(),
        owner_id=current_user.id
    )
    db.add(db_repo)
    db.commit()
    db.refresh(db_repo)
    # Audit log for repository creation
    from ..audit import log_activity
    log_activity(
        db=db,
        action="repository_create",
        user_id=current_user.id,
        repository_id=db_repo.id,
        details={
            "repository_id": db_repo.id,
            "name": db_repo.name
        }
    )
    return db_repo

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
    query = db.query(RepositoryModel)
    
    # Filter by privacy (only show public repos unless user is owner/collaborator)
    if is_private is not None:
        query = query.filter(RepositoryModel.is_private == is_private)
    else:
        # Show public repos and private repos where user is owner/collaborator
        query = query.filter(
            (RepositoryModel.is_private == False) |
            (RepositoryModel.owner_id == current_user.id) |
            (RepositoryModel.collaborators.any(RepositoryCollaborator.user_id == current_user.id))
        )
    
    if owner_id:
        query = query.filter(RepositoryModel.owner_id == owner_id)
    
    repositories = query.offset(skip).limit(limit).all()
    return repositories

@router.get("/{repo_id}", response_model=Repository)
async def get_repository(
    repo_id: str,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Get repository by ID"""
    repo = db.query(RepositoryModel).filter(RepositoryModel.id == repo_id).first()
    
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

@router.put("/{repo_id}", response_model=Repository)
async def update_repository(
    repo_id: str,
    repo_update: RepositoryUpdate,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Update repository (owner only)"""
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
    
    update_data = repo_update.dict(exclude_unset=True)
    
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
    from ..audit import log_activity
    log_activity(
        db=db,
        action="repository_update",
        user_id=current_user.id,
        repository_id=repo.id,
        details={
            "repository_id": repo.id,
            "name": repo.name
        }
    )
    return repo

@router.delete("/{repo_id}")
async def delete_repository(
    repo_id: str,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Delete repository (owner only)"""
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
    
    db.delete(repo)
    db.commit()
    # Audit log for repository deletion
    from ..audit import log_activity
    log_activity(
        db=db,
        action="repository_delete",
        user_id=current_user.id,
        repository_id=repo.id,
        details={
            "repository_id": repo.id,
            "name": repo.name
        }
    )
    return {"message": "Repository deleted successfully"}

@router.post("/{repo_id}/fork", response_model=Repository)
async def fork_repository(
    repo_id: str,
    current_user: UserModel = Depends(contributor_required),
    db: Session = Depends(get_db)
):
    """Fork a repository"""
    original_repo = db.query(RepositoryModel).filter(RepositoryModel.id == repo_id).first()
    
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
    
    # Create fork
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
    from ..audit import log_activity
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