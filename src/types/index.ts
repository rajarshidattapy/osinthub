export interface User {
  id: string;
  username: string;
  avatar: string;
  role: 'admin' | 'analyst' | 'contributor' | 'viewer';
  email: string;
}

export interface Repository {
  id: string;
  name: string;
  description: string;
  owner: User;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  forkedFrom?: Repository;
  forkCount: number;
  files: RepositoryFile[];
  collaborators: User[];
}

export interface RepositoryFile {
  id: string;
  name: string;
  path: string;
  content: string;
  type: 'markdown' | 'json' | 'csv' | 'txt';
  size: number;
  lastModified: string;
  author: User;
}

export interface MergeRequest {
  id: string;
  title: string;
  description: string;
  author: User;
  sourceRepo: Repository;
  targetRepo: Repository;
  sourceBranch: string;
  targetBranch: string;
  status: 'open' | 'closed' | 'merged' | 'draft';
  aiValidation: AIValidation;
  createdAt: string;
  updatedAt: string;
  changes: FileChange[];
  comments: Comment[];
}

export interface AIValidation {
  status: 'pending' | 'approved' | 'rejected' | 'needs_review';
  score: number;
  feedback: string;
  concerns: string[];
  suggestions: string[];
}

export interface FileChange {
  file: string;
  type: 'added' | 'modified' | 'deleted';
  additions: number;
  deletions: number;
  diff: string;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  line?: number;
  file?: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  user: User;
  timestamp: string;
  details: Record<string, any>;
  repository: Repository;
}