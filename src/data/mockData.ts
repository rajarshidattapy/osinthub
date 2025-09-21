import { User, Repository, MergeRequest, AuditEntry, Commit, CommitFile, CommitGraph, GraphNode, GraphEdge, GraphStatistics } from '../types';

export const currentUser: User = {
  id: '1',
  username: 'analyst_prime',
  avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
  role: 'analyst',
  email: 'analyst@osint.org'
};

export const users: User[] = [
  currentUser,
  {
    id: '2',
    username: 'cyber_investigator',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    role: 'admin',
    email: 'admin@osint.org'
  },
  {
    id: '3',
    username: 'threat_hunter',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    role: 'contributor',
    email: 'hunter@osint.org'
  }
];

export const repositories: Repository[] = [
  {
    id: '1',
    name: 'apt-29-investigation',
    description: 'Collaborative investigation into APT-29 infrastructure and TTPs',
    owner: users[1],
    isPrivate: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    forkCount: 3,
    files: [
      {
        id: '1',
        name: 'README.md',
        path: 'README.md',
        content: `# APT-29 Investigation

## Overview
This repository contains intelligence gathered on APT-29 (Cozy Bear) operations.

## Key Findings
- Infrastructure overlaps with previous campaigns
- New TTP variations observed in Q4 2023
- Attribution confidence: HIGH

## Contributors
- @cyber_investigator - Lead analyst
- @analyst_prime - Infrastructure analysis
- @threat_hunter - TTP documentation
`,
        type: 'markdown',
        size: 425,
        lastModified: '2024-01-20T14:30:00Z',
        author: users[1]
      },
      {
        id: '2',
        name: 'infrastructure.json',
        path: 'data/infrastructure.json',
        content: `{
  "domains": [
    {
      "domain": "cozy-news.com",
      "first_seen": "2023-12-15",
      "status": "active",
      "confidence": 0.95
    },
    {
      "domain": "secure-updates.net",
      "first_seen": "2023-12-20",
      "status": "sinkholed",
      "confidence": 0.88
    }
  ],
  "ip_addresses": [
    {
      "ip": "185.243.115.42",
      "country": "Netherlands",
      "first_seen": "2023-12-16",
      "confidence": 0.92
    }
  ]
}`,
        type: 'json',
        size: 512,
        lastModified: '2024-01-19T09:15:00Z',
        author: currentUser
      }
    ],
    collaborators: [users[1], currentUser, users[2]]
  },
  {
    id: '2',
    name: 'ransomware-analysis',
    description: 'Comprehensive analysis of LockBit 3.0 ransomware samples and infrastructure',
    owner: users[2],
    isPrivate: true,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-22T16:45:00Z',
    forkCount: 1,
    files: [
      {
        id: '3',
        name: 'README.md',
        path: 'README.md',
        content: `# LockBit 3.0 Analysis

## Overview
This repository contains detailed analysis of LockBit 3.0 ransomware samples, infrastructure, and TTPs.

## Key Findings
- New encryption methods identified
- C2 infrastructure overlaps with previous versions
- Attribution confidence: MEDIUM

## Contributors
- @threat_hunter - Lead analyst
- @analyst_prime - Sample analysis
- @cyber_investigator - Infrastructure mapping
`,
        type: 'markdown',
        size: 512,
        lastModified: '2024-01-22T16:45:00Z',
        author: users[2]
      },
      {
        id: '4',
        name: 'samples.json',
        path: 'data/samples.json',
        content: `{
  "samples": [
    {
      "hash": "a1b2c3d4e5f6789",
      "family": "LockBit 3.0",
      "first_seen": "2024-01-15",
      "status": "analyzed",
      "confidence": 0.92
    },
    {
      "hash": "b2c3d4e5f678901",
      "family": "LockBit 3.0",
      "first_seen": "2024-01-18",
      "status": "analyzed",
      "confidence": 0.88
    }
  ],
  "infrastructure": [
    {
      "domain": "lockbit-support.com",
      "first_seen": "2024-01-12",
      "status": "active",
      "confidence": 0.95
    }
  ]
}`,
        type: 'json',
        size: 384,
        lastModified: '2024-01-21T14:30:00Z',
        author: currentUser
      }
    ],
    collaborators: [users[2], currentUser, users[1]]
  }
];

