from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from database import get_db
from models import Commit, CommitFile, CommitGraph, Repository as RepositoryModel, User as UserModel
from schemas import Commit as CommitSchema, CommitFile as CommitFileSchema, CommitGraph as CommitGraphSchema, GraphData
from auth import verify_clerk_token, contributor_required
from commit_graph_service import CommitGraphService
from audit import log_activity

router = APIRouter()

@router.post("/repositories/{repository_id}/commits/import")
async def import_commits_from_repo(
    repository_id: str,
    repo_path: str,
    max_commits: int = Query(5, ge=1, le=20),
    current_user: UserModel = Depends(contributor_required),
    db: Session = Depends(get_db)
):
    """Import commits from a git repository path"""
    
    # Check if repository exists and user has access
    repo = db.query(RepositoryModel).filter(RepositoryModel.id == repository_id).first()
    if not repo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found"
        )
    
    # Check permissions
    if repo.owner_id != current_user.id:
        from models import RepositoryCollaborator
        is_collaborator = db.query(RepositoryCollaborator).filter(
            RepositoryCollaborator.repository_id == repository_id,
            RepositoryCollaborator.user_id == current_user.id
        ).first()
        if not is_collaborator:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to import commits"
            )
    
    try:
        graph_service = CommitGraphService(db)
        commits = graph_service.add_commits_from_repo(repository_id, repo_path, max_commits)
        
        # Create file relationships
        graph_service.create_file_relationships(repository_id)
        
        # Audit log
        log_activity(
            db=db,
            action="commits_import",
            user_id=current_user.id,
            repository_id=repository_id,
            details={
                "repo_path": repo_path,
                "commits_imported": len(commits),
                "max_commits": max_commits
            }
        )
        
        return {
            "message": f"Successfully imported {len(commits)} commits",
            "commits": [CommitSchema.from_orm(commit) for commit in commits]
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to import commits: {str(e)}"
        )

@router.post("/repositories/{repository_id}/commits")
async def create_commit(
    repository_id: str,
    commit_data: dict,
    current_user: UserModel = Depends(contributor_required),
    db: Session = Depends(get_db)
):
    """Create a new commit manually"""
    
    # Check if repository exists and user has access
    repo = db.query(RepositoryModel).filter(RepositoryModel.id == repository_id).first()
    if not repo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found"
        )
    
    try:
        commit = Commit(
            repository_id=repository_id,
            sha=commit_data["sha"],
            message=commit_data["message"],
            author_id=current_user.id,
            timestamp=commit_data["timestamp"],
            parent_sha=commit_data.get("parent_sha")
        )
        db.add(commit)
        db.commit()
        db.refresh(commit)
        
        # Audit log
        log_activity(
            db=db,
            action="commit_create",
            user_id=current_user.id,
            repository_id=repository_id,
            details={
                "commit_sha": commit.sha,
                "message": commit.message
            }
        )
        
        return CommitSchema.from_orm(commit)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create commit: {str(e)}"
        )

@router.get("/repositories/{repository_id}/commits", response_model=List[CommitSchema])
async def list_commits(
    repository_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """List commits for a repository"""
    
    # Check if repository exists and user has access
    repo = db.query(RepositoryModel).filter(RepositoryModel.id == repository_id).first()
    if not repo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found"
        )
    
    # Check access permissions for private repos
    if repo.is_private and repo.owner_id != current_user.id:
        from models import RepositoryCollaborator
        is_collaborator = db.query(RepositoryCollaborator).filter(
            RepositoryCollaborator.repository_id == repository_id,
            RepositoryCollaborator.user_id == current_user.id
        ).first()
        if not is_collaborator:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to private repository"
            )
    
    commits = db.query(Commit).filter(
        Commit.repository_id == repository_id
    ).order_by(Commit.timestamp.desc()).offset(skip).limit(limit).all()
    
    return [CommitSchema.from_orm(commit) for commit in commits]

@router.get("/repositories/{repository_id}/commits/{commit_id}", response_model=CommitSchema)
async def get_commit(
    repository_id: str,
    commit_id: str,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Get a specific commit"""
    
    commit = db.query(Commit).filter(
        Commit.id == commit_id,
        Commit.repository_id == repository_id
    ).first()
    
    if not commit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commit not found"
        )
    
    return CommitSchema.from_orm(commit)

@router.get("/repositories/{repository_id}/commits/{commit_id}/files", response_model=List[CommitFileSchema])
async def get_commit_files(
    repository_id: str,
    commit_id: str,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Get files for a specific commit"""
    
    # Check if commit exists and belongs to repository
    commit = db.query(Commit).filter(
        Commit.id == commit_id,
        Commit.repository_id == repository_id
    ).first()
    
    if not commit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commit not found"
        )
    
    commit_files = db.query(CommitFile).filter(
        CommitFile.commit_id == commit_id
    ).all()
    
    return [CommitFileSchema.from_orm(cf) for cf in commit_files]

