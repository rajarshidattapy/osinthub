from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from models import Repository as RepositoryModel, RepositoryFile, Commit, User, RepositoryCollaborator
import json


class RepositoryAnalysisService:
    """Service for analyzing repository content for chatbot responses"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_comprehensive_repository_data(self, repository_id: str) -> Dict[str, Any]:
        """Get comprehensive repository data for chatbot analysis"""
        try:
            # Get repository
            repo = self.db.query(RepositoryModel).filter(RepositoryModel.id == repository_id).first()
            if not repo:
                return {}
            
            # Get files with full content
            files = self.db.query(RepositoryFile).filter(
                RepositoryFile.repository_id == repository_id
            ).all()
            
            # Get commits
            commits = self.db.query(Commit).filter(
                Commit.repository_id == repository_id
            ).order_by(Commit.timestamp.desc()).limit(50).all()
            
            # Get collaborators
            collaborators = self.db.query(RepositoryCollaborator).filter(
                RepositoryCollaborator.repository_id == repository_id
            ).all()
            
            # Analyze file structure
            file_analysis = self._analyze_file_structure(files)
            
            # Analyze commit patterns
            commit_analysis = self._analyze_commit_patterns(commits)
            
            # Get repository statistics
            stats = self._get_repository_statistics(repo, files, commits, collaborators)
            
            return {
                "repository": {
                    "id": repo.id,
                    "name": repo.name,
                    "description": repo.description,
                    "owner": {
                        "id": repo.owner.id,
                        "username": repo.owner.username,
                        "email": repo.owner.email,
                        "role": repo.owner.role
                    },
                    "is_private": repo.is_private,
                    "fork_count": repo.fork_count,
                    "created_at": repo.created_at.isoformat() if repo.created_at else None,
                    "updated_at": repo.updated_at.isoformat() if repo.updated_at else None
                },
                "files": [
                    {
                        "id": file.id,
                        "name": file.name,
                        "path": file.path,
                        "content": file.content,
                        "file_type": file.file_type,
                        "size": file.size,
                        "author": {
                            "id": file.author.id,
                            "username": file.author.username,
                            "email": file.author.email
                        },
                        "created_at": file.created_at.isoformat() if file.created_at else None,
                        "updated_at": file.updated_at.isoformat() if file.updated_at else None
                    }
                    for file in files
                ],
                "commits": [
                    {
                        "id": commit.id,
                        "sha": commit.sha,
                        "message": commit.message,
                        "author": {
                            "id": commit.author.id,
                            "username": commit.author.username,
                            "email": commit.author.email
                        },
                        "timestamp": commit.timestamp.isoformat() if commit.timestamp else None,
                        "parent_sha": commit.parent_sha,
                        "created_at": commit.created_at.isoformat() if commit.created_at else None
                    }
                    for commit in commits
                ],
                "collaborators": [
                    {
                        "id": collab.id,
                        "user": {
                            "id": collab.user.id,
                            "username": collab.user.username,
                            "email": collab.user.email,
                            "role": collab.user.role
                        },
                        "role": collab.role,
                        "created_at": collab.created_at.isoformat() if collab.created_at else None
                    }
                    for collab in collaborators
                ],
                "analysis": {
                    "file_structure": file_analysis,
                    "commit_patterns": commit_analysis,
                    "statistics": stats
                }
            }
            
        except Exception as e:
            print(f"Error getting repository data: {str(e)}")
            return {}
    
    def _analyze_file_structure(self, files: List[RepositoryFile]) -> Dict[str, Any]:
        """Analyze file structure and organization"""
        structure = {
            "total_files": len(files),
            "file_types": {},
            "directories": {},
            "largest_files": [],
            "recent_files": []
        }
        
        # Analyze file types
        for file in files:
            file_type = file.file_type or 'unknown'
            structure["file_types"][file_type] = structure["file_types"].get(file_type, 0) + 1
            
            # Analyze directory structure
            path_parts = file.path.split('/')
            if len(path_parts) > 1:
                directory = '/'.join(path_parts[:-1])
                if directory not in structure["directories"]:
                    structure["directories"][directory] = []
                structure["directories"][directory].append({
                    "name": file.name,
                    "type": file.file_type,
                    "size": file.size
                })
        
        # Get largest files
        sorted_files = sorted(files, key=lambda x: x.size or 0, reverse=True)
        structure["largest_files"] = [
            {
                "name": file.name,
                "path": file.path,
                "size": file.size,
                "type": file.file_type
            }
            for file in sorted_files[:5]
        ]
        
        # Get recent files
        sorted_by_date = sorted(files, key=lambda x: x.updated_at or x.created_at, reverse=True)
        structure["recent_files"] = [
            {
                "name": file.name,
                "path": file.path,
                "updated_at": file.updated_at.isoformat() if file.updated_at else None,
                "type": file.file_type
            }
            for file in sorted_by_date[:5]
        ]
        
        return structure
    
    def _analyze_commit_patterns(self, commits: List[Commit]) -> Dict[str, Any]:
        """Analyze commit patterns and contributors"""
        patterns = {
            "total_commits": len(commits),
            "contributors": {},
            "commit_frequency": {},
            "recent_activity": [],
            "commit_messages": []
        }
        
        # Analyze contributors
        for commit in commits:
            author = commit.author
            if author.username not in patterns["contributors"]:
                patterns["contributors"][author.username] = {
                    "commits": 0,
                    "first_commit": commit.timestamp,
                    "last_commit": commit.timestamp
                }
            
            patterns["contributors"][author.username]["commits"] += 1
            if commit.timestamp < patterns["contributors"][author.username]["first_commit"]:
                patterns["contributors"][author.username]["first_commit"] = commit.timestamp
            if commit.timestamp > patterns["contributors"][author.username]["last_commit"]:
                patterns["contributors"][author.username]["last_commit"] = commit.timestamp
        
        # Get recent activity
        patterns["recent_activity"] = [
            {
                "sha": commit.sha[:8],
                "message": commit.message,
                "author": commit.author.username,
                "timestamp": commit.timestamp.isoformat() if commit.timestamp else None
            }
            for commit in commits[:10]
        ]
        
        # Get commit messages for analysis
        patterns["commit_messages"] = [commit.message for commit in commits]
        
        return patterns
    
    def _get_repository_statistics(self, repo: RepositoryModel, files: List[RepositoryFile], 
                                 commits: List[Commit], collaborators: List[RepositoryCollaborator]) -> Dict[str, Any]:
        """Get comprehensive repository statistics"""
        total_size = sum(file.size or 0 for file in files)
        
        return {
            "total_files": len(files),
            "total_commits": len(commits),
            "total_collaborators": len(collaborators),
            "total_size_bytes": total_size,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "file_types_count": len(set(file.file_type for file in files if file.file_type)),
            "average_file_size": round(total_size / len(files), 2) if files else 0,
            "repository_age_days": (repo.updated_at - repo.created_at).days if repo.updated_at and repo.created_at else 0
        }
