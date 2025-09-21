from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional, List

from ..database import get_db
from ..models import Repository as RepositoryModel, RepositoryFile as RepositoryFileModel, MergeRequest as MergeRequestModel, User as UserModel
from ..auth import verify_clerk_token

router = APIRouter()

@router.get("/search")
async def search_content(
    q: str = Query(..., min_length=3),
    type: Optional[str] = Query(None),  # "repositories", "files", "merge_requests"
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Full-text search across repositories, files, and merge requests"""
    results = {}
    query_str = f"%{q.lower()}%"

    if type in (None, "repositories"):
        repos = db.query(RepositoryModel).filter(
            or_(func.lower(RepositoryModel.name).like(query_str),
                func.lower(RepositoryModel.description).like(query_str))
        ).all()
        results["repositories"] = repos

    if type in (None, "files"):
        files = db.query(RepositoryFileModel).filter(
            or_(func.lower(RepositoryFileModel.name).like(query_str),
                func.lower(RepositoryFileModel.content).like(query_str),
                func.lower(RepositoryFileModel.path).like(query_str))
        ).all()
        results["files"] = files

    if type in (None, "merge_requests"):
        mrs = db.query(MergeRequestModel).filter(
            or_(func.lower(MergeRequestModel.title).like(query_str),
                func.lower(MergeRequestModel.description).like(query_str))
        ).all()
        results["merge_requests"] = mrs

    return results

