// src/app/repositories/page.tsx - Using improved API
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { repositoryApi, handleApiError } from '@/lib/api';
import { Plus, Search, Filter, GitBranch, Users, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { CreateRepositoryModal } from '@/components/CreateRepository/CreateRepositoryModal';

interface Repository {
  id: string;
  name: string;
  description: string;
  owner: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
  };
  collaborators: any[];
  created_at: string;
  updated_at: string;
  is_private: boolean;
  fork_count: number;
  language?: string;
  forked_from?: {
    id: string;
    name: string;
    owner: {
      username: string;
    };
  };
}

export default function RepositoriesPage() {
  const { getToken, isLoaded } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'my' | 'shared'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fetchRepositories = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const data = await repositoryApi.list(token);
      setRepositories(data);
      
    } catch (error: any) {
      handleApiError(error, setError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    fetchRepositories();
  }, [isLoaded, getToken]);

  const handleSelectRepository = (repo: Repository) => {
    // Navigate to repository detail page
    window.location.href = `/repositories/${repo.id}`;
  };

  const handleSubmitRepository = async (formData: any) => {
    setIsCreating(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Transform form data to match backend schema
      const repoData = {
        name: formData.name,
        description: formData.description || '',
        is_private: formData.isPrivate || false,
      };

      const newRepo = await repositoryApi.create(token, repoData);
      
      // Add the new repository to the list
      setRepositories(prev => [newRepo, ...prev]);
      setShowCreateModal(false);
      
    } catch (error: any) {
      handleApiError(error, setError);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredRepositories = repositories.filter(repo => {
    // Search filter
    const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    // Type filter
    switch (filterType) {
      case 'my':
        return true; // Assuming current user's repos (you might want to add user ID check)
      case 'shared':
        return repo.collaborators && repo.collaborators.length > 0;
      default:
        return true;
    }
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isLoaded) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <p className="loading-text">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="page-container">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-300 font-medium">Error</p>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={fetchRepositories}
                className="text-red-400 hover:text-red-300 p-1"
                title="Retry"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title flex items-center space-x-3">
              <GitBranch className="w-8 h-8" />
              <span>OSINT Repositories</span>
            </h1>
            <p className="page-subtitle">Collaborative intelligence investigations</p>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={fetchRepositories}
              disabled={isLoading}
              className="btn-outline flex items-center space-x-2 disabled:opacity-50"
              title="Refresh repositories"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            <button 
              onClick={() => setShowCreateModal(true)}
              disabled={isCreating}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isCreating ? 'Creating...' : 'New Repository'}</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{color: 'var(--fg-subtle)'}} />
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10 w-full"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="form-input"
            >
              <option value="all">All Repositories</option>
              <option value="my">My Repositories</option>
              <option value="shared">Shared with me</option>
            </select>
            <button className="btn-outline flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && repositories.length === 0 ? (
          <div className="loading-container">
            <p className="loading-text">Loading repositories...</p>
          </div>
        ) : (
          <>
            {/* Repository Grid */}
            {filteredRepositories.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredRepositories.map(repo => (
                  <div 
                    key={repo.id}
                    className="repo-card"
                    onClick={() => handleSelectRepository(repo)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <GitBranch className="w-5 h-5" style={{color: 'var(--accent-primary)'}} />
                        <h3 className="repo-title">
                          {repo.owner?.username || 'Unknown'}/{repo.name}
                        </h3>
                        {repo.is_private && (
                          <span className="status-warning text-xs">Private</span>
                        )}
                      </div>
                      <div className="text-xs px-2 py-1 rounded" style={{backgroundColor: 'var(--bg-2)', color: 'var(--fg-muted)'}}>
                        {repo.language || 'Mixed'}
                      </div>
                    </div>
                    
                    <p className="repo-description">
                      {repo.description || 'No description provided'}
                    </p>
                    
                    <div className="repo-meta">
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{repo.collaborators?.length || 0} collaborators</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Updated {formatTimeAgo(repo.updated_at || repo.created_at)}</span>
                      </div>
                      {repo.forked_from && (
                        <div className="text-xs text-blue-400 col-span-2">
                          Forked from {repo.forked_from.owner.username}/{repo.forked_from.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="error-container">
                <GitBranch className="w-16 h-16 mx-auto mb-4 opacity-50" style={{color: 'var(--fg-subtle)'}} />
                <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--fg-muted)'}}>
                  {searchTerm ? 'No repositories match your search' : 'No repositories found'}
                </h3>
                <p className="error-message">
                  {searchTerm 
                    ? 'Try adjusting your search terms or filters.' 
                    : 'Create your first repository to get started with collaborative OSINT investigations.'
                  }
                </p>
                {!searchTerm && (
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary mt-4"
                  >
                    Create Your First Repository
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Repository Modal */}
      <CreateRepositoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleSubmitRepository}
        isLoading={isCreating}
      />
    </div>
  );
}