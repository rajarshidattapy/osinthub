// src/app/repositories/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { authenticatedFetch } from '@/lib/api';
import { Plus, Search, Filter, GitBranch, Users, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { CreateRepositoryModal } from '@/components/CreateRepository/CreateRepositoryModal';

interface Repository {
  id: string;
  name: string;
  description: string;
  owner: string;
  collaborators: number;
  lastUpdated: string;
  isPrivate: boolean;
  language: string;
}

export default function RepositoriesPage() {
  const { getToken, isLoaded } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdRepo, setCreatedRepo] = useState<Repository | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    const fetchRepositories = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await authenticatedFetch('http://localhost:8000/api/repositories/', token);
        setRepositories(data);
      } catch (error) {
        console.error("Failed to fetch repositories", error);
        setError("Failed to load repositories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepositories();
  }, [isLoaded, getToken]);

  const handleSelectRepository = (repo: Repository) => {
    // Navigate to repository detail page
    window.location.href = `/repositories/${repo.id}`;
  };

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (isLoading || !isLoaded) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <p className="loading-text">Loading repositories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error-container">
          <h3 className="error-title">Error Loading Repositories</h3>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  interface CreateRepoForm { name: string; description: string; isPrivate: boolean; template?: string }
  const handleCreateRepository = async (data: CreateRepoForm) => {
    if (!isLoaded) return;
    setCreating(true);
    setCreateError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('No auth token');
      const res = await fetch('http://localhost:8000/api/repositories/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          is_private: data.isPrivate
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({detail:'Failed'}));
        throw new Error(err.detail || 'Failed creating repository');
      }
      const created = await res.json();
      // Map backend fields to this page's Repository interface shape
      const mapped: Repository = {
        id: created.id,
        name: created.name,
        description: created.description || '',
        owner: created.owner?.username || 'You',
        collaborators: created.collaborators ? created.collaborators.length : 1,
        lastUpdated: created.updated_at || created.updatedAt || created.created_at || created.createdAt,
        isPrivate: created.is_private ?? created.isPrivate ?? false,
        language: 'N/A'
      };
      setRepositories(prev => [mapped, ...prev]);
      setCreatedRepo(mapped);
      setShowCreateModal(false);
      // Navigate directly to the new repository after a short delay so user sees toast
      setTimeout(()=>{
        window.location.href = `/repositories/${mapped.id}`;
      }, 1200);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="app-container">
      <div className="page-container">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title flex items-center space-x-3">
              <GitBranch className="w-8 h-8" />
              <span>OSINT Repositories</span>
            </h1>
            <p className="page-subtitle">Collaborative intelligence investigations</p>
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Repository</span>
          </button>
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
            <select className="form-input">
              <option>All Repositories</option>
              <option>My Repositories</option>
              <option>Shared with me</option>
            </select>
            <button className="btn-outline flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

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
                    <h3 className="repo-title">{repo.name}</h3>
                    {repo.isPrivate && (
                      <span className="status-warning text-xs">Private</span>
                    )}
                  </div>
                  <div className="text-xs px-2 py-1 rounded" style={{backgroundColor: 'var(--bg-2)', color: 'var(--fg-muted)'}}>
                    {repo.language}
                  </div>
                </div>
                
                <p className="repo-description">
                  {repo.description || 'No description provided'}
                </p>
                
                <div className="repo-meta">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{repo.collaborators} collaborators</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Updated {formatTimeAgo(repo.lastUpdated)}</span>
                  </div>
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
        {/* Create Repository Modal */}
        <CreateRepositoryModal 
          isOpen={showCreateModal} 
          onClose={()=>{ if(!creating){ setShowCreateModal(false); setCreateError(null); } }}
          onSubmit={handleCreateRepository}
          isLoading={creating}
        />
        {/* Creation feedback */}
        {(createdRepo || createError) && (
          <div className="fixed bottom-4 right-4 space-y-2 w-80">
            {createdRepo && (
              <div className="flex items-start space-x-2 p-3 rounded-lg bg-green-900/30 border border-green-700 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                <div>
                  <p className="text-green-300 font-medium">Repository Created</p>
                  <p className="text-green-200/80">{createdRepo.name}</p>
                </div>
              </div>
            )}
            {createError && (
              <div className="flex items-start space-x-2 p-3 rounded-lg bg-red-900/30 border border-red-700 text-sm">
                <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-300 font-medium">Creation Failed</p>
                  <p className="text-red-200/80">{createError}</p>
                </div>
                <button onClick={()=>setCreateError(null)} className="text-red-300 hover:text-red-100 text-xs">Dismiss</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}