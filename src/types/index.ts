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

export interface Commit {
  id: string;
  sha: string;
  message: string;
  timestamp: string;
  parent_sha?: string;
  author: User;
  repository_id: string;
  created_at: string;
}

export interface CommitFile {
  id: string;
  file_path: string;
  change_type: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
  diff_content?: string;
  commit_id: string;
  file_id: string;
  previous_file_id?: string;
}

export interface CommitGraph {
  id: string;
  repository_id: string;
  graph_data: {
    nodes: GraphNode[];
    edges: GraphEdge[];
    layout: Record<string, { x: number; y: number; level: number }>;
  };
  node_count: number;
  edge_count: number;
  last_updated: string;
  created_at: string;
}

export interface GraphNode {
  id: string;
  type: 'commit' | 'file';
  label: string;
  metadata: {
    sha?: string;
    message?: string;
    author?: string;
    timestamp?: string;
    file_path?: string;
    change_type?: string;
    additions?: number;
    deletions?: number;
    commit_sha?: string;
  };
  position?: {
    x: number;
    y: number;
    level: number;
  };
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  metadata: {
    relationship: string;
    change_type?: string;
  };
}

export interface GraphStatistics {
  total_commits: number;
  total_file_changes: number;
  unique_files: number;
  average_files_per_commit: number;
}