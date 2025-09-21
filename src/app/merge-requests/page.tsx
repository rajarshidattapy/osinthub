// src/app/merge-requests/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { authenticatedFetch } from '@/lib/api';
import { MergeRequestList } from "@/components/MergeRequest/MergeRequestList";
import { CreateMergeRequestModal } from "@/components/MergeRequest/CreateMergeRequestModal";
import { MergeRequest, Repository } from '@/types';

export default function MergeRequestsPage() {
  const navigate = useNavigate();
  const { getToken, isLoaded } = useAuth();
  
  // State for data
  const [mergeRequests, setMergeRequests] = useState<MergeRequest[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  
  // State for UI
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("Authentication token not available.");

        // Fetch both merge requests and repositories in parallel
        const [mrData, repoData] = await Promise.all([
          authenticatedFetch('http://localhost:8000/api/merge-requests', token),
          authenticatedFetch('http://localhost:8000/api/repositories', token)
        ]);

        setMergeRequests(mrData);
        setRepositories(repoData);
      } catch (err: any) {
        console.error("Failed to fetch data:", err);
        setError(err.message || "Could not load data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, getToken]);

  const handleBack = () => navigate(-1);

  const handleSelectMergeRequest = (mr: MergeRequest) => {
    navigate(`/merge-requests/${mr.id}`);
  };

  const handleSubmitMergeRequest = async (data: any) => {
    try {
      const token = await getToken();
      const newMR = await authenticatedFetch('http://localhost:8000/api/merge-requests', token, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      // Add the new MR to the top of the list for immediate UI feedback
      setMergeRequests(prev => [newMR, ...prev]);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating merge request:", error);
      // Optionally, display an error message in the modal
    }
  };

  if (isLoading) {
    return <p className="p-6 text-gray-400">Loading merge requests...</p>;
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