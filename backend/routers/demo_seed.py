from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from datetime import datetime

from database import get_db
from auth import verify_clerk_token
from models import (
    Repository as RepositoryModel,
    User as UserModel,
    RepositoryFile as RepositoryFileModel,
    MergeRequest as MergeRequestModel,
)

router = APIRouter()

DEMO_REPO_NAME = "Malware Case Demo"


def _ensure_demo_repo(db: Session, user: UserModel) -> RepositoryModel:
    repo = (
        db.query(RepositoryModel)
        .filter(RepositoryModel.name == DEMO_REPO_NAME, RepositoryModel.owner_id == user.id)
        .first()
    )
    if repo:
        return repo
    repo = RepositoryModel(
        name=DEMO_REPO_NAME,
        description="Demonstration repository showing the merge request + AI validation workflow for an OSINT malware case.",
        owner_id=user.id,
        is_private=False,
    )
    db.add(repo)
    db.commit()
    db.refresh(repo)
    return repo


def _create_file(db: Session, repo: RepositoryModel, user: UserModel, *, name: str, path: str, content: str, file_type: str) -> RepositoryFileModel:
    existing = (
        db.query(RepositoryFileModel)
        .filter(RepositoryFileModel.repository_id == repo.id, RepositoryFileModel.path == path)
        .first()
    )
    if existing:
        return existing
    f = RepositoryFileModel(
        repository_id=repo.id,
        name=name,
        path=path,
        content=content,
        file_type=file_type,
        size=len(content.encode("utf-8")),
        author_id=user.id,
    )
    db.add(f)
    db.commit()
    db.refresh(f)
    return f


def _create_mr(
    db: Session,
    user: UserModel,
    repo: RepositoryModel,
    *,
    title: str,
    description: str,
    status: str = "open",
    ai_status: str = "pending",
    score: float = 0.0,
    feedback: str = "",
    suggestions: List[str] | None = None,
    concerns: List[str] | None = None,
) -> MergeRequestModel:
    mr = MergeRequestModel(
        title=title,
        description=description,
        author_id=user.id,
        source_repo_id=repo.id,
        target_repo_id=repo.id,
        status=status,
        ai_validation_status=ai_status,
        ai_validation_score=score,
        ai_validation_feedback=feedback,
        ai_validation_suggestions=suggestions or [],
        ai_validation_concerns=concerns or [],
    )
    db.add(mr)
    db.commit()
    db.refresh(mr)
    return mr


@router.post("/seed", summary="Seed demo repository & merge requests")
async def seed_demo(current_user: UserModel = Depends(verify_clerk_token), db: Session = Depends(get_db)) -> Dict:
    """Create (or return) a demo repository with representative merge requests.

    This avoids triggering real AI validation calls by directly populating
    the ai_validation* columns for different workflow states.
    """
    repo = _ensure_demo_repo(db, current_user)

    # Core demo files
    _create_file(
        db,
        repo,
        current_user,
        name="README.md",
        path="README.md",
        content=(
            "# Malware Case Demo\n\n"
            "This repository demonstrates the investigative workflow.\n\n"
            "## Contents\n- indicators.json\n- timeline.md\n- analysis/initial_report.md\n\n"
            "Use the existing merge requests to explore: approved, rejected, needs_review, merged, and closed states.\n"
        ),
        file_type="markdown",
    )
    _create_file(
        db,
        repo,
        current_user,
        name="indicators.json",
        path="indicators.json",
        content=(
            '{"domains": ["bad-domain.test", "malicious.example"], "hashes": ["abcd1234..."], "notes": "Seed IOC list"}'
        ),
        file_type="json",
    )
    _create_file(
        db,
        repo,
        current_user,
        name="timeline.md",
        path="timeline.md",
        content=(
            "# Incident Timeline\n\n- Day 1: Suspicious login observed\n- Day 2: Malware sample retrieved\n- Day 3: Lateral movement detected\n"
        ),
        file_type="markdown",
    )
    _create_file(
        db,
        repo,
        current_user,
        name="analysis_initial.md",
        path="analysis/initial_report.md",
        content=(
            "# Initial Malware Analysis\n\nSample appears to use HTTP beaconing. Additional sandboxing required.\n"
        ),
        file_type="markdown",
    )

    # Prevent duplicate seeding of MRs by checking if any exist already for this repo
    existing_mr_count = (
        db.query(MergeRequestModel)
        .filter(MergeRequestModel.source_repo_id == repo.id, MergeRequestModel.target_repo_id == repo.id)
        .count()
    )
    created = []
    if existing_mr_count == 0:
        created.append(
            _create_mr(
                db,
                current_user,
                repo,
                title="Add initial malware analysis",
                description="Adds initial static and dynamic analysis findings.",
                ai_status="approved",
                score=82,
                feedback="Analysis is sufficiently detailed for initial review.",
                suggestions=["Add hash classification", "Provide sandbox run artifacts"],
            )
        )
        created.append(
            _create_mr(
                db,
                current_user,
                repo,
                title="Add suspicious domain list",
                description="Proposes additional domains observed in telemetry.",
                ai_status="needs_review",
                score=55,
                feedback="Domain context missing (no source / timestamp).",
                suggestions=["Add source logs", "Cite observation timeframe"],
                concerns=["Potential false positives"],
            )
        )
        created.append(
            _create_mr(
                db,
                current_user,
                repo,
                title="Refine IOC classification",
                description="Refactors indicator categories (pending validation).",
                ai_status="pending",
                score=0,
                feedback="Awaiting AI validation run.",
            )
        )
        created.append(
            _create_mr(
                db,
                current_user,
                repo,
                title="Remove duplicate indicators",
                description="Removes redundant entries from indicators.json.",
                status="closed",
                ai_status="approved",
                score=74,
                feedback="Closed after author withdrew in favor of consolidated MR.",
            )
        )
        created.append(
            _create_mr(
                db,
                current_user,
                repo,
                title="Finalize analysis section",
                description="Adds structured sections and improved scoring logic.",
                status="merged",
                ai_status="approved",
                score=91,
                feedback="High quality documentation merged.",
                suggestions=["Consider adding ATT&CK mapping"],
            )
        )

    return {
        "repository": {"id": repo.id, "name": repo.name},
        "merge_requests_created": [mr.id for mr in created],
        "existing_merge_requests": existing_mr_count if existing_mr_count else 0,
        "message": "Demo data ready",
    }
