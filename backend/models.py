from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from sqlalchemy.dialects.postgresql import UUID

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    clerk_id = Column(String, unique=True, nullable=False)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    avatar = Column(String)
    role = Column(String, default="contributor")  # admin, analyst, contributor, viewer
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owned_repositories = relationship("Repository", back_populates="owner")
    authored_merge_requests = relationship("MergeRequest", back_populates="author")
    comments = relationship("Comment", back_populates="author")
    file_changes = relationship("RepositoryFile", back_populates="author")

class Repository(Base):
    __tablename__ = "repositories"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    is_private = Column(Boolean, default=False)
    fork_count = Column(Integer, default=0)
    forked_from_id = Column(String, ForeignKey("repositories.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="owned_repositories")
    forked_from = relationship("Repository", remote_side=[id])
    files = relationship("RepositoryFile", back_populates="repository")
    merge_requests_source = relationship("MergeRequest", foreign_keys="MergeRequest.source_repo_id", back_populates="source_repo")
    merge_requests_target = relationship("MergeRequest", foreign_keys="MergeRequest.target_repo_id", back_populates="target_repo")
    collaborators = relationship("RepositoryCollaborator", back_populates="repository")

class RepositoryCollaborator(Base):
    __tablename__ = "repository_collaborators"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    repository_id = Column(String, ForeignKey("repositories.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    role = Column(String, default="contributor")  # admin, contributor, viewer
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    repository = relationship("Repository", back_populates="collaborators")
    user = relationship("User")

class RepositoryFile(Base):
    __tablename__ = "repository_files"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    repository_id = Column(String, ForeignKey("repositories.id"), nullable=False)
    name = Column(String, nullable=False)
    path = Column(String, nullable=False)
    content = Column(Text)
    file_type = Column(String, nullable=False)  # markdown, json, csv, txt
    size = Column(Integer, default=0)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    change_info = Column(JSON, nullable=True)  # Store document change info as JSON
    storage_path = Column(String, nullable=True)

    # Relationships
    repository = relationship("Repository", back_populates="files")
    author = relationship("User", back_populates="file_changes")

class MergeRequest(Base):
    __tablename__ = "merge_requests"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    source_repo_id = Column(String, ForeignKey("repositories.id"), nullable=False)
    target_repo_id = Column(String, ForeignKey("repositories.id"), nullable=False)
    source_branch = Column(String, default="main")
    target_branch = Column(String, default="main")
    status = Column(String, default="open")  # open, closed, merged, draft
    ai_validation_status = Column(String, default="pending")  # pending, approved, rejected, needs_review
    ai_validation_score = Column(Float, default=0.0)
    ai_validation_feedback = Column(Text)
    ai_validation_concerns = Column(JSON)
    ai_validation_suggestions = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    author = relationship("User", back_populates="authored_merge_requests")
    source_repo = relationship("Repository", foreign_keys=[source_repo_id], back_populates="merge_requests_source")
    target_repo = relationship("Repository", foreign_keys=[target_repo_id], back_populates="merge_requests_target")
    comments = relationship("Comment", back_populates="merge_request")
    file_changes = relationship("FileChange", back_populates="merge_request")

class FileChange(Base):
    __tablename__ = "file_changes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    merge_request_id = Column(String, ForeignKey("merge_requests.id"), nullable=False)
    file_path = Column(String, nullable=False)
    change_type = Column(String, nullable=False)  # added, modified, deleted
    additions = Column(Integer, default=0)
    deletions = Column(Integer, default=0)
    diff_content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    merge_request = relationship("MergeRequest", back_populates="file_changes")

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    merge_request_id = Column(String, ForeignKey("merge_requests.id"), nullable=False)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    line_number = Column(Integer)
    file_path = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    merge_request = relationship("MergeRequest", back_populates="comments")
    author = relationship("User", back_populates="comments")

class AuditEntry(Base):
    __tablename__ = "audit_entries"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    action = Column(String, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    repository_id = Column(String, ForeignKey("repositories.id"))
    details = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    repository = relationship("Repository")

class FileVersion(Base):
    __tablename__ = "file_versions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    file_id = Column(String, ForeignKey("repository_files.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    content = Column(Text)
    commit_message = Column(String)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    file = relationship("RepositoryFile")
    author = relationship("User")
