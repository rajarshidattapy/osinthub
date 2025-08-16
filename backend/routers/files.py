from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import RepositoryFile as RepositoryFileModel, User as UserModel, Repository as RepositoryModel, RepositoryCollaborator
from schemas import RepositoryFile, RepositoryFileCreate, RepositoryFileUpdate
from auth import verify_clerk_token, contributor_required

router = APIRouter()

@router.post("/", response_model=RepositoryFile)
async def create_file(
    file_data: RepositoryFileCreate,
    current_user: UserModel = Depends(contributor_required),
    db: Session = Depends(get_db)
):
    """Create a new file in repository"""
    # Check if repository exists and user has access
    repo = db.query(RepositoryModel).filter(RepositoryModel.id == file_data.repository_id).first()
    
    if not repo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found"
        )
    
    # Check permissions (owner or collaborator)
    if repo.owner_id != current_user.id:
        is_collaborator = db.query(RepositoryCollaborator).filter(
            RepositoryCollaborator.repository_id == file_data.repository_id,
            RepositoryCollaborator.user_id == current_user.id
        ).first()
        
        if not is_collaborator:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to create files in this repository"
            )
    
    # Check if file already exists at this path
    existing_file = db.query(RepositoryFileModel).filter(
        RepositoryFileModel.repository_id == file_data.repository_id,
        RepositoryFileModel.path == file_data.path
    ).first()
    
    if existing_file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File already exists at this path"
        )
    
    # Create file
    db_file = RepositoryFileModel(
        **file_data.dict(),
        author_id=current_user.id,
        size=len(file_data.content.encode('utf-8'))
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    return db_file

@router.get("/repository/{repo_id}", response_model=List[RepositoryFile])
async def list_repository_files(
    repo_id: str,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """List all files in a repository"""
    # Check if repository exists and user has access
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
    
    files = db.query(RepositoryFileModel).filter(RepositoryFileModel.repository_id == repo_id).all()
    return files

@router.get("/{file_id}", response_model=RepositoryFile)
async def get_file(
    file_id: str,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Get file by ID"""
    file = db.query(RepositoryFileModel).filter(RepositoryFileModel.id == file_id).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Check repository access
    repo = file.repository
    if repo.is_private and repo.owner_id != current_user.id:
        is_collaborator = db.query(RepositoryCollaborator).filter(
            RepositoryCollaborator.repository_id == repo.id,
            RepositoryCollaborator.user_id == current_user.id
        ).first()
        
        if not is_collaborator:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to private repository"
            )
    
    return file

@router.put("/{file_id}", response_model=RepositoryFile)
async def update_file(
    file_id: str,
    file_update: RepositoryFileUpdate,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Update file content"""
    file = db.query(RepositoryFileModel).filter(RepositoryFileModel.id == file_id).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Check permissions (owner or collaborator)
    repo = file.repository
    if repo.owner_id != current_user.id:
        is_collaborator = db.query(RepositoryCollaborator).filter(
            RepositoryCollaborator.repository_id == repo.id,
            RepositoryCollaborator.user_id == current_user.id
        ).first()
        
        if not is_collaborator:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to update this file"
            )
    
    update_data = file_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(file, field, value)
    
    # Update file size if content changed
    if "content" in update_data:
        file.size = len(file.content.encode('utf-8'))
    
    db.commit()
    db.refresh(file)
    
    return file

@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Delete file"""
    file = db.query(RepositoryFileModel).filter(RepositoryFileModel.id == file_id).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Check permissions (owner or collaborator)
    repo = file.repository
    if repo.owner_id != current_user.id:
        is_collaborator = db.query(RepositoryCollaborator).filter(
            RepositoryCollaborator.repository_id == repo.id,
            RepositoryCollaborator.user_id == current_user.id
        ).first()
        
        if not is_collaborator:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to delete this file"
            )
    
    db.delete(file)
    db.commit()
    
    return {"message": "File deleted successfully"}