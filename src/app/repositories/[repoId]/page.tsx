"use client";

import { useNavigate, useParams } from 'react-router-dom';
import { RepositoryView } from "@/components/Repository/RepositoryView";
import { Repository } from '@/types';
import  { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

export default function SingleRepositoryPage() {
  const navigate = useNavigate();
  const { repoId } = useParams<{ repoId: string }>();
  const { getToken, isLoaded } = useAuth();
  const [repository, setRepository] = useState<Repository | null>(null);

  useEffect(() => {
    if (!isLoaded || !repoId) return;

    const getRepositoryData = async () => {
      const token = await getToken();
      const res = await fetch(`http://localhost:8000/api/repositories/${repoId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setRepository(data);
    };

    getRepositoryData();
  }, [isLoaded, getToken, repoId]);

  if (!repository) return <p className="p-4 text-gray-400">Loading repository...</p>;

  const handleBack = () => navigate('/repositories');

  const handleFork = (repo: Repository) => {
    console.log("Forking repository:", repo.name);
  };

  const handleViewMergeRequests = () => {
    navigate(`/merge-requests?repoId=${repository.id}`);
  };

  return (
    <RepositoryView
      repository={repository}
      onBack={handleBack}
      onFork={handleFork}
      onViewMergeRequests={handleViewMergeRequests}
    />
  );
}