export const mergeRequests: MergeRequest[] = [
  {
    id: '1',
    title: 'Add new C2 servers and malware samples',
    description: 'This PR adds newly discovered command & control infrastructure and associated malware samples found through passive DNS analysis.',
    author: users[2],
    sourceRepo: repositories[0],
    targetRepo: repositories[0],
    sourceBranch: 'feature/new-c2-infrastructure',
    targetBranch: 'main',
    status: 'open',
    aiValidation: {
      status: 'approved',
      score: 0.87,
      feedback: 'The proposed changes contain high-quality intelligence with proper attribution. All IOCs are properly formatted and cross-referenced.',
      concerns: [],
      suggestions: [
        'Consider adding geolocation data for IP addresses',
        'Include confidence scores for each indicator'
      ]
    },
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T14:00:00Z',
    changes: [
      {
        file: 'data/infrastructure.json',
        type: 'modified',
        additions: 15,
        deletions: 2,
        diff: `@@ -8,6 +8,19 @@
       "domain": "secure-updates.net",
       "first_seen": "2023-12-20",
       "status": "sinkholed",
-      "confidence": 0.88
+      "confidence": 0.88,
+      "geolocation": "US"
+    },
+    {
+      "domain": "news-security.org",
+      "first_seen": "2024-01-18",
+      "status": "active",
+      "confidence": 0.93,
+      "geolocation": "RU"
     }
   ],`
      }
    ],
    comments: [
      {
        id: '1',
        author: users[1],
        content: 'Excellent work on the infrastructure discovery. The confidence scores look accurate.',
        createdAt: '2024-01-20T11:30:00Z'
      }
    ]
  }
];

export const auditTrail: AuditEntry[] = [
  {
    id: '1',
    action: 'Created repository',
    user: users[1],
    timestamp: '2024-01-15T10:00:00Z',
    details: { repository: 'apt-29-investigation' },
    repository: repositories[0]
  },
  {
    id: '2',
    action: 'Added file',
    user: currentUser,
    timestamp: '2024-01-16T14:20:00Z',
    details: { file: 'infrastructure.json', size: 512 },
    repository: repositories[0]
  },
  {
    id: '3',
    action: 'Created merge request',
    user: users[2],
    timestamp: '2024-01-20T10:00:00Z',
    details: { 
      title: 'Add new C2 servers and malware samples',
      changes: 2,
      additions: 15,
      deletions: 2
    },
    repository: repositories[0]
  }
];

// Mock Commit Data
export const commits: Commit[] = [
  {
    id: 'commit-1',
    sha: 'a1b2c3d4e5f6',
    message: 'Initial commit: Add APT-29 investigation framework',
    timestamp: '2024-01-15T10:00:00Z',
    author: users[1],
    repository_id: '1',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'commit-2',
    sha: 'b2c3d4e5f6g7',
    message: 'Add infrastructure.json with initial IOCs',
    timestamp: '2024-01-16T14:20:00Z',
    parent_sha: 'a1b2c3d4e5f6',
    author: currentUser,
    repository_id: '1',
    created_at: '2024-01-16T14:20:00Z'
  },
  {
    id: 'commit-3',
    sha: 'c3d4e5f6g7h8',
    message: 'Update README with key findings',
    timestamp: '2024-01-17T09:30:00Z',
    parent_sha: 'b2c3d4e5f6g7',
    author: users[1],
    repository_id: '1',
    created_at: '2024-01-17T09:30:00Z'
  },
  {
    id: 'commit-4',
    sha: 'd4e5f6g7h8i9',
    message: 'Add new C2 domains and IP addresses',
    timestamp: '2024-01-18T16:45:00Z',
    parent_sha: 'c3d4e5f6g7h8',
    author: users[2],
    repository_id: '1',
    created_at: '2024-01-18T16:45:00Z'
  },
  {
    id: 'commit-5',
    sha: 'e5f6g7h8i9j0',
    message: 'Update infrastructure.json with geolocation data',
    timestamp: '2024-01-19T11:15:00Z',
    parent_sha: 'd4e5f6g7h8i9',
    author: currentUser,
    repository_id: '1',
    created_at: '2024-01-19T11:15:00Z'
  }
];

// Mock Commit Files Data
export const commitFiles: CommitFile[] = [
  {
    id: 'cf-1',
    commit_id: 'commit-1',
    file_id: '1',
    file_path: 'README.md',
    change_type: 'added',
    additions: 15,
    deletions: 0,
    diff_content: '+ # APT-29 Investigation\n+ \n+ ## Overview\n+ This repository contains intelligence gathered on APT-29 (Cozy Bear) operations.'
  },
  {
    id: 'cf-2',
    commit_id: 'commit-2',
    file_id: '2',
    file_path: 'data/infrastructure.json',
    change_type: 'added',
    additions: 25,
    deletions: 0,
    diff_content: '+ {\n+   "domains": [\n+     {\n+       "domain": "cozy-news.com",\n+       "first_seen": "2023-12-15",\n+       "status": "active",\n+       "confidence": 0.95\n+     }\n+   ]\n+ }'
  },
  {
    id: 'cf-3',
    commit_id: 'commit-3',
    file_id: '1',
    file_path: 'README.md',
    change_type: 'modified',
    additions: 8,
    deletions: 2,
    previous_file_id: '1',
    diff_content: '@@ -5,6 +5,12 @@\n ## Key Findings\n - Infrastructure overlaps with previous campaigns\n - New TTP variations observed in Q4 2023\n - Attribution confidence: HIGH\n+\n+## Recent Updates\n+- Added new C2 infrastructure\n+- Updated confidence scores\n+- Enhanced documentation'
  },
  {
    id: 'cf-4',
    commit_id: 'commit-4',
    file_id: '2',
    file_path: 'data/infrastructure.json',
    change_type: 'modified',
    additions: 12,
    deletions: 1,
    previous_file_id: '2',
    diff_content: '@@ -8,6 +8,17 @@\n       "confidence": 0.88\n     }\n   ],\n+  "new_domains": [\n+    {\n+      "domain": "news-security.org",\n+      "first_seen": "2024-01-18",\n+      "status": "active",\n+      "confidence": 0.93\n+    }\n+  ],'
  },
  {
    id: 'cf-5',
    commit_id: 'commit-5',
    file_id: '2',
    file_path: 'data/infrastructure.json',
    change_type: 'modified',
    additions: 6,
    deletions: 0,
    previous_file_id: '2',
    diff_content: '@@ -12,6 +12,12 @@\n       "confidence": 0.93\n     }\n   ],\n+  "geolocation": {\n+    "cozy-news.com": "RU",\n+    "secure-updates.net": "US",\n+    "news-security.org": "RU"\n+  }'
  }
];

// Mock Graph Nodes
export const graphNodes: GraphNode[] = [
  {
    id: 'commit_a1b2c3d4e5f6',
    type: 'commit',
    label: 'a1b2c3d: Initial commit',
    metadata: {
      sha: 'a1b2c3d4e5f6',
      message: 'Initial commit: Add APT-29 investigation framework',
      author: 'cyber_investigator',
      timestamp: '2024-01-15T10:00:00Z'
    },
    position: { x: 0, y: 0, level: 0 }
  },
  {
    id: 'file_1_a1b2c3d4e5f6',
    type: 'file',
    label: 'README.md (added)',
    metadata: {
      file_path: 'README.md',
      change_type: 'added',
      additions: 15,
      deletions: 0,
      commit_sha: 'a1b2c3d4e5f6'
    },
    position: { x: 300, y: 0, level: 1 }
  },
  {
    id: 'commit_b2c3d4e5f6g7',
    type: 'commit',
    label: 'b2c3d4e: Add infrastructure.json',
    metadata: {
      sha: 'b2c3d4e5f6g7',
      message: 'Add infrastructure.json with initial IOCs',
      author: 'analyst_prime',
      timestamp: '2024-01-16T14:20:00Z'
    },
    position: { x: 0, y: 200, level: 0 }
  },
  {
    id: 'file_2_b2c3d4e5f6g7',
    type: 'file',
    label: 'data/infrastructure.json (added)',
    metadata: {
      file_path: 'data/infrastructure.json',
      change_type: 'added',
      additions: 25,
      deletions: 0,
      commit_sha: 'b2c3d4e5f6g7'
    },
    position: { x: 300, y: 200, level: 1 }
  },
  {
    id: 'commit_c3d4e5f6g7h8',
    type: 'commit',
    label: 'c3d4e5f: Update README',
    metadata: {
      sha: 'c3d4e5f6g7h8',
      message: 'Update README with key findings',
      author: 'cyber_investigator',
      timestamp: '2024-01-17T09:30:00Z'
    },
    position: { x: 0, y: 400, level: 0 }
  },
  {
    id: 'file_1_c3d4e5f6g7h8',
    type: 'file',
    label: 'README.md (modified)',
    metadata: {
      file_path: 'README.md',
      change_type: 'modified',
      additions: 8,
      deletions: 2,
      commit_sha: 'c3d4e5f6g7h8'
    },
    position: { x: 300, y: 400, level: 1 }
  },
  {
    id: 'commit_d4e5f6g7h8i9',
    type: 'commit',
    label: 'd4e5f6g: Add new C2 domains',
    metadata: {
      sha: 'd4e5f6g7h8i9',
      message: 'Add new C2 domains and IP addresses',
      author: 'threat_hunter',
      timestamp: '2024-01-18T16:45:00Z'
    },
    position: { x: 0, y: 600, level: 0 }
  },
  {
    id: 'file_2_d4e5f6g7h8i9',
    type: 'file',
    label: 'data/infrastructure.json (modified)',
    metadata: {
      file_path: 'data/infrastructure.json',
      change_type: 'modified',
      additions: 12,
      deletions: 1,
      commit_sha: 'd4e5f6g7h8i9'
    },
    position: { x: 300, y: 600, level: 1 }
  },
  {
    id: 'commit_e5f6g7h8i9j0',
    type: 'commit',
    label: 'e5f6g7h: Update with geolocation',
    metadata: {
      sha: 'e5f6g7h8i9j0',
      message: 'Update infrastructure.json with geolocation data',
      author: 'analyst_prime',
      timestamp: '2024-01-19T11:15:00Z'
    },
    position: { x: 0, y: 800, level: 0 }
  },
  {
    id: 'file_2_e5f6g7h8i9j0',
    type: 'file',
    label: 'data/infrastructure.json (modified)',
    metadata: {
      file_path: 'data/infrastructure.json',
      change_type: 'modified',
      additions: 6,
      deletions: 0,
      commit_sha: 'e5f6g7h8i9j0'
    },
    position: { x: 300, y: 800, level: 1 }
  }
];

// Mock Graph Edges
export const graphEdges: GraphEdge[] = [
  {
    source: 'commit_a1b2c3d4e5f6',
    target: 'file_1_a1b2c3d4e5f6',
    type: 'commit_to_file',
    metadata: { relationship: 'contains' }
  },
  {
    source: 'commit_a1b2c3d4e5f6',
    target: 'commit_b2c3d4e5f6g7',
    type: 'commit_parent',
    metadata: { relationship: 'parent_child' }
  },
  {
    source: 'commit_b2c3d4e5f6g7',
    target: 'file_2_b2c3d4e5f6g7',
    type: 'commit_to_file',
    metadata: { relationship: 'contains' }
  },
  {
    source: 'commit_b2c3d4e5f6g7',
    target: 'commit_c3d4e5f6g7h8',
    type: 'commit_parent',
    metadata: { relationship: 'parent_child' }
  },
  {
    source: 'commit_c3d4e5f6g7h8',
    target: 'file_1_c3d4e5f6g7h8',
    type: 'commit_to_file',
    metadata: { relationship: 'contains' }
  },
  {
    source: 'file_1_a1b2c3d4e5f6',
    target: 'file_1_c3d4e5f6g7h8',
    type: 'file_evolution',
    metadata: { relationship: 'evolved_from', change_type: 'modified' }
  },
  {
    source: 'commit_c3d4e5f6g7h8',
    target: 'commit_d4e5f6g7h8i9',
    type: 'commit_parent',
    metadata: { relationship: 'parent_child' }
  },
  {
    source: 'commit_d4e5f6g7h8i9',
    target: 'file_2_d4e5f6g7h8i9',
    type: 'commit_to_file',
    metadata: { relationship: 'contains' }
  },
  {
    source: 'file_2_b2c3d4e5f6g7',
    target: 'file_2_d4e5f6g7h8i9',
    type: 'file_evolution',
    metadata: { relationship: 'evolved_from', change_type: 'modified' }
  },
  {
    source: 'commit_d4e5f6g7h8i9',
    target: 'commit_e5f6g7h8i9j0',
    type: 'commit_parent',
    metadata: { relationship: 'parent_child' }
  },
  {
    source: 'commit_e5f6g7h8i9j0',
    target: 'file_2_e5f6g7h8i9j0',
    type: 'commit_to_file',
    metadata: { relationship: 'contains' }
  },
  {
    source: 'file_2_d4e5f6g7h8i9',
    target: 'file_2_e5f6g7h8i9j0',
    type: 'file_evolution',
    metadata: { relationship: 'evolved_from', change_type: 'modified' }
  }
];