@router.post("/repositories/{repository_id}/graph/generate")
async def generate_commit_graph(
    repository_id: str,
    max_commits: int = Query(10, ge=1, le=50),
    current_user: UserModel = Depends(contributor_required),
    db: Session = Depends(get_db)
):
    """Generate commit graph for a repository"""
    
    # Check if repository exists and user has access
    repo = db.query(RepositoryModel).filter(RepositoryModel.id == repository_id).first()
    if not repo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found"
        )
    
    try:
        graph_service = CommitGraphService(db)
        graph_data = graph_service.generate_commit_graph(repository_id, max_commits)
        
        # Save graph to database
        commit_graph = graph_service.save_commit_graph(repository_id, graph_data)
        
        # Audit log
        log_activity(
            db=db,
            action="commit_graph_generate",
            user_id=current_user.id,
            repository_id=repository_id,
            details={
                "max_commits": max_commits,
                "node_count": len(graph_data.get("nodes", [])),
                "edge_count": len(graph_data.get("edges", []))
            }
        )
        
        return {
            "message": "Commit graph generated successfully",
            "graph": graph_data,
            "graph_id": commit_graph.id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate commit graph: {str(e)}"
        )

@router.get("/repositories/{repository_id}/graph", response_model=CommitGraphSchema)
async def get_commit_graph(
    repository_id: str,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Get commit graph for a repository"""
    
    # Check if repository exists and user has access
    repo = db.query(RepositoryModel).filter(RepositoryModel.id == repository_id).first()
    if not repo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found"
        )
    
    # Check access permissions for private repos
    if repo.is_private and repo.owner_id != current_user.id:
        from models import RepositoryCollaborator
        is_collaborator = db.query(RepositoryCollaborator).filter(
            RepositoryCollaborator.repository_id == repository_id,
            RepositoryCollaborator.user_id == current_user.id
        ).first()
        if not is_collaborator:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to private repository"
            )
    
    graph_service = CommitGraphService(db)
    commit_graph = graph_service.get_commit_graph(repository_id)
    
    if not commit_graph:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commit graph not found. Generate one first."
        )
    
    return CommitGraphSchema.from_orm(commit_graph)

@router.get("/repositories/{repository_id}/graph/statistics")
async def get_graph_statistics(
    repository_id: str,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Get statistics about the commit graph"""
    
    # Check if repository exists and user has access
    repo = db.query(RepositoryModel).filter(RepositoryModel.id == repository_id).first()
    if not repo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found"
        )
    
    # Check access permissions for private repos
    if repo.is_private and repo.owner_id != current_user.id:
        from models import RepositoryCollaborator
        is_collaborator = db.query(RepositoryCollaborator).filter(
            RepositoryCollaborator.repository_id == repository_id,
            RepositoryCollaborator.user_id == current_user.id
        ).first()
        if not is_collaborator:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to private repository"
            )
    
    graph_service = CommitGraphService(db)
    statistics = graph_service.get_graph_statistics(repository_id)
    
    return statistics

@router.delete("/repositories/{repository_id}/graph")
async def delete_commit_graph(
    repository_id: str,
    current_user: UserModel = Depends(contributor_required),
    db: Session = Depends(get_db)
):
    """Delete commit graph for a repository"""
    
    # Check if repository exists and user has access
    repo = db.query(RepositoryModel).filter(RepositoryModel.id == repository_id).first()
    if not repo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found"
        )
    
    # Check permissions
    if repo.owner_id != current_user.id:
        from models import RepositoryCollaborator
        is_collaborator = db.query(RepositoryCollaborator).filter(
            RepositoryCollaborator.repository_id == repository_id,
            RepositoryCollaborator.user_id == current_user.id
        ).first()
        if not is_collaborator:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to delete commit graph"
            )
    
    commit_graph = db.query(CommitGraph).filter(
        CommitGraph.repository_id == repository_id
    ).first()
    
    if commit_graph:
        db.delete(commit_graph)
        db.commit()
        
        # Audit log
        log_activity(
            db=db,
            action="commit_graph_delete",
            user_id=current_user.id,
            repository_id=repository_id,
            details={"graph_id": commit_graph.id}
        )
        
        return {"message": "Commit graph deleted successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Commit graph not found"
        )
