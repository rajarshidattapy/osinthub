// src/app/merge-requests/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useLayout } from '@/contexts/LayoutContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { authenticatedFetch } from '@/lib/api';
import { API_BASE } from '@/lib/config';
import { MergeRequestList } from "@/components/MergeRequest/MergeRequestList";
import { CreateMergeRequestModal } from "@/components/MergeRequest/CreateMergeRequestModal";
import { MergeRequest, Repository, User } from '@/types';

// Raw backend shapes (partial) to aid mapping without using any
interface RawUser { id?: string; username?: string; avatar?: string; role?: string; email?: string; }
interface RawCollaborator { user?: RawUser; user_id?: string; }
interface RawRepository { id?: string; name?: string; description?: string; owner?: RawUser; owner_id?: string; is_private?: boolean; created_at?: string; updated_at?: string; fork_count?: number; collaborators?: RawCollaborator[]; }
interface RawAIValidation { status?: string; score?: number; feedback?: string; concerns?: string[]; suggestions?: string[]; }
interface RawFileChange { file_path?: string; file?: string; change_type?: string; additions?: number; deletions?: number; diff_content?: string; diff?: string; }
interface RawComment { id: string; author?: RawUser; author_id?: string; content: string; created_at?: string; line_number?: number; file_path?: string; }
interface RawMergeRequest { id: string; title: string; description?: string; author?: RawUser; author_id?: string; source_repo_id: string; target_repo_id: string; source_repo?: RawRepository; target_repo?: RawRepository; source_branch?: string; target_branch?: string; status?: string; ai_validation?: RawAIValidation; created_at?: string; updated_at?: string; file_changes?: RawFileChange[]; changes?: RawFileChange[]; comments?: RawComment[]; }

export default function MergeRequestsPage() {
  const navigate = useNavigate();
  const { getToken, isLoaded } = useAuth();
  const { setTitle } = useLayout();

  // State for data
  const [mergeRequests, setMergeRequests] = useState<MergeRequest[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);

  // State for UI
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    setTitle('Joining Requests');

    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("Authentication token not available.");

        // Fetch both merge requests and repositories in parallel
        const [mrRaw, repoRaw] = await Promise.all([
          authenticatedFetch(`${API_BASE}/api/merge-requests`, token),
          authenticatedFetch(`${API_BASE}/api/repositories`, token)
        ]);

        // Map backend repository shape to frontend Repository (lightweight; files loaded elsewhere)
        const mapRepo = (r: RawRepository): Repository => ({
          id: r.id || 'unknown-repo',
          name: r.name || 'unknown',
          description: r.description || '',
          owner: {
            id: r.owner?.id || r.owner_id || 'unknown',
            username: r.owner?.username || 'unknown',
            avatar: r.owner?.avatar || '/assets/person2.webp',
            role: (r.owner?.role || 'contributor') as User['role'],
            email: r.owner?.email || 'unknown@example.com'
          },
          isPrivate: !!r.is_private,
          createdAt: r.created_at || new Date().toISOString(),
          updatedAt: r.updated_at || r.created_at || new Date().toISOString(),
          forkedFrom: undefined,
          forkCount: r.fork_count || 0,
          files: [],
          collaborators: (r.collaborators || []).map((c: RawCollaborator) => ({
            id: c.user?.id || c.user_id || 'unknown-user',
            username: c.user?.username || 'unknown',
            avatar: c.user?.avatar || '/assets/person2.webp',
            role: (c.user?.role || 'contributor') as User['role'],
            email: c.user?.email || 'unknown@example.com'
          })),
        });

        const repositoriesMapped: Repository[] = ((repoRaw as RawRepository[]) || []).map(mapRepo);

        const allowedStatus = new Set(['open', 'closed', 'merged', 'draft']);
        const allowedAIStatus = new Set(['pending', 'approved', 'rejected', 'needs_review']);
        const mergeRequestsMapped: MergeRequest[] = ((mrRaw as RawMergeRequest[]) || []).map((m: RawMergeRequest) => ({
          id: m.id,
          title: m.title,
          description: m.description || '',
          author: {
            id: m.author?.id || m.author_id || 'unknown-user',
            username: m.author?.username || 'unknown',
            avatar: m.author?.avatar || '/assets/person2.webp',
            role: (m.author?.role || 'contributor') as User['role'],
            email: m.author?.email || 'unknown@example.com'
          },
          sourceRepo: repositoriesMapped.find(r => r.id === m.source_repo_id) || mapRepo(m.source_repo || {}),
          targetRepo: repositoriesMapped.find(r => r.id === m.target_repo_id) || mapRepo(m.target_repo || {}),
          sourceBranch: m.source_branch || 'main',
          targetBranch: m.target_branch || 'main',
          status: (allowedStatus.has(m.status || '') ? m.status : 'open') as MergeRequest['status'],
          aiValidation: {
            status: (allowedAIStatus.has(m.ai_validation?.status || '') ? m.ai_validation?.status : 'pending') as MergeRequest['aiValidation']['status'],
            score: m.ai_validation?.score || 0,
            feedback: m.ai_validation?.feedback || '',
            concerns: m.ai_validation?.concerns || [],
            suggestions: m.ai_validation?.suggestions || []
          },
          createdAt: m.created_at || new Date().toISOString(),
          updatedAt: m.updated_at || m.created_at || new Date().toISOString(),
          changes: (m.file_changes || m.changes || []).map((c: RawFileChange) => {
            const allowedChange = new Set(['added', 'modified', 'deleted']);
            const ct = (c.change_type || '').toLowerCase();
            return {
              file: c.file_path || c.file || 'unknown',
              type: (allowedChange.has(ct) ? ct : 'modified') as 'added' | 'modified' | 'deleted',
              additions: c.additions || 0,
              deletions: c.deletions || 0,
              diff: c.diff_content || c.diff || ''
            };
          }),
          comments: (m.comments || []).map((c: RawComment) => ({
            id: c.id,
            author: {
              id: c.author?.id || c.author_id || 'unknown-user',
              username: c.author?.username || 'unknown',
              avatar: c.author?.avatar || '/assets/person2.webp',
              role: (c.author?.role || 'contributor') as User['role'],
              email: c.author?.email || 'unknown@example.com'
            },
            content: c.content,
            createdAt: c.created_at || new Date().toISOString(),
            line: c.line_number,
            file: c.file_path
          }))
        }));

        setRepositories(repositoriesMapped);
        setMergeRequests(mergeRequestsMapped);
      } catch (err: unknown) {
        console.error("Failed to fetch data:", err);
        setError((err as Error).message || "Could not load data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, getToken, setTitle]);

  const handleBack = () => navigate(-1);

  const handleSelectMergeRequest = (mr: MergeRequest) => {
    navigate(`/merge-requests/${mr.id}`);
  };

  interface CreateMRPayload { title: string; description?: string; source_repo_id: string; target_repo_id: string; }
  const handleSubmitMergeRequest = async (data: CreateMRPayload) => {
    try {
      const token = await getToken();
      const newMRRaw = await authenticatedFetch(`${API_BASE}/api/merge-requests`, token, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      // Map and add the new MR for immediate UI feedback
      const mapped: MergeRequest = {
        id: newMRRaw.id,
        title: newMRRaw.title,
        description: newMRRaw.description || '',
        author: {
          id: newMRRaw.author?.id || newMRRaw.author_id,
          username: newMRRaw.author?.username || 'unknown',
          avatar: newMRRaw.author?.avatar || '/assets/person2.webp',
          role: (newMRRaw.author?.role || 'contributor') as User['role'],
          email: newMRRaw.author?.email || 'unknown@example.com'
        },
        sourceRepo: repositories.find(r => r.id === newMRRaw.source_repo_id) || repositories[0],
        targetRepo: repositories.find(r => r.id === newMRRaw.target_repo_id) || repositories[0],
        sourceBranch: newMRRaw.source_branch || 'main',
        targetBranch: newMRRaw.target_branch || 'main',
        status: newMRRaw.status || 'open',
        aiValidation: {
          status: newMRRaw.ai_validation?.status || 'pending',
          score: newMRRaw.ai_validation?.score || 0,
          feedback: newMRRaw.ai_validation?.feedback || '',
          concerns: newMRRaw.ai_validation?.concerns || [],
          suggestions: newMRRaw.ai_validation?.suggestions || []
        },
        createdAt: newMRRaw.created_at || new Date().toISOString(),
        updatedAt: newMRRaw.updated_at || newMRRaw.created_at || new Date().toISOString(),
        changes: [],
        comments: []
      };
      setMergeRequests(prev => [mapped, ...prev]);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating merge request:", error);
      // Optionally, display an error message in the modal
    }
  };

  if (isLoading) {
    return <p className="p-6 text-gray-400">Loading joining requests...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-400">Error: {error}</p>;
  }

  return (
    <>
      <MergeRequestList
        onBack={handleBack}
        onSelectMergeRequest={handleSelectMergeRequest}
        mergeRequests={mergeRequests}
        onCreateMergeRequest={() => setShowCreateModal(true)}
      />
      <CreateMergeRequestModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleSubmitMergeRequest}
        repositories={repositories}
      />
    </>
  );
}