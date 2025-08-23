import React, { useState } from 'react';
import { 
  GitFork, 
  Eye,  
  FileText, 
  Calendar,
  Users,
  Globe,
  Lock
} from 'lucide-react';
import { Repository } from '../../types';
import { FileExplorer } from '../Files/FileExplorer';
import { FileEditor } from '../Files/FileEditor';

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
  const [activeTab, setActiveTab] = useState<'code' | 'issues' | 'pulls' | 'security' | 'insights'>('code');

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
              { id: 'security', label: 'Security' },
              { id: 'insights', label: 'Insights' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'pulls') onViewMergeRequests();
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
      </div>
    </div>
  );
};