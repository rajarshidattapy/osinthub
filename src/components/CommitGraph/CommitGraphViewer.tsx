import React, { useState, useEffect, useRef } from 'react';
import { GitCommit, FileText, GitBranch, Users, Calendar, BarChart3 } from 'lucide-react';
import { useApiService } from '../../services/api';
import { commitGraph, graphStatistics, commitGraph2, graphStatistics2, nodeDiffs } from '../../data/mockData';

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
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { getToken } = useApiService();

  useEffect(() => {
    loadCommitGraph();
    loadStatistics();
  }, [repositoryId]);

  const loadCommitGraph = async () => {
    try {
      setLoading(true);
      // Use mock data for testing based on repository ID
      const mockGraph = repositoryId === '2' ? commitGraph2 : commitGraph;
      const mockStats = repositoryId === '2' ? graphStatistics2 : graphStatistics;
      setGraphData(mockGraph.graph_data);
      setStatistics(mockStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load commit graph');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      // Use mock data for testing based on repository ID
      const mockStats = repositoryId === '2' ? graphStatistics2 : graphStatistics;
      setStatistics(mockStats);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  const generateCommitGraph = async () => {
    try {
      setLoading(true);
      // Use mock data for testing based on repository ID
      const mockGraph = repositoryId === '2' ? commitGraph2 : commitGraph;
      const mockStats = repositoryId === '2' ? graphStatistics2 : graphStatistics;
      setGraphData(mockGraph.graph_data);
      setStatistics(mockStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate commit graph');
    } finally {
      setLoading(false);
    }
  };

  const calculateBounds = () => {
    if (!graphData) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    graphData.nodes.forEach(node => {
      if (node.position) {
        minX = Math.min(minX, node.position.x);
        maxX = Math.max(maxX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxY = Math.max(maxY, node.position.y);
      }
    });
    
    return { minX, maxX, minY, maxY };
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

    // Calculate bounds and center the graph
    const bounds = calculateBounds();
    const graphWidth = bounds.maxX - bounds.minX;
    const graphHeight = bounds.maxY - bounds.minY;
    
    // Add padding
    const padding = 50;
    const scaleX = (canvas.width - 2 * padding) / Math.max(graphWidth, 200);
    const scaleY = (canvas.height - 2 * padding) / Math.max(graphHeight, 200);
    const scale = Math.min(scaleX, scaleY, 1);
    
    // Center the graph
    const centerX = (canvas.width - graphWidth * scale) / 2;
    const centerY = (canvas.height - graphHeight * scale) / 2;

    // Apply pan and zoom
    const offsetX = centerX + panX;
    const offsetY = centerY + panY;

    // Draw edges first
    graphData.edges.forEach(edge => {
      const sourceNode = graphData.nodes.find(n => n.id === edge.source);
      const targetNode = graphData.nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode && sourceNode.position && targetNode.position) {
        const sourceX = (sourceNode.position.x - bounds.minX) * scale + offsetX;
        const sourceY = (sourceNode.position.y - bounds.minY) * scale + offsetY;
        const targetX = (targetNode.position.x - bounds.minX) * scale + offsetX;
        const targetY = (targetNode.position.y - bounds.minY) * scale + offsetY;
        
        ctx.strokeStyle = getEdgeColor(edge.type);
        ctx.lineWidth = 2 * zoom;
        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
      }
    });

    // Draw nodes
    graphData.nodes.forEach(node => {
      if (!node.position) return;

      const x = (node.position.x - bounds.minX) * scale + offsetX;
      const y = (node.position.y - bounds.minY) * scale + offsetY;
      const radius = 15 * zoom;
      
      // Draw node circle
      ctx.fillStyle = getNodeColor(node.type);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Draw node border
      ctx.strokeStyle = selectedNode?.id === node.id ? '#3b82f6' : '#374151';
      ctx.lineWidth = (selectedNode?.id === node.id ? 3 : 1) * zoom;
      ctx.stroke();

      // Draw node label
      ctx.fillStyle = '#ffffff';
      ctx.font = `${12 * zoom}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = node.label.length > 15 ? node.label.substring(0, 15) + '...' : node.label;
      ctx.fillText(label, x, y);
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
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Calculate bounds and scaling (same as in drawGraph)
    const bounds = calculateBounds();
    const graphWidth = bounds.maxX - bounds.minX;
    const graphHeight = bounds.maxY - bounds.minY;
    const padding = 50;
    const scaleX = (canvas.width - 2 * padding) / Math.max(graphWidth, 200);
    const scaleY = (canvas.height - 2 * padding) / Math.max(graphHeight, 200);
    const scale = Math.min(scaleX, scaleY, 1);
    const centerX = (canvas.width - graphWidth * scale) / 2;
    const centerY = (canvas.height - graphHeight * scale) / 2;
    const offsetX = centerX + panX;
    const offsetY = centerY + panY;

    // Find clicked node
    const clickedNode = graphData.nodes.find(node => {
      if (!node.position) return false;
      
      const nodeX = (node.position.x - bounds.minX) * scale + offsetX;
      const nodeY = (node.position.y - bounds.minY) * scale + offsetY;
      const radius = 15 * zoom;
      
      const distance = Math.sqrt(
        Math.pow(clickX - nodeX, 2) + Math.pow(clickY - nodeY, 2)
      );
      return distance <= radius;
    });

    setSelectedNode(clickedNode || null);
  };

  useEffect(() => {
    if (graphData) {
      drawGraph();
    }
  }, [graphData, selectedNode, panX, panY, zoom]);

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)));
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (event.button === 0) { // Left mouse button
      const startX = event.clientX - panX;
      const startY = event.clientY - panY;
      
      const handleMouseMove = (e: MouseEvent) => {
        setPanX(e.clientX - startX);
        setPanY(e.clientY - startY);
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const resetView = () => {
    setPanX(0);
    setPanY(0);
    setZoom(1);
  };

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 text-sm text-gray-300">
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
            <div className="flex items-center space-x-2">
              <button
                onClick={resetView}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Reset View
              </button>
              <div className="text-xs text-gray-400">
                Zoom: {Math.round(zoom * 100)}% | Pan: {panX.toFixed(0)}, {panY.toFixed(0)}
              </div>
            </div>
          </div>
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full h-96 border border-gray-600 rounded cursor-grab active:cursor-grabbing"
              onClick={handleCanvasClick}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
            />
            <div className="absolute top-2 right-2 text-xs text-gray-400 bg-gray-900/80 px-2 py-1 rounded">
              Scroll to zoom • Drag to pan
            </div>
          </div>
        </div>

        {/* Node Details */}
        {selectedNode && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Node Details</h3>
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                {selectedNode.metadata.author && (
                  <div>
                    <span className="text-gray-400">Author:</span>
                    <span className="ml-2 text-white">{selectedNode.metadata.author}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                {selectedNode.metadata.message && (
                  <div>
                    <span className="text-gray-400">Message:</span>
                    <span className="ml-2 text-white">{selectedNode.metadata.message}</span>
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
                {selectedNode.metadata.additions && (
                  <div>
                    <span className="text-gray-400">Changes:</span>
                    <span className="ml-2 text-green-400">+{selectedNode.metadata.additions}</span>
                    {selectedNode.metadata.deletions && (
                      <span className="ml-1 text-red-400">-{selectedNode.metadata.deletions}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Diff Content */}
            {nodeDiffs[selectedNode.id] && (
              <div className="mt-4">
                <h4 className="text-md font-semibold text-white mb-2">Changes from Previous Version</h4>
                <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 overflow-x-auto">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                    {nodeDiffs[selectedNode.id]}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
