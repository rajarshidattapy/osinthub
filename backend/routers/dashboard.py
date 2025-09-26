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
    
    # Ingested Items (24h) - new repositories created in the last 24h vs previous 24h
    now_utc_naive = datetime.utcnow()
    twenty_four_hours_ago = now_utc_naive - timedelta(hours=24)
    forty_eight_hours_ago = now_utc_naive - timedelta(hours=48)
    ingested_curr = db.query(RepositoryModel).filter(RepositoryModel.created_at >= twenty_four_hours_ago).count()
    ingested_prev = db.query(RepositoryModel).filter(RepositoryModel.created_at >= forty_eight_hours_ago, RepositoryModel.created_at < twenty_four_hours_ago).count()

    def pct_delta(curr: int, prev: int) -> tuple[str, bool]:
        if prev == 0:
            if curr == 0:
                return "+0%", True
            return "+100%", True
        change = ((curr - prev) / prev) * 100
        sign = "+" if change >= 0 else ""
        return f"{sign}{change:.1f}%", change >= 0

    ingested_delta, ingested_positive = pct_delta(ingested_curr, ingested_prev)

    # Active Cases - repositories updated in last 7 days vs previous 7-day window
    seven_days_ago = now_utc_naive - timedelta(days=7)
    fourteen_days_ago = now_utc_naive - timedelta(days=14)
    active_curr = db.query(RepositoryModel).filter(RepositoryModel.updated_at >= seven_days_ago).count()
    active_prev = db.query(RepositoryModel).filter(RepositoryModel.updated_at >= fourteen_days_ago, RepositoryModel.updated_at < seven_days_ago).count()
    active_delta, active_positive = pct_delta(active_curr, active_prev)

    # Open Merge Requests - compare current open count vs count 24h ago snapshot (approximation: count opened before 24h that are still open + opened within)
    open_curr = db.query(MergeRequestModel).filter(MergeRequestModel.status == 'open').count()
    # Approx previous: open MRs that were created before 24h ago and still open OR closed within last 24h (gives rough baseline)
    open_prev = db.query(MergeRequestModel).filter(MergeRequestModel.created_at < twenty_four_hours_ago, MergeRequestModel.status == 'open').count()
    open_delta, open_positive = pct_delta(open_curr, open_prev)

    # Avg Lead Time (dummy) & Investigator Efficiency (dummy) but compute a mock delta relative to baseline constants
    avg_lead_time_value = 3.4  # days
    avg_lead_time_prev = 3.7
    lead_change = avg_lead_time_value - avg_lead_time_prev
    lead_delta = f"{lead_change:+.1f}d"
    lead_positive = lead_change <= 0  # lower lead time is good

    investigator_efficiency = 82  # percent
    investigator_eff_prev = 78
    eff_change = investigator_efficiency - investigator_eff_prev
    eff_delta = f"{eff_change:+d}" if abs(eff_change) >= 1 else "+0"
    eff_positive = eff_change >= 0

    kpis = {
        "ingestedItems": {"value": ingested_curr, "delta": ingested_delta, "positive": ingested_positive},
        "activeCases": {"value": active_curr, "delta": active_delta, "positive": active_positive},
        "openMergeRequests": {"value": open_curr, "delta": open_delta, "positive": open_positive},
        "avgLeadTime": {"value": f"{avg_lead_time_value:.1f}d", "delta": lead_delta, "positive": lead_positive},
        "investigatorEfficiency": {"value": investigator_efficiency, "delta": eff_delta, "positive": eff_positive},
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

    # --- 3. Chart Data (Dynamic) ---
    # Ingest Volume: count repositories created per day for last 30 days.
    days_back = 30
    start_range = now_utc_naive - timedelta(days=days_back - 1)
    # Build a list of dicts with date strings and category splits (web/social/darkweb)
    ingest_volume = []
    for i in range(days_back):
        day = start_range + timedelta(days=i)
        day_start = datetime(day.year, day.month, day.day)
        day_end = day_start + timedelta(days=1)
        count = db.query(RepositoryModel).filter(RepositoryModel.created_at >= day_start, RepositoryModel.created_at < day_end).count()
        # Derive category splits deterministically so chart has stacked segments even without explicit source field
        if count == 0:
            web = social = darkweb = 0
        else:
            web = int(count * 0.5)
            social = int(count * 0.3)
            darkweb = count - web - social
        ingest_volume.append({
            "date": day.strftime("%Y-%m-%d"),
            "web": web,
            "social": social,
            "darkweb": darkweb
        })

    # Investigator Performance: derive from merge requests merged or closed in last 30 days grouped by author
    recent_period_start = now_utc_naive - timedelta(days=30)
    mr_q = db.query(MergeRequestModel).filter(
        MergeRequestModel.created_at >= recent_period_start,
        MergeRequestModel.status.in_(['merged', 'closed'])
    ).all()
    perf_map = {}
    for mr in mr_q:
        author = mr.author
        if not author:
            continue
        key = author.id
        if key not in perf_map:
            perf_map[key] = {
                "name": author.username or author.email.split('@')[0],
                "closedCount": 0,
                "durations": []  # in days
            }
        perf_map[key]["closedCount"] += 1
        # Approximate cycle time using updated_at if present else created_at
        end_time = mr.updated_at or mr.created_at or now_utc_naive
        start_time = mr.created_at or end_time
        if end_time and start_time:
            delta_days = max(0.0, (end_time - start_time).total_seconds() / 86400.0)
            perf_map[key]["durations"].append(delta_days)
    investigator_perf = []
    for p in perf_map.values():
        if p["durations"]:
            avg_time = sum(p["durations"]) / len(p["durations"])
        else:
            avg_time = 0.0
        investigator_perf.append({
            "name": p["name"],
            "closedCount": p["closedCount"],
            "avgTimeDays": round(avg_time, 2)
        })
    # Sort by closedCount desc and limit to top 10 for readability
    investigator_perf.sort(key=lambda x: x["closedCount"], reverse=True)
    investigator_perf = investigator_perf[:10]

    # Tag trends still placeholder until tagging implemented
    tag_trends = []

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