// Mock Commit Graph
export const commitGraph: CommitGraph = {
  id: 'graph-1',
  repository_id: '1',
  graph_data: {
    nodes: graphNodes,
    edges: graphEdges,
    layout: {
      'commit_a1b2c3d4e5f6': { x: 0, y: 0, level: 0 },
      'file_1_a1b2c3d4e5f6': { x: 300, y: 0, level: 1 },
      'commit_b2c3d4e5f6g7': { x: 0, y: 200, level: 0 },
      'file_2_b2c3d4e5f6g7': { x: 300, y: 200, level: 1 },
      'commit_c3d4e5f6g7h8': { x: 0, y: 400, level: 0 },
      'file_1_c3d4e5f6g7h8': { x: 300, y: 400, level: 1 },
      'commit_d4e5f6g7h8i9': { x: 0, y: 600, level: 0 },
      'file_2_d4e5f6g7h8i9': { x: 300, y: 600, level: 1 },
      'commit_e5f6g7h8i9j0': { x: 0, y: 800, level: 0 },
      'file_2_e5f6g7h8i9j0': { x: 300, y: 800, level: 1 }
    }
  },
  node_count: 10,
  edge_count: 12,
  last_updated: '2024-01-19T11:15:00Z',
  created_at: '2024-01-15T10:00:00Z'
};

// Mock Graph Statistics
export const graphStatistics: GraphStatistics = {
  total_commits: 5,
  total_file_changes: 8,
  unique_files: 2,
  average_files_per_commit: 1.6
};

// Mock Data for Second Repository (ransomware-analysis)
export const commits2: Commit[] = [
  {
    id: 'commit-r1',
    sha: 'f1a2b3c4d5e6',
    message: 'Initial commit: Add LockBit 3.0 analysis framework',
    timestamp: '2024-01-10T08:00:00Z',
    author: users[2],
    repository_id: '2',
    created_at: '2024-01-10T08:00:00Z'
  },
  {
    id: 'commit-r2',
    sha: 'g2b3c4d5e6f7',
    message: 'Add sample analysis and hash database',
    timestamp: '2024-01-12T11:30:00Z',
    parent_sha: 'f1a2b3c4d5e6',
    author: currentUser,
    repository_id: '2',
    created_at: '2024-01-12T11:30:00Z'
  },
  {
    id: 'commit-r3',
    sha: 'h3c4d5e6f7g8',
    message: 'Update README with analysis findings',
    timestamp: '2024-01-15T09:15:00Z',
    parent_sha: 'g2b3c4d5e6f7',
    author: users[2],
    repository_id: '2',
    created_at: '2024-01-15T09:15:00Z'
  },
  {
    id: 'commit-r4',
    sha: 'i4d5e6f7g8h9',
    message: 'Add infrastructure mapping and C2 analysis',
    timestamp: '2024-01-18T14:20:00Z',
    parent_sha: 'h3c4d5e6f7g8',
    author: users[1],
    repository_id: '2',
    created_at: '2024-01-18T14:20:00Z'
  },
  {
    id: 'commit-r5',
    sha: 'j5e6f7g8h9i0',
    message: 'Update samples with new encryption methods',
    timestamp: '2024-01-21T16:45:00Z',
    parent_sha: 'i4d5e6f7g8h9',
    author: currentUser,
    repository_id: '2',
    created_at: '2024-01-21T16:45:00Z'
  }
];

// Mock Graph Data for Second Repository
export const graphNodes2: GraphNode[] = [
  {
    id: 'commit_f1a2b3c4d5e6',
    type: 'commit',
    label: 'f1a2b3c: Initial commit',
    metadata: {
      sha: 'f1a2b3c4d5e6',
      message: 'Initial commit: Add LockBit 3.0 analysis framework',
      author: 'threat_hunter',
      timestamp: '2024-01-10T08:00:00Z'
    },
    position: { x: 0, y: 0, level: 0 }
  },
  {
    id: 'file_3_f1a2b3c4d5e6',
    type: 'file',
    label: 'README.md (added)',
    metadata: {
      file_path: 'README.md',
      change_type: 'added',
      additions: 12,
      deletions: 0,
      commit_sha: 'f1a2b3c4d5e6'
    },
    position: { x: 300, y: 0, level: 1 }
  },
  {
    id: 'commit_g2b3c4d5e6f7',
    type: 'commit',
    label: 'g2b3c4d: Add sample analysis',
    metadata: {
      sha: 'g2b3c4d5e6f7',
      message: 'Add sample analysis and hash database',
      author: 'analyst_prime',
      timestamp: '2024-01-12T11:30:00Z'
    },
    position: { x: 0, y: 200, level: 0 }
  },
  {
    id: 'file_4_g2b3c4d5e6f7',
    type: 'file',
    label: 'data/samples.json (added)',
    metadata: {
      file_path: 'data/samples.json',
      change_type: 'added',
      additions: 20,
      deletions: 0,
      commit_sha: 'g2b3c4d5e6f7'
    },
    position: { x: 300, y: 200, level: 1 }
  },
  {
    id: 'commit_h3c4d5e6f7g8',
    type: 'commit',
    label: 'h3c4d5e: Update README',
    metadata: {
      sha: 'h3c4d5e6f7g8',
      message: 'Update README with analysis findings',
      author: 'threat_hunter',
      timestamp: '2024-01-15T09:15:00Z'
    },
    position: { x: 0, y: 400, level: 0 }
  },
  {
    id: 'file_3_h3c4d5e6f7g8',
    type: 'file',
    label: 'README.md (modified)',
    metadata: {
      file_path: 'README.md',
      change_type: 'modified',
      additions: 6,
      deletions: 1,
      commit_sha: 'h3c4d5e6f7g8'
    },
    position: { x: 300, y: 400, level: 1 }
  },
  {
    id: 'commit_i4d5e6f7g8h9',
    type: 'commit',
    label: 'i4d5e6f: Add infrastructure',
    metadata: {
      sha: 'i4d5e6f7g8h9',
      message: 'Add infrastructure mapping and C2 analysis',
      author: 'cyber_investigator',
      timestamp: '2024-01-18T14:20:00Z'
    },
    position: { x: 0, y: 600, level: 0 }
  },
  {
    id: 'file_4_i4d5e6f7g8h9',
    type: 'file',
    label: 'data/samples.json (modified)',
    metadata: {
      file_path: 'data/samples.json',
      change_type: 'modified',
      additions: 8,
      deletions: 0,
      commit_sha: 'i4d5e6f7g8h9'
    },
    position: { x: 300, y: 600, level: 1 }
  },
  {
    id: 'commit_j5e6f7g8h9i0',
    type: 'commit',
    label: 'j5e6f7g: Update samples',
    metadata: {
      sha: 'j5e6f7g8h9i0',
      message: 'Update samples with new encryption methods',
      author: 'analyst_prime',
      timestamp: '2024-01-21T16:45:00Z'
    },
    position: { x: 0, y: 800, level: 0 }
  },
  {
    id: 'file_4_j5e6f7g8h9i0',
    type: 'file',
    label: 'data/samples.json (modified)',
    metadata: {
      file_path: 'data/samples.json',
      change_type: 'modified',
      additions: 4,
      deletions: 0,
      commit_sha: 'j5e6f7g8h9i0'
    },
    position: { x: 300, y: 800, level: 1 }
  }
];

export const graphEdges2: GraphEdge[] = [
  {
    source: 'commit_f1a2b3c4d5e6',
    target: 'file_3_f1a2b3c4d5e6',
    type: 'commit_to_file',
    metadata: { relationship: 'contains' }
  },
  {
    source: 'commit_f1a2b3c4d5e6',
    target: 'commit_g2b3c4d5e6f7',
    type: 'commit_parent',
    metadata: { relationship: 'parent_child' }
  },
  {
    source: 'commit_g2b3c4d5e6f7',
    target: 'file_4_g2b3c4d5e6f7',
    type: 'commit_to_file',
    metadata: { relationship: 'contains' }
  },
  {
    source: 'commit_g2b3c4d5e6f7',
    target: 'commit_h3c4d5e6f7g8',
    type: 'commit_parent',
    metadata: { relationship: 'parent_child' }
  },
  {
    source: 'commit_h3c4d5e6f7g8',
    target: 'file_3_h3c4d5e6f7g8',
    type: 'commit_to_file',
    metadata: { relationship: 'contains' }
  },
  {
    source: 'file_3_f1a2b3c4d5e6',
    target: 'file_3_h3c4d5e6f7g8',
    type: 'file_evolution',
    metadata: { relationship: 'evolved_from', change_type: 'modified' }
  },
  {
    source: 'commit_h3c4d5e6f7g8',
    target: 'commit_i4d5e6f7g8h9',
    type: 'commit_parent',
    metadata: { relationship: 'parent_child' }
  },
  {
    source: 'commit_i4d5e6f7g8h9',
    target: 'file_4_i4d5e6f7g8h9',
    type: 'commit_to_file',
    metadata: { relationship: 'contains' }
  },
  {
    source: 'file_4_g2b3c4d5e6f7',
    target: 'file_4_i4d5e6f7g8h9',
    type: 'file_evolution',
    metadata: { relationship: 'evolved_from', change_type: 'modified' }
  },
  {
    source: 'commit_i4d5e6f7g8h9',
    target: 'commit_j5e6f7g8h9i0',
    type: 'commit_parent',
    metadata: { relationship: 'parent_child' }
  },
  {
    source: 'commit_j5e6f7g8h9i0',
    target: 'file_4_j5e6f7g8h9i0',
    type: 'commit_to_file',
    metadata: { relationship: 'contains' }
  },
  {
    source: 'file_4_i4d5e6f7g8h9',
    target: 'file_4_j5e6f7g8h9i0',
    type: 'file_evolution',
    metadata: { relationship: 'evolved_from', change_type: 'modified' }
  }
];

export const commitGraph2: CommitGraph = {
  id: 'graph-2',
  repository_id: '2',
  graph_data: {
    nodes: graphNodes2,
    edges: graphEdges2,
    layout: {
      'commit_f1a2b3c4d5e6': { x: 0, y: 0, level: 0 },
      'file_3_f1a2b3c4d5e6': { x: 300, y: 0, level: 1 },
      'commit_g2b3c4d5e6f7': { x: 0, y: 200, level: 0 },
      'file_4_g2b3c4d5e6f7': { x: 300, y: 200, level: 1 },
      'commit_h3c4d5e6f7g8': { x: 0, y: 400, level: 0 },
      'file_3_h3c4d5e6f7g8': { x: 300, y: 400, level: 1 },
      'commit_i4d5e6f7g8h9': { x: 0, y: 600, level: 0 },
      'file_4_i4d5e6f7g8h9': { x: 300, y: 600, level: 1 },
      'commit_j5e6f7g8h9i0': { x: 0, y: 800, level: 0 },
      'file_4_j5e6f7g8h9i0': { x: 300, y: 800, level: 1 }
    }
  },
  node_count: 10,
  edge_count: 12,
  last_updated: '2024-01-21T16:45:00Z',
  created_at: '2024-01-10T08:00:00Z'
};

export const graphStatistics2: GraphStatistics = {
  total_commits: 5,
  total_file_changes: 8,
  unique_files: 2,
  average_files_per_commit: 1.6
};

// Mock diff data for showing changes between nodes
export const nodeDiffs: Record<string, string> = {
  'commit_a1b2c3d4e5f6': `+ # APT-29 Investigation
+ 
+ ## Overview
+ This repository contains intelligence gathered on APT-29 (Cozy Bear) operations.
+ 
+ ## Key Findings
+ - Infrastructure overlaps with previous campaigns
+ - New TTP variations observed in Q4 2023
+ - Attribution confidence: HIGH
+ 
+ ## Contributors
+ - @cyber_investigator - Lead analyst
+ - @analyst_prime - Infrastructure analysis
+ - @threat_hunter - TTP documentation`,

  'file_1_a1b2c3d4e5f6': `+ # APT-29 Investigation
+ 
+ ## Overview
+ This repository contains intelligence gathered on APT-29 (Cozy Bear) operations.
+ 
+ ## Key Findings
+ - Infrastructure overlaps with previous campaigns
+ - New TTP variations observed in Q4 2023
+ - Attribution confidence: HIGH
+ 
+ ## Contributors
+ - @cyber_investigator - Lead analyst
+ - @analyst_prime - Infrastructure analysis
+ - @threat_hunter - TTP documentation`,

  'commit_b2c3d4e5f6g7': `+ {
+   "domains": [
+     {
+       "domain": "cozy-news.com",
+       "first_seen": "2023-12-15",
+       "status": "active",
+       "confidence": 0.95
+     },
+     {
+       "domain": "secure-updates.net",
+       "first_seen": "2023-12-20",
+       "status": "sinkholed",
+       "confidence": 0.88
+     }
+   ],
+   "ip_addresses": [
+     {
+       "ip": "185.243.115.42",
+       "country": "Netherlands",
+       "first_seen": "2023-12-16",
+       "confidence": 0.92
+     }
+   ]
+ }`,

  'file_2_b2c3d4e5f6g7': `+ {
+   "domains": [
+     {
+       "domain": "cozy-news.com",
+       "first_seen": "2023-12-15",
+       "status": "active",
+       "confidence": 0.95
+     },
+     {
+       "domain": "secure-updates.net",
+       "first_seen": "2023-12-20",
+       "status": "sinkholed",
+       "confidence": 0.88
+     }
+   ],
+   "ip_addresses": [
+     {
+       "ip": "185.243.115.42",
+       "country": "Netherlands",
+       "first_seen": "2023-12-16",
+       "confidence": 0.92
+     }
+   ]
+ }`,

  'commit_c3d4e5f6g7h8': `@@ -5,6 +5,12 @@
  ## Key Findings
  - Infrastructure overlaps with previous campaigns
  - New TTP variations observed in Q4 2023
  - Attribution confidence: HIGH
+ 
+ ## Recent Updates
+- Added new C2 infrastructure
+- Updated confidence scores
+- Enhanced documentation`,

  'file_1_c3d4e5f6g7h8': `@@ -5,6 +5,12 @@
  ## Key Findings
  - Infrastructure overlaps with previous campaigns
  - New TTP variations observed in Q4 2023
  - Attribution confidence: HIGH
+ 
+ ## Recent Updates
+- Added new C2 infrastructure
+- Updated confidence scores
+- Enhanced documentation`,

  'commit_d4e5f6g7h8i9': `@@ -8,6 +8,17 @@
       "confidence": 0.88
     }
   ],
+  "new_domains": [
+    {
+      "domain": "news-security.org",
+      "first_seen": "2024-01-18",
+      "status": "active",
+      "confidence": 0.93
+    }
+  ],`,

  'file_2_d4e5f6g7h8i9': `@@ -8,6 +8,17 @@
      "confidence": 0.88
    }
 ],
+  "new_domains": [
+    {
+      "domain": "news-security.org",
+      "first_seen": "2024-01-18",
+      "status": "active",
+      "confidence": 0.93
+    }
+  ],`,

  'commit_e5f6g7h8i9j0': `@@ -12,6 +12,12 @@
      "confidence": 0.93
    }
 ],
+  "geolocation": {
+    "cozy-news.com": "RU",
+    "secure-updates.net": "US",
+    "news-security.org": "RU"
+  }`,

  'file_2_e5f6g7h8i9j0': `@@ -12,6 +12,12 @@
    "confidence": 0.93
 }
],
+  "geolocation": {
+    "cozy-news.com": "RU",
+    "secure-updates.net": "US",
+    "news-security.org": "RU"
+  }`
};