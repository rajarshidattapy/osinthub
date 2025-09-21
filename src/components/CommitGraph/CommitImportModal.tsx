import React, { useState } from 'react';
import { GitCommit, FolderOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { useApiService } from '../../services/api';
import { commits, commits2 } from '../../data/mockData';

interface CommitImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  repositoryId: string;
  onImportComplete: () => void;
}

export const CommitImportModal: React.FC<CommitImportModalProps> = ({
  isOpen,
  onClose,
  repositoryId,
  onImportComplete
}) => {
  const [repoPath, setRepoPath] = useState('');
  const [maxCommits, setMaxCommits] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [importedCommits, setImportedCommits] = useState<any[]>([]);
  const { getToken } = useApiService();

  const handleImport = async () => {
    if (!repoPath.trim()) {
      setError('Please enter a repository path');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Use mock data for testing based on repository ID
      const mockCommits = (repositoryId === '2' ? commits2 : commits).slice(0, maxCommits);
      setImportedCommits(mockCommits);
      setSuccess(true);
      onImportComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import commits');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRepoPath('');
    setMaxCommits(5);
    setError(null);
    setSuccess(false);
    setImportedCommits([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <GitCommit className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Import Commits from Git Repository</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Commits imported successfully!</span>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Imported Commits</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {importedCommits.map((commit, index) => (
                  <div key={index} className="bg-gray-700 rounded p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-mono text-blue-400">
                        {commit.sha?.substring(0, 8)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(commit.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300">{commit.message}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleClose}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Repository Path
                </label>
                <div className="flex items-center space-x-2">
                  <FolderOpen className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={repoPath}
                    onChange={(e) => setRepoPath(e.target.value)}
                    placeholder="/path/to/your/git/repository"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Enter the absolute path to your local git repository
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Maximum Commits
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={maxCommits}
                  onChange={(e) => setMaxCommits(parseInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Number of recent commits to import (1-20)
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-400 bg-red-900/20 border border-red-500/20 rounded-lg p-3">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={handleImport}
                disabled={loading || !repoPath.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <GitCommit className="w-4 h-4" />
                    <span>Import Commits</span>
                  </>
                )}
              </button>
              <button
                onClick={handleClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
