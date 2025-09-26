"use client";

import { useNavigate, useParams } from 'react-router-dom';
import { RepositoryView } from "@/components/Repository/RepositoryView";
import { Repository, RepositoryFile, User } from '@/types';
import  { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { apiService } from '@/services/api';
import { useLayout } from '@/contexts/LayoutContext';

export default function SingleRepositoryPage() {
  const navigate = useNavigate();
  const { repoId } = useParams<{ repoId: string }>();
  const { getToken, isLoaded } = useAuth();
  const [repository, setRepository] = useState<Repository | null>(null);
  const { setTitle } = useLayout();
  const [files, setFiles] = useState<RepositoryFile[]>([]);
  // Commits deferred (fetch disabled until integrated into UI/chatbot)
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  interface RawUser { id?: string; username?: string; avatar?: string; role?: string; email?: string }
  interface RawCollaborator { user?: RawUser; user_id?: string }
  interface RawRepo { id: string; name: string; description?: string; owner?: RawUser; owner_id?: string; is_private?: boolean; isPrivate?: boolean; created_at?: string; createdAt?: string; updated_at?: string; updatedAt?: string; fork_count?: number; collaborators?: RawCollaborator[] }
  interface RawFile { id: string; name: string; path: string; content?: string; file_type?: string; size?: number; updated_at?: string; created_at?: string }
  const mapBackendRepo = useCallback((raw: RawRepo): Repository => {
    const owner: User = {
      id: raw.owner?.id || raw.owner_id || 'owner',
      username: raw.owner?.username || 'owner',
      avatar: raw.owner?.avatar || '/assets/person2.webp',
      role: (['admin','analyst','contributor','viewer'].includes((raw.owner?.role || 'contributor') as string) 
        ? (raw.owner?.role || 'contributor') 
        : 'contributor') as User['role'],
      email: raw.owner?.email || 'unknown@example.com'
    };
    const collaborators: User[] = (raw.collaborators || []).map((c: RawCollaborator) => {
      const roleStr = c.user?.role || 'contributor';
      const safeRole = (['admin','analyst','contributor','viewer'].includes(roleStr) ? roleStr : 'contributor') as User['role'];
      return {
        id: c.user?.id || c.user_id || 'collab',
        username: c.user?.username || 'collaborator',
        avatar: c.user?.avatar || '/assets/person2.webp',
        role: safeRole,
        email: c.user?.email || 'collab@example.com'
      };
    });
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description || '',
      owner,
      isPrivate: raw.is_private ?? raw.isPrivate ?? false,
      createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updated_at || raw.updatedAt || raw.created_at || new Date().toISOString(),
      forkedFrom: undefined,
      forkCount: raw.fork_count ?? 0,
      files: [], // replaced after file fetch
      collaborators
    };
  }, []);

  useEffect(() => {
    let aborted = false;
    (async () => {
      if (!isLoaded || !repoId) return;
      setLoading(true);
      setError(null);
      try {
        const tokenFn = getToken;
        const rawRepo = await apiService.getRepository(repoId, tokenFn);
        if (aborted) return;
        const mapped = mapBackendRepo(rawRepo);
  setRepository(mapped);
  setTitle(`Repo: ${mapped.name}`);
        // Fire file & commit fetches concurrently
        const [rawFiles] = await Promise.allSettled([
          apiService.getRepositoryFiles(repoId, tokenFn)
        ]);
        if (aborted) return;
        let mappedFiles: RepositoryFile[] = [];
        if (rawFiles.status === 'fulfilled') {
          const allowedTypes = ['markdown','json','csv','txt'] as const;
          type Allowed = typeof allowedTypes[number];
          const isAllowed = (val: string): val is Allowed => allowedTypes.includes(val as Allowed);
          mappedFiles = (rawFiles.value as RawFile[]).map((rf) => {
            const t = (rf.file_type || 'txt').toLowerCase();
            const safeType: Allowed = isAllowed(t) ? t : 'txt';
            return {
              id: rf.id,
              name: rf.name,
              path: rf.path,
              content: rf.content || '',
              type: safeType,
              size: rf.size || 0,
              lastModified: rf.updated_at || rf.created_at || new Date().toISOString(),
              author: mapped.owner
            };
          });
          setFiles(mappedFiles);
        }
        // Commits fetch suppressed for now (will integrate in future enhancement)
        // Attach just-fetched files (not stale captured state)
        setRepository(prev => prev ? { ...prev, files: mappedFiles } : prev);
      } catch (e) {
        if (!aborted) {
          setError(e instanceof Error ? e.message : 'Failed to load repository');
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => { aborted = true; };
  }, [isLoaded, repoId, getToken, mapBackendRepo, setTitle]);

  // Skeleton UI
  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-gray-800 rounded" />
        <div className="h-4 w-96 bg-gray-800 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-800 rounded" />
          <div className="lg:col-span-2 h-64 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900/40 border border-red-700 text-red-300 p-4 rounded-lg max-w-lg">
          <p className="font-semibold mb-1">Failed to load repository</p>
          <p className="text-sm opacity-80 mb-3">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-outline text-sm">Retry</button>
        </div>
      </div>
    );
  }

  if (!repository) return null;

  const handleBack = () => navigate('/repositories');

  const handleFork = (repo: Repository) => {
    console.log("Forking repository:", repo.name);
  };

  const handleViewMergeRequests = () => {
    navigate(`/merge-requests?repoId=${repository.id}`);
  };

  return (
    <RepositoryView
      repository={{ ...repository, files: files.length ? files : repository.files }}
      onBack={handleBack}
      onFork={handleFork}
      onViewMergeRequests={handleViewMergeRequests}
    />
  );
}
