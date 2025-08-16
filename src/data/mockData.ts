import { User, Repository, MergeRequest, AuditEntry } from '../types';

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