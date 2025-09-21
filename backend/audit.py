from typing import Optional, Dict
from sqlalchemy.orm import Session
from .models import AuditEntry
from datetime import datetime

def log_activity(
    db: Session,
    action: str,
    user_id: str,
    repository_id: Optional[str] = None,
    details: Optional[Dict] = None
):
    """
    Log an activity or audit entry to the database.
    :param db: SQLAlchemy session
    :param action: Action string (e.g., 'file_upload', 'merge_request_update')
    :param user_id: User performing the action
    :param repository_id: Optional repository context
    :param details: Optional dictionary with extra details
    """
    entry = AuditEntry(
        action=action,
        user_id=user_id,
        repository_id=repository_id,
        details=details or {},
        created_at=datetime.utcnow()
    )
    db.add(entry)
    db.commit()
    return entry

