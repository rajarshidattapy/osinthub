# backend/routers/dashboard.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone

from database import get_db
from models import (
    Repository as RepositoryModel, 
    MergeRequest as MergeRequestModel,
    User as UserModel,
    AuditEntry
)
from auth import verify_clerk_token

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(verify_clerk_token)
):
    """
    Gathers and returns all the necessary statistics for the main dashboard.
    """
    
    # --- 1. KPI Data ---
    
    # Ingested Items (24h) - Let's define this as new repositories created in the last 24h
    twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
    ingested_items_count = db.query(RepositoryModel).filter(
        RepositoryModel.created_at >= twenty_four_hours_ago
    ).count()

    # Active Cases - Repositories updated in the last 7 days
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    active_cases_count = db.query(RepositoryModel).filter(
        RepositoryModel.updated_at >= seven_days_ago
    ).count()

    # Open Merge Requests
    open_merge_requests_count = db.query(MergeRequestModel).filter(
        MergeRequestModel.status == 'open'
    ).count()
    
    # For Avg. Lead Time and Investigator Efficiency, we'll use dummy data for now
    # as the calculation can be complex.
    avg_lead_time = "3.4d" 
    investigator_efficiency = 82

    kpis = {
        "ingestedItems": {"value": ingested_items_count, "delta": "+8.2%", "positive": True},
        "activeCases": {"value": active_cases_count, "delta": "-5.1%", "positive": False},
        "openMergeRequests": {"value": open_merge_requests_count, "delta": "+2", "positive": True},
        "avgLeadTime": {"value": avg_lead_time, "delta": "-0.3d", "positive": True},
        "investigatorEfficiency": {"value": investigator_efficiency, "delta": "+4", "positive": True},
    }

    # --- 2. Activity Timeline ---
    # Fetch recent audit entries
    recent_activity = db.query(AuditEntry).order_by(AuditEntry.created_at.desc()).limit(10).all()
    
    # Format activity data for the frontend
    now_utc = datetime.now(timezone.utc)
    activity_timeline = []
    for entry in recent_activity:
        created = entry.created_at
        # Normalize to aware UTC
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        # Some DB backends may return offset-aware already; ensure conversion
        created_utc = created.astimezone(timezone.utc)
        delta = now_utc - created_utc
        hours = int(delta.total_seconds() // 3600)
        if hours < 1:
            when = "<1h ago"
        elif hours < 24:
            when = f"{hours}h ago"
        else:
            days = hours // 24
            when = f"{days}d ago"
        activity_timeline.append({
            "id": str(entry.id),
            "type": "upload",  # TODO: derive from action
            "actor": entry.user.username if entry.user else "Unknown",
            "when": when,
            "text": entry.action.replace("_", " ")
        })

    # --- 3. Chart Data (Using Dummy Data for now) ---
    # Generating realistic chart data from the DB can be complex. We'll start with mock data.
    
    ingest_volume = [
        {"date": "2025-07-01", "web": 100, "social": 80, "darkweb": 50},
        {"date": "2025-07-03", "web": 120, "social": 90, "darkweb": 60},
        {"date": "2025-07-05", "web": 150, "social": 110, "darkweb": 70},
        {"date": "2025-07-07", "web": 180, "social": 130, "darkweb": 80},
    ]

    tag_trends = [
        {"date": "2025-07-01", "tag": "APT-29", "value": 5},
        {"date": "2025-07-03", "tag": "APT-29", "value": 8},
        {"date": "2025-07-01", "tag": "phishing", "value": 12},
        {"date": "2025-07-03", "tag": "phishing", "value": 15},
    ]
    
    investigator_perf = [
        {"name": "A. Kim", "closedCount": 12},
        {"name": "J. Patel", "closedCount": 9},
        {"name": "S. Rivera", "closedCount": 7},
    ]

    # Dummy data for sparklines, matching the frontend's expectation
    repo_sparks = [
        {"sparkline": [10, 20, 15, 30, 25, 40]},
        {"sparkline": [40, 35, 38, 30, 28, 25]},
        {"sparkline": [5, 8, 10, 12, 15, 17]},
        {"sparkline": [4.5, 4.2, 4.0, 3.8, 3.5, 3.4]},
        {"sparkline": [70, 72, 75, 78, 80, 82]},
    ]
    
    # --- 4. Assemble the Final Response ---
    return {
        "kpis": kpis,
        "activity": activity_timeline,
        "ingestVolume": ingest_volume,
        "tagTrends": tag_trends,
        "investigatorPerf": investigator_perf,
        "repoSparks": repo_sparks
    }