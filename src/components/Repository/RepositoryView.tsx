import React, { useState } from 'react';
import { 
  GitFork, 
  Eye,  
  FileText, 
  Calendar,
  Users,
  Globe,
  Lock,
  GitCommit
} from 'lucide-react';
import { Repository } from '../../types';
import { FileExplorer } from '../Files/FileExplorer';
import { FileEditor } from '../Files/FileEditor';
import { CommitGraphViewer } from '../CommitGraph/CommitGraphViewer';
import { CommitImportModal } from '../CommitGraph/CommitImportModal';

interface RepositoryViewProps {
  repository: Repository;
  onBack: () => void;
  onFork: (repo: Repository) => void;
  onViewMergeRequests: () => void;
}

export const RepositoryView: React.FC<RepositoryViewProps> = ({ 
  repository, 
  onBack, 
  onFork,
  onViewMergeRequests
}) => {
  const [selectedFile, setSelectedFile] = useState(repository.files[0]);
  const [activeTab, setActiveTab] = useState<'code' | 'issues' | 'pulls' | 'security' | 'insights' | 'commits'>('code');
  const [showCommitGraph, setShowCommitGraph] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Repository Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onBack}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                ← Back to repositories
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors">
                <Eye className="w-4 h-4" />
                <span>Watch</span>
              </button>
              
              <button 
                onClick={() => onFork(repository)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors"
              >
                <GitFork className="w-4 h-4" />
                <span>Fork</span>
                <span className="bg-gray-600 px-2 py-0.5 rounded-full text-xs">{repository.forkCount}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <img 
              src={repository.owner.avatar}
              alt={repository.owner.username}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex items-center space-x-2">
              <span className="text-blue-400 font-medium">{repository.owner.username}</span>
              <span className="text-gray-400">/</span>
              <span className="text-white text-xl font-semibold">{repository.name}</span>
              <div className="flex items-center space-x-1 ml-2">
                {repository.isPrivate ? (
                  <Lock className="w-4 h-4 text-gray-400" />
                ) : (
                  <Globe className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-gray-400 text-sm">
                  {repository.isPrivate ? 'Private' : 'Public'}
                </span>
              </div>
            </div>
          </div>

          <p className="text-gray-300 mb-4">{repository.description}</p>

          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Created {formatDate(repository.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{repository.collaborators.length} collaborators</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'code', label: 'Code', icon: FileText },
              { id: 'issues', label: 'Issues', count: 0 },
              { id: 'pulls', label: 'Pull Requests', count: 1 },
              { id: 'commits', label: 'Commits', icon: GitCommit },
              { id: 'security', label: 'Security' },
              { id: 'insights', label: 'Insights' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'pulls') onViewMergeRequests();
                  if (tab.id === 'commits') setShowCommitGraph(true);
                }}
                className={`flex items-center space-x-2 pb-3 border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'border-orange-500 text-white' 
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.icon && <tab.icon className="w-4 h-4" />}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        {activeTab === 'code' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <FileExplorer 
                files={repository.files} 
                selectedFile={selectedFile}
                onFileSelect={setSelectedFile}
              />
            </div>
            
            <div className="lg:col-span-2">
              <FileEditor file={selectedFile} />
            </div>
          </div>
        )}

        {/* Commit Graph Modal */}
        {showCommitGraph && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
              <CommitGraphViewer
                repositoryId={repository.id}
                onClose={() => {
                  setShowCommitGraph(false);
                  setActiveTab('code');
                }}
              />
            </div>
          </div>
        )}

        {/* Commit Import Modal */}
        {showImportModal && (
          <CommitImportModal
            isOpen={showImportModal}
            onClose={() => setShowImportModal(false)}
            repositoryId={repository.id}
            onImportComplete={() => {
              setShowImportModal(false);
              setShowCommitGraph(true);
            }}
          />
        )}

        {/* Commits Tab Content */}
        {activeTab === 'commits' && (
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <GitCommit className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Commit History</h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <GitCommit className="w-4 h-4" />
                    <span>Import Commits</span>
                  </button>
                  <button
                    onClick={() => setShowCommitGraph(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <GitCommit className="w-4 h-4" />
                    <span>View Graph</span>
                  </button>
                </div>
              </div>
              
              <div className="text-gray-400 text-center py-8">
                <GitCommit className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h4 className="text-lg font-semibold mb-2">No Commits Found</h4>
                <p className="mb-4">This repository doesn't have any commits yet.</p>
                <p className="text-sm">Import commits from a local git repository to visualize the commit history and file relationships.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};