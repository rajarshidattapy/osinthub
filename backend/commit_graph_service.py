import json
import uuid
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from models import (
    Commit, CommitFile, CommitGraph, Repository, RepositoryFile, User
)
from schemas import GraphNode, GraphEdge, GraphData


class CommitGraphService:
    """Service for generating and managing commit graphs"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def generate_commit_graph(self, repository_id: str, max_commits: int = 10) -> Dict[str, Any]:
        """
        Generate a commit graph for a repository
        
        Args:
            repository_id: Repository ID
            max_commits: Maximum number of commits to include
            
        Returns:
            Dictionary containing graph data
        """
        # Get commits for the repository
        commits = self.db.query(Commit).filter(
            Commit.repository_id == repository_id
        ).order_by(Commit.timestamp.desc()).limit(max_commits).all()
        
        if not commits:
            return {"nodes": [], "edges": [], "layout": {}}
        
        nodes = []
        edges = []
        
        # Create commit nodes
        for commit in commits:
            commit_node = GraphNode(
                id=f"commit_{commit.sha}",
                type="commit",
                label=f"{commit.sha[:8]}: {commit.message[:50]}...",
                metadata={
                    "sha": commit.sha,
                    "message": commit.message,
                    "author": commit.author.username if commit.author else "Unknown",
                    "timestamp": commit.timestamp.isoformat(),
                    "parent_sha": commit.parent_sha
                }
            )
            nodes.append(commit_node)
            
            # Create parent-child relationships between commits
            if commit.parent_sha:
                parent_node_id = f"commit_{commit.parent_sha}"
                edges.append(GraphEdge(
                    source=parent_node_id,
                    target=f"commit_{commit.sha}",
                    type="commit_parent",
                    metadata={"relationship": "parent_child"}
                ))
        
        # Create file nodes and relationships
        file_versions = {}  # Track file versions across commits
        
        for commit in commits:
            commit_files = self.db.query(CommitFile).filter(
                CommitFile.commit_id == commit.id
            ).all()
            
            for commit_file in commit_files:
                file_node_id = f"file_{commit_file.file_id}_{commit.sha}"
                
                # Create file node for this commit
                file_node = GraphNode(
                    id=file_node_id,
                    type="file",
                    label=f"{commit_file.file_path} ({commit_file.change_type})",
                    metadata={
                        "file_path": commit_file.file_path,
                        "change_type": commit_file.change_type,
                        "additions": commit_file.additions,
                        "deletions": commit_file.deletions,
                        "commit_sha": commit.sha
                    }
                )
                nodes.append(file_node)
                
                # Connect file to commit
                edges.append(GraphEdge(
                    source=f"commit_{commit.sha}",
                    target=file_node_id,
                    type="commit_to_file",
                    metadata={"relationship": "contains"}
                ))
                
                # Track file evolution
                file_key = commit_file.file_path
                if file_key in file_versions:
                    # Create edge from previous version to current version
                    previous_file_node = file_versions[file_key]
                    edges.append(GraphEdge(
                        source=previous_file_node,
                        target=file_node_id,
                        type="file_evolution",
                        metadata={
                            "relationship": "evolved_from",
                            "change_type": commit_file.change_type
                        }
                    ))
                
                file_versions[file_key] = file_node_id
        
        # Generate layout positions
        layout = self._generate_layout(nodes, edges)
        
        graph_data = {
            "nodes": [node.dict() for node in nodes],
            "edges": [edge.dict() for edge in edges],
            "layout": layout
        }
        
        return graph_data
    
    def _generate_layout(self, nodes: List[GraphNode], edges: List[GraphEdge]) -> Dict[str, Any]:
        """
        Generate layout positions for nodes using a simple algorithm
        
        Args:
            nodes: List of graph nodes
            edges: List of graph edges
            
        Returns:
            Layout configuration
        """
        layout = {}
        
        # Separate commit and file nodes
        commit_nodes = [node for node in nodes if node.type == "commit"]
        file_nodes = [node for node in nodes if node.type == "file"]
        
        # Position commit nodes in a vertical line
        commit_y_spacing = 200
        for i, commit_node in enumerate(commit_nodes):
            layout[commit_node.id] = {
                "x": 0,
                "y": i * commit_y_spacing,
                "level": 0
            }
        
        # Position file nodes to the right of their commits
        file_x_offset = 300
        file_y_spacing = 50
        
        for i, file_node in enumerate(file_nodes):
            # Find the commit this file belongs to
            commit_sha = file_node.metadata.get("commit_sha")
            if commit_sha:
                commit_node_id = f"commit_{commit_sha}"
                commit_y = layout.get(commit_node_id, {}).get("y", 0)
                
                layout[file_node.id] = {
                    "x": file_x_offset,
                    "y": commit_y + (i % 5) * file_y_spacing,  # Stack files vertically
                    "level": 1
                }
        
        return layout
    
    def save_commit_graph(self, repository_id: str, graph_data: Dict[str, Any]) -> CommitGraph:
        """
        Save commit graph to database
        
        Args:
            repository_id: Repository ID
            graph_data: Graph data to save
            
        Returns:
            Saved CommitGraph object
        """
        # Check if graph already exists
        existing_graph = self.db.query(CommitGraph).filter(
            CommitGraph.repository_id == repository_id
        ).first()
        
        if existing_graph:
            # Update existing graph
            existing_graph.graph_data = graph_data
            existing_graph.node_count = len(graph_data.get("nodes", []))
            existing_graph.edge_count = len(graph_data.get("edges", []))
            existing_graph.last_updated = datetime.utcnow()
            self.db.commit()
            return existing_graph
        else:
            # Create new graph
            commit_graph = CommitGraph(
                repository_id=repository_id,
                graph_data=graph_data,
                node_count=len(graph_data.get("nodes", [])),
                edge_count=len(graph_data.get("edges", []))
            )
            self.db.add(commit_graph)
            self.db.commit()
            self.db.refresh(commit_graph)
            return commit_graph
    
    def get_commit_graph(self, repository_id: str) -> Optional[CommitGraph]:
        """
        Get commit graph for a repository
        
        Args:
            repository_id: Repository ID
            
        Returns:
            CommitGraph object or None
        """
        return self.db.query(CommitGraph).filter(
            CommitGraph.repository_id == repository_id
        ).first()
    
    def add_commits_from_repo(self, repository_id: str, repo_path: str, max_commits: int = 5) -> List[Commit]:
        """
        Add commits from a git repository path
        
        Args:
            repository_id: Repository ID
            repo_path: Path to git repository
            max_commits: Maximum number of commits to add
            
        Returns:
            List of created Commit objects
        """
        import subprocess
        import os
        
        if not os.path.exists(repo_path):
            raise ValueError(f"Repository path does not exist: {repo_path}")
        
        try:
            # Get git log
            result = subprocess.run([
                'git', 'log', '--oneline', f'-{max_commits}',
                '--pretty=format:%H|%an|%ae|%ad|%s'
            ], cwd=repo_path, capture_output=True, text=True, check=True)
            
            commits = []
            lines = result.stdout.strip().split('\n')
            
            for line in lines:
                if not line:
                    continue
                    
                parts = line.split('|', 4)
                if len(parts) < 5:
                    continue
                
                sha, author_name, author_email, date_str, message = parts
                
                # Parse date
                from dateutil import parser
                timestamp = parser.parse(date_str)
                
                # Find or create user
                user = self.db.query(User).filter(User.email == author_email).first()
                if not user:
                    user = User(
                        clerk_id=str(uuid.uuid4()),
                        username=author_name.lower().replace(' ', '_'),
                        email=author_email,
                        role="contributor"
                    )
                    self.db.add(user)
                    self.db.commit()
                    self.db.refresh(user)
                
                # Create commit
                commit = Commit(
                    repository_id=repository_id,
                    sha=sha,
                    message=message,
                    author_id=user.id,
                    timestamp=timestamp
                )
                self.db.add(commit)
                commits.append(commit)
            
            self.db.commit()
            
            # Refresh commits to get IDs
            for commit in commits:
                self.db.refresh(commit)
            
            return commits
            
        except subprocess.CalledProcessError as e:
            raise ValueError(f"Failed to read git repository: {e}")
        except Exception as e:
            raise ValueError(f"Error processing repository: {e}")
    
    def create_file_relationships(self, repository_id: str) -> None:
        """
        Create file relationships based on file versions and changes
        
        Args:
            repository_id: Repository ID
        """
        # Get all commits for the repository
        commits = self.db.query(Commit).filter(
            Commit.repository_id == repository_id
        ).order_by(Commit.timestamp.asc()).all()
        
        file_history = {}  # Track file paths and their versions
        
        for commit in commits:
            commit_files = self.db.query(CommitFile).filter(
                CommitFile.commit_id == commit.id
            ).all()
            
            for commit_file in commit_files:
                file_path = commit_file.file_path
                
                # Track file evolution
                if file_path in file_history:
                    # Link to previous version
                    commit_file.previous_file_id = file_history[file_path]
                
                # Update file history
                file_history[file_path] = commit_file.file_id
        
        self.db.commit()
    
    def get_graph_statistics(self, repository_id: str) -> Dict[str, Any]:
        """
        Get statistics about the commit graph
        
        Args:
            repository_id: Repository ID
            
        Returns:
            Dictionary with graph statistics
        """
        commits = self.db.query(Commit).filter(
            Commit.repository_id == repository_id
        ).count()
        
        files = self.db.query(CommitFile).join(Commit).filter(
            Commit.repository_id == repository_id
        ).count()
        
        unique_files = self.db.query(CommitFile.file_path).join(Commit).filter(
            Commit.repository_id == repository_id
        ).distinct().count()
        
        return {
            "total_commits": commits,
            "total_file_changes": files,
            "unique_files": unique_files,
            "average_files_per_commit": files / commits if commits > 0 else 0
        }
