from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    ANALYST = "analyst"
    CONTRIBUTOR = "contributor"
    VIEWER = "viewer"

class MergeRequestStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"
    MERGED = "merged"
    DRAFT = "draft"

class AIValidationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEEDS_REVIEW = "needs_review"

class FileType(str, Enum):
    MARKDOWN = "markdown"
    JSON = "json"
    CSV = "csv"
    TXT = "txt"

class ChangeType(str, Enum):
    ADDED = "added"
    MODIFIED = "modified"
    DELETED = "deleted"

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    avatar: Optional[str] = None
    role: UserRole = UserRole.CONTRIBUTOR

class UserCreate(UserBase):
    clerk_id: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    avatar: Optional[str] = None
    role: Optional[UserRole] = None

class User(UserBase):
    id: str
    clerk_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Repository schemas
class RepositoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_private: bool = False

class RepositoryCreate(RepositoryBase):
    pass

class RepositoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_private: Optional[bool] = None

class Repository(RepositoryBase):
    id: str
    owner_id: str
    fork_count: int
    forked_from_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    owner: User
    collaborators: List["RepositoryCollaborator"] = []

    class Config:
        from_attributes = True

# Repository File schemas
class RepositoryFileBase(BaseModel):
    name: str
    path: str
    content: str
    file_type: FileType

class RepositoryFileCreate(RepositoryFileBase):
    repository_id: str

class RepositoryFileUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None

class RepositoryFile(RepositoryFileBase):
    id: str
    repository_id: str
    size: int
    author_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    author: User

    class Config:
        from_attributes = True

# Merge Request schemas
class MergeRequestBase(BaseModel):
    title: str
    description: Optional[str] = None
    source_branch: str = "main"
    target_branch: str = "main"

class MergeRequestCreate(MergeRequestBase):
    source_repo_id: str
    target_repo_id: str

class MergeRequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[MergeRequestStatus] = None

class AIValidation(BaseModel):
    status: AIValidationStatus
    score: float
    feedback: Optional[str] = None
    concerns: List[str] = []
    suggestions: List[str] = []

class MergeRequest(MergeRequestBase):
    id: str
    author_id: str
    source_repo_id: str
    target_repo_id: str
    status: MergeRequestStatus
    ai_validation: AIValidation
    created_at: datetime
    updated_at: Optional[datetime] = None
    author: User
    source_repo: Repository
    target_repo: Repository

    class Config:
        from_attributes = True

# File Change schemas
class FileChangeBase(BaseModel):
    file_path: str
    change_type: ChangeType
    additions: int = 0
    deletions: int = 0
    diff_content: Optional[str] = None

class FileChangeCreate(FileChangeBase):
    merge_request_id: str

class FileChange(FileChangeBase):
    id: str
    merge_request_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Comment schemas
class CommentBase(BaseModel):
    content: str
    line_number: Optional[int] = None
    file_path: Optional[str] = None

class CommentCreate(CommentBase):
    merge_request_id: str

class CommentUpdate(BaseModel):
    content: Optional[str] = None

class Comment(CommentBase):
    id: str
    merge_request_id: str
    author_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    author: User

    class Config:
        from_attributes = True

# Repository Collaborator schemas
class RepositoryCollaboratorBase(BaseModel):
    role: UserRole = UserRole.CONTRIBUTOR

class RepositoryCollaboratorCreate(RepositoryCollaboratorBase):
    user_id: str
    repository_id: str

class RepositoryCollaborator(RepositoryCollaboratorBase):
    id: str
    repository_id: str
    user_id: str
    created_at: datetime
    user: User

    class Config:
        from_attributes = True

# File Version schemas
class FileVersionBase(BaseModel):
    file_id: str
    version_number: int
    content: str
    commit_message: str
    author_id: str
    created_at: datetime

class FileVersionCreate(BaseModel):
    file_id: str
    content: str
    commit_message: Optional[str] = None
    author_id: str

class FileVersion(FileVersionBase):
    id: str
    author: Optional[User] = None

    class Config:
        from_attributes = True

# Update forward references
Repository.model_rebuild()
MergeRequest.model_rebuild()