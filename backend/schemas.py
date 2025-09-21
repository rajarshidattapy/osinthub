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

# Merge Request Version schemas
class MergeRequestVersionBase(BaseModel):
    merge_request_id: str
    version_number: int
    title: str
    description: Optional[str] = None
    status: Optional[str] = None
    ai_validation_status: Optional[str] = None
    ai_validation_score: Optional[float] = None
    ai_validation_feedback: Optional[str] = None
    ai_validation_concerns: Optional[List[str]] = None
    ai_validation_suggestions: Optional[List[str]] = None
    author_id: str
    created_at: datetime

class MergeRequestVersionCreate(BaseModel):
    merge_request_id: str
    title: str
    description: Optional[str] = None
    status: Optional[str] = None
    ai_validation_status: Optional[str] = None
    ai_validation_score: Optional[float] = None
    ai_validation_feedback: Optional[str] = None
    ai_validation_concerns: Optional[List[str]] = None
    ai_validation_suggestions: Optional[List[str]] = None
    author_id: str

class MergeRequestVersion(MergeRequestVersionBase):
    id: str
    author: Optional[User] = None
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

# Commit schemas
class CommitBase(BaseModel):
    sha: str
    message: str
    timestamp: datetime
    parent_sha: Optional[str] = None

class CommitCreate(CommitBase):
    repository_id: str
    author_id: str

class Commit(CommitBase):
    id: str
    repository_id: str
    author_id: str
    created_at: datetime
    author: Optional[User] = None

    class Config:
        from_attributes = True

# Commit File schemas
class CommitFileBase(BaseModel):
    file_path: str
    change_type: ChangeType
    additions: int = 0
    deletions: int = 0
    diff_content: Optional[str] = None

class CommitFileCreate(CommitFileBase):
    commit_id: str
    file_id: str
    previous_file_id: Optional[str] = None

class CommitFile(CommitFileBase):
    id: str
    commit_id: str
    file_id: str
    previous_file_id: Optional[str] = None

    class Config:
        from_attributes = True

# Commit Graph schemas
class CommitGraphBase(BaseModel):
    graph_data: Dict[str, Any]
    node_count: int = 0
    edge_count: int = 0

class CommitGraphCreate(CommitGraphBase):
    repository_id: str

class CommitGraph(CommitGraphBase):
    id: str
    repository_id: str
    last_updated: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Graph Node schemas
class GraphNode(BaseModel):
    id: str
    type: str  # "commit" or "file"
    label: str
    metadata: Dict[str, Any]
    position: Optional[Dict[str, float]] = None

class GraphEdge(BaseModel):
    source: str
    target: str
    type: str  # "commit_to_file", "file_evolution", "commit_parent"
    metadata: Dict[str, Any]

class GraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    layout: Optional[Dict[str, Any]] = None

# Update forward references
Repository.model_rebuild()
MergeRequest.model_rebuild()