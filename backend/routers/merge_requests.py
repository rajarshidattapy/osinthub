from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models import MergeRequest as MergeRequestModel, User as UserModel, Repository as RepositoryModel, Comment as CommentModel
from schemas import MergeRequest, MergeRequestCreate, MergeRequestUpdate, MergeRequestStatus, Comment, CommentCreate
from auth import verify_clerk_token, contributor_required
from ai_service import AIService

router = APIRouter()
ai_service = AIService()

@router.post("/", response_model=MergeRequest)
async def create_merge_request(
    mr_data: MergeRequestCreate,
    current_user: UserModel = Depends(contributor_required),
    db: Session = Depends(get_db)
):
    """Create a new merge request"""
    # Verify source and target repositories exist
    source_repo = db.query(RepositoryModel).filter(RepositoryModel.id == mr_data.source_repo_id).first()
    target_repo = db.query(RepositoryModel).filter(RepositoryModel.id == mr_data.target_repo_id).first()
    
    if not source_repo or not target_repo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source or target repository not found"
        )
    
    # Create merge request
    db_mr = MergeRequestModel(
        **mr_data.dict(),
        author_id=current_user.id
    )
    
    # Perform AI validation
    try:
        ai_validation = await ai_service.validate_merge_request(
            title=mr_data.title,
            description=mr_data.description or "",
            file_changes=[],  # Will be populated when files are added
            source_repo_description=source_repo.description or "",
            target_repo_description=target_repo.description or ""
        )
        
        # Update merge request with AI validation results
        db_mr.ai_validation_status = ai_validation["status"]
        db_mr.ai_validation_score = ai_validation["score"]
        db_mr.ai_validation_feedback = ai_validation["feedback"]
        db_mr.ai_validation_concerns = ai_validation["concerns"]
        db_mr.ai_validation_suggestions = ai_validation["suggestions"]
        
    except Exception as e:
        # If AI validation fails, set status to needs_review
        db_mr.ai_validation_status = "needs_review"
        db_mr.ai_validation_feedback = f"AI validation failed: {str(e)}"
    
    db.add(db_mr)
    db.commit()
    db.refresh(db_mr)
    
    return db_mr

@router.get("/", response_model=List[MergeRequest])
async def list_merge_requests(
    skip: int = 0,
    limit: int = 100,
    status: Optional[MergeRequestStatus] = None,
    repository_id: Optional[str] = None,
    author_id: Optional[str] = None,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """List merge requests with optional filters"""
    query = db.query(MergeRequestModel)
    
    if status:
        query = query.filter(MergeRequestModel.status == status)
    
    if repository_id:
        query = query.filter(
            (MergeRequestModel.source_repo_id == repository_id) |
            (MergeRequestModel.target_repo_id == repository_id)
        )
    
    if author_id:
        query = query.filter(MergeRequestModel.author_id == author_id)
    
    merge_requests = query.offset(skip).limit(limit).all()
    return merge_requests

@router.get("/{mr_id}", response_model=MergeRequest)
async def get_merge_request(
    mr_id: str,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Get merge request by ID"""
    mr = db.query(MergeRequestModel).filter(MergeRequestModel.id == mr_id).first()
    
    if not mr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merge request not found"
        )
    
    return mr

@router.put("/{mr_id}", response_model=MergeRequest)
async def update_merge_request(
    mr_id: str,
    mr_update: MergeRequestUpdate,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Update merge request"""
    mr = db.query(MergeRequestModel).filter(MergeRequestModel.id == mr_id).first()
    
    if not mr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merge request not found"
        )
    
    # Check permissions (author or target repo owner can update)
    if mr.author_id != current_user.id and mr.target_repo.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to update this merge request"
        )
    
    update_data = mr_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(mr, field, value)
    
    db.commit()
    db.refresh(mr)
    
    return mr

@router.post("/{mr_id}/merge")
async def merge_request(
    mr_id: str,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Merge a merge request (target repo owner only)"""
    mr = db.query(MergeRequestModel).filter(MergeRequestModel.id == mr_id).first()
    
    if not mr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merge request not found"
        )
    
    if mr.target_repo.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only target repository owner can merge"
        )
    
    if mr.status != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only open merge requests can be merged"
        )
    
    # Check AI validation status
    if mr.ai_validation_status == "rejected":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot merge: AI validation rejected this request"
        )
    
    if mr.ai_validation_status == "needs_review":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot merge: AI validation requires manual review"
        )
    
    # Update status to merged
    mr.status = "merged"
    db.commit()
    
    return {"message": "Merge request merged successfully"}

@router.post("/{mr_id}/close")
async def close_merge_request(
    mr_id: str,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Close a merge request"""
    mr = db.query(MergeRequestModel).filter(MergeRequestModel.id == mr_id).first()
    
    if not mr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merge request not found"
        )
    
    # Check permissions (author or target repo owner can close)
    if mr.author_id != current_user.id and mr.target_repo.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to close this merge request"
        )
    
    if mr.status != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only open merge requests can be closed"
        )
    
    # Update status to closed
    mr.status = "closed"
    db.commit()
    
    return {"message": "Merge request closed successfully"}

@router.post("/{mr_id}/validate")
async def validate_merge_request(
    mr_id: str,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Trigger AI validation for a merge request"""
    mr = db.query(MergeRequestModel).filter(MergeRequestModel.id == mr_id).first()
    
    if not mr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merge request not found"
        )
    
    # Get source and target repositories
    source_repo = db.query(RepositoryModel).filter(RepositoryModel.id == mr.source_repo_id).first()
    target_repo = db.query(RepositoryModel).filter(RepositoryModel.id == mr.target_repo_id).first()
    
    if not source_repo or not target_repo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source or target repository not found"
        )
    
    # Get file changes for this merge request
    file_changes = []
    if hasattr(mr, 'file_changes'):
        for change in mr.file_changes:
            file_changes.append({
                "change_type": change.change_type,
                "file_path": change.file_path,
                "diff_content": change.diff_content
            })
    
    # Perform AI validation
    try:
        ai_validation = await ai_service.validate_merge_request(
            title=mr.title,
            description=mr.description or "",
            file_changes=file_changes,
            source_repo_description=source_repo.description or "",
            target_repo_description=target_repo.description or ""
        )
        
        # Update merge request with AI validation results
        mr.ai_validation_status = ai_validation["status"]
        mr.ai_validation_score = ai_validation["score"]
        mr.ai_validation_feedback = ai_validation["feedback"]
        mr.ai_validation_concerns = ai_validation["concerns"]
        mr.ai_validation_suggestions = ai_validation["suggestions"]
        
        db.commit()
        db.refresh(mr)
        
        return {
            "message": "AI validation completed",
            "validation_result": ai_validation
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI validation failed: {str(e)}"
        )

@router.post("/{mr_id}/comments", response_model=Comment)
async def add_comment(
    mr_id: str,
    comment_data: CommentCreate,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Add a comment to a merge request"""
    mr = db.query(MergeRequestModel).filter(MergeRequestModel.id == mr_id).first()
    if not mr:
        raise HTTPException(status_code=404, detail="Merge request not found")
    db_comment = CommentModel(
        merge_request_id=mr_id,
        author_id=current_user.id,
        content=comment_data.content,
        line_number=comment_data.line_number,
        file_path=comment_data.file_path
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment
