import React, { useState, useEffect, useRef } from 'react';
import { GitCommit, FileText, GitBranch, Users, Calendar, BarChart3 } from 'lucide-react';
import { useApiService } from '../../services/api';

interface GraphNode {
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

interface GraphEdge {
  source: string;
  target: string;
  type: string;
  metadata: {
    relationship: string;
    change_type?: string;
  };
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  layout: Record<string, { x: number; y: number; level: number }>;
}

interface CommitGraphViewerProps {
  repositoryId: string;
  onClose: () => void;
}

export const CommitGraphViewer: React.FC<CommitGraphViewerProps> = ({
  repositoryId,
  onClose
}) => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { getToken } = useApiService();

  useEffect(() => {
    loadCommitGraph();
    loadStatistics();
  }, [repositoryId]);

  const loadCommitGraph = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch(`/api/repositories/${repositoryId}/graph`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load commit graph');
      }

      const data = await response.json();
      setGraphData(data.graph_data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load commit graph');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/repositories/${repositoryId}/graph/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  const generateCommitGraph = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch(`/api/repositories/${repositoryId}/graph/generate?max_commits=10`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate commit graph');
      }

      const data = await response.json();
      setGraphData(data.graph);
      await loadStatistics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate commit graph');
    } finally {
      setLoading(false);
    }
  };

  const drawGraph = () => {
    if (!graphData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges first
    graphData.edges.forEach(edge => {
      const sourceNode = graphData.nodes.find(n => n.id === edge.source);
      const targetNode = graphData.nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode && sourceNode.position && targetNode.position) {
        const sourcePos = sourceNode.position;
        const targetPos = targetNode.position;
        
        ctx.strokeStyle = getEdgeColor(edge.type);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);
        ctx.stroke();
      }
    });

    // Draw nodes
    graphData.nodes.forEach(node => {
      if (!node.position) return;

      const { x, y } = node.position;
      
      // Draw node circle
      ctx.fillStyle = getNodeColor(node.type);
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, 2 * Math.PI);
      ctx.fill();

      // Draw node border
      ctx.strokeStyle = selectedNode?.id === node.id ? '#3b82f6' : '#374151';
      ctx.lineWidth = selectedNode?.id === node.id ? 3 : 1;
      ctx.stroke();

      // Draw node label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label.substring(0, 20), x, y + 4);
    });
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'commit': return '#10b981';
      case 'file': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getEdgeColor = (type: string) => {
    switch (type) {
      case 'commit_parent': return '#3b82f6';
      case 'commit_to_file': return '#10b981';
      case 'file_evolution': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!graphData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked node
    const clickedNode = graphData.nodes.find(node => {
      if (!node.position) return false;
      const distance = Math.sqrt(
        Math.pow(x - node.position.x, 2) + Math.pow(y - node.position.y, 2)
      );
      return distance <= 15;
    });

    setSelectedNode(clickedNode || null);
  };

  useEffect(() => {
    if (graphData) {
      drawGraph();
    }
  }, [graphData, selectedNode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-6">
        <div className="flex items-center space-x-2 text-red-400 mb-4">
          <GitCommit className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Error Loading Commit Graph</h3>
        </div>
        <p className="text-red-300 mb-4">{error}</p>
        <div className="flex space-x-2">
          <button
            onClick={generateCommitGraph}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Generate Graph
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!graphData) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center space-x-2 text-gray-300 mb-4">
          <GitCommit className="w-5 h-5" />
          <h3 className="text-lg font-semibold">No Commit Graph Found</h3>
        </div>
        <p className="text-gray-400 mb-4">
          This repository doesn't have a commit graph yet. Generate one to visualize the commit history and file relationships.
        </p>
        <div className="flex space-x-2">
          <button
            onClick={generateCommitGraph}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Generate Graph
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <GitCommit className="w-5 h-5 text-green-400" />
          <h2 className="text-xl font-semibold text-white">Commit Graph</h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={generateCommitGraph}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Regenerate
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="p-4 border-b border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-gray-300">
                <GitCommit className="w-4 h-4" />
                <span className="text-sm">Commits</span>
              </div>
              <div className="text-2xl font-bold text-white">{statistics.total_commits}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-gray-300">
                <FileText className="w-4 h-4" />
                <span className="text-sm">File Changes</span>
              </div>
              <div className="text-2xl font-bold text-white">{statistics.total_file_changes}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-gray-300">
                <FileText className="w-4 h-4" />
                <span className="text-sm">Unique Files</span>
              </div>
              <div className="text-2xl font-bold text-white">{statistics.unique_files}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-gray-300">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">Avg Files/Commit</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {statistics.average_files_per_commit.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graph Visualization */}
      <div className="p-4">
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-300 mb-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Commits</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Files</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Relationships</span>
            </div>
          </div>
          <canvas
            ref={canvasRef}
            className="w-full h-96 border border-gray-600 rounded cursor-pointer"
            onClick={handleCanvasClick}
          />
        </div>

        {/* Node Details */}
        {selectedNode && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Node Details</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Type:</span>
                <span className="ml-2 text-white capitalize">{selectedNode.type}</span>
              </div>
              <div>
                <span className="text-gray-400">Label:</span>
                <span className="ml-2 text-white">{selectedNode.label}</span>
              </div>
              {selectedNode.metadata.sha && (
                <div>
                  <span className="text-gray-400">SHA:</span>
                  <span className="ml-2 text-white font-mono">{selectedNode.metadata.sha}</span>
                </div>
              )}
              {selectedNode.metadata.message && (
                <div>
                  <span className="text-gray-400">Message:</span>
                  <span className="ml-2 text-white">{selectedNode.metadata.message}</span>
                </div>
              )}
              {selectedNode.metadata.author && (
                <div>
                  <span className="text-gray-400">Author:</span>
                  <span className="ml-2 text-white">{selectedNode.metadata.author}</span>
                </div>
              )}
              {selectedNode.metadata.file_path && (
                <div>
                  <span className="text-gray-400">File Path:</span>
                  <span className="ml-2 text-white">{selectedNode.metadata.file_path}</span>
                </div>
              )}
              {selectedNode.metadata.change_type && (
                <div>
                  <span className="text-gray-400">Change Type:</span>
                  <span className="ml-2 text-white capitalize">{selectedNode.metadata.change_type}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
