// src/app/merge-requests/[mrId]/page.tsx (Corrected and Fully Functional)
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { MergeRequestDetail } from "@/components/MergeRequest/MergeRequestDetail";
import { MergeRequest, Repository, User } from '@/types';
import { apiService } from '@/services/api';
import { useLayout } from '@/contexts/LayoutContext';

export default function SingleMergeRequestPage() {
  const navigate = useNavigate();
  const { mrId } = useParams<{ mrId: string }>();
  const { getToken, isLoaded } = useAuth();
  const { setTitle } = useLayout();
  const [mergeRequest, setMergeRequest] = useState<MergeRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Raw shapes
  interface RawUser { id?: string; username?: string; avatar?: string; role?: string; email?: string; }
  interface RawRepo { id?: string; name?: string; description?: string; owner?: RawUser; owner_id?: string; is_private?: boolean; created_at?: string; updated_at?: string; fork_count?: number; collaborators?: { user?: RawUser; user_id?: string }[] }
  interface RawAI { status?: string; score?: number; feedback?: string; concerns?: string[]; suggestions?: string[] }
  interface RawChange { file_path?: string; file?: string; change_type?: string; additions?: number; deletions?: number; diff_content?: string; diff?: string }
  interface RawComment { id: string; author?: RawUser; author_id?: string; content: string; created_at?: string; line_number?: number; file_path?: string }
  interface RawMR { id: string; title: string; description?: string; author?: RawUser; author_id?: string; source_repo_id: string; target_repo_id: string; source_repo?: RawRepo; target_repo?: RawRepo; source_branch?: string; target_branch?: string; status?: string; ai_validation?: RawAI; created_at?: string; updated_at?: string; file_changes?: RawChange[]; changes?: RawChange[]; comments?: RawComment[] }

  const mapRepo = useCallback((r?: RawRepo): Repository => ({
    id: r?.id || 'unknown-repo',
    name: r?.name || 'unknown',
    description: r?.description || '',
    owner: {
      id: r?.owner?.id || r?.owner_id || 'unknown-user',
      username: r?.owner?.username || 'unknown',
      avatar: r?.owner?.avatar || '/assets/person2.webp',
      role: (r?.owner?.role || 'contributor') as User['role'],
      email: r?.owner?.email || 'unknown@example.com'
    },
    isPrivate: !!r?.is_private,
    createdAt: r?.created_at || new Date().toISOString(),
    updatedAt: r?.updated_at || r?.created_at || new Date().toISOString(),
    forkedFrom: undefined,
    forkCount: r?.fork_count || 0,
    files: [],
    collaborators: (r?.collaborators || []).map(c => ({
      id: c.user?.id || c.user_id || 'unknown-user',
      username: c.user?.username || 'unknown',
      avatar: c.user?.avatar || '/assets/person2.webp',
      role: (c.user?.role || 'contributor') as User['role'],
      email: c.user?.email || 'unknown@example.com'
    }))
  }), []);

  const mapMR = useCallback((m: RawMR): MergeRequest => {
    const allowedStatus = new Set(['open','closed','merged','draft']);
    const allowedAI = new Set(['pending','approved','rejected','needs_review']);
    return {
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
      sourceRepo: mapRepo(m.source_repo),
      targetRepo: mapRepo(m.target_repo),
      sourceBranch: m.source_branch || 'main',
      targetBranch: m.target_branch || 'main',
      status: (allowedStatus.has(m.status || '') ? m.status : 'open') as MergeRequest['status'],
      aiValidation: {
        status: (allowedAI.has(m.ai_validation?.status || '') ? m.ai_validation?.status : 'pending') as MergeRequest['aiValidation']['status'],
        score: m.ai_validation?.score || 0,
        feedback: m.ai_validation?.feedback || '',
        concerns: m.ai_validation?.concerns || [],
        suggestions: m.ai_validation?.suggestions || []
      },
      createdAt: m.created_at || new Date().toISOString(),
      updatedAt: m.updated_at || m.created_at || new Date().toISOString(),
      changes: (m.file_changes || m.changes || []).map(c => {
        const allowedChange = new Set(['added','modified','deleted']);
        const ct = (c.change_type || '').toLowerCase();
        return {
          file: c.file_path || c.file || 'unknown',
          type: (allowedChange.has(ct) ? ct : 'modified') as 'added'|'modified'|'deleted',
          additions: c.additions || 0,
          deletions: c.deletions || 0,
          diff: c.diff_content || c.diff || ''
        };
      }),
      comments: (m.comments || []).map(c => ({
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
    };
  }, [mapRepo]);

  useEffect(() => {
    if (!isLoaded || !mrId) return;

    const getMergeRequestData = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        const res = await fetch(`http://localhost:8000/api/merge-requests/${mrId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch merge request details");
        const data: RawMR = await res.json();
  const mapped = mapMR(data);
  setMergeRequest(mapped);
  setTitle(`MR: ${mapped.title}`);
        setError(null);
      } catch (error) {
        console.error("Error fetching merge request:", error);
        setError((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    getMergeRequestData();
  }, [isLoaded, getToken, mrId, mapMR, setTitle]);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const refreshMR = useCallback(async () => {
    if (!mrId) return;
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:8000/api/merge-requests/${mrId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data: RawMR = await res.json();
        setMergeRequest(mapMR(data));
      }
    } catch (e) {
      console.error('Failed to refresh MR', e);
    }
  }, [getToken, mrId, mapMR]);

  const handleMerge = async () => {
    if (!mergeRequest) return;
    setActionError(null);
    setActionLoading('merge');
    try {
      await apiService.mergeMergeRequest(mergeRequest.id, getToken);
      await refreshMR();
    } catch (e: any) {
      setActionError(e?.detail?.message || e.message || 'Merge failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClose = async () => {
    if (!mergeRequest) return;
    setActionError(null);
    setActionLoading('close');
    try {
      await apiService.closeMergeRequest(mergeRequest.id, getToken);
      await refreshMR();
    } catch (e: any) {
      setActionError(e?.detail?.message || e.message || 'Close failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleValidate = async () => {
    if (!mergeRequest) return;
    setActionError(null);
    setActionLoading('validate');
    try {
      await apiService.validateMergeRequest(mergeRequest.id, getToken);
      await refreshMR();
    } catch (e: any) {
      setActionError(e?.detail?.message || e.message || 'Validation failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) return <p className="p-4 text-gray-400">Loading merge request...</p>;
  if (error) return <p className="p-4 text-red-400">Error: {error}</p>;
  if (!mergeRequest) return null;

  const handleBack = () => navigate('/merge-requests');

  return (
    <div>
      {actionError && (
        <div className="mx-4 mb-4 p-3 rounded bg-red-900/40 border border-red-700 text-red-200 text-sm">
          {actionError}
        </div>
      )}
      <MergeRequestDetail
        mergeRequest={mergeRequest}
        onBack={handleBack}
        onMerge={actionLoading==='merge'? undefined : handleMerge}
        onClose={actionLoading==='close'? undefined : handleClose}
        onValidate={actionLoading==='validate'? undefined : handleValidate}
      />
    </div>
  );
}