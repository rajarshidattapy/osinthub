// src/app/merge-requests/[mrId]/page.tsx (Corrected and Fully Functional)
"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { MergeRequestDetail } from "@/components/MergeRequest/MergeRequestDetail";
import { MergeRequest } from '@/types';

export default function SingleMergeRequestPage() {
  const navigate = useNavigate();
  const { mrId } = useParams<{ mrId: string }>();
  const { getToken, isLoaded } = useAuth();
  const [mergeRequest, setMergeRequest] = useState<MergeRequest | null>(null);

  useEffect(() => {
    if (!isLoaded || !mrId) return;

    const getMergeRequestData = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`http://localhost:8000/api/merge-requests/${mrId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch merge request details");
        const data = await res.json();
        setMergeRequest(data);
      } catch (error) {
        console.error("Error fetching merge request:", error);
      }
    };

    getMergeRequestData();
  }, [isLoaded, getToken, mrId]);

  if (!mergeRequest) {
    return <p className="p-4 text-gray-400">Loading merge request...</p>;
  }

  const handleBack = () => navigate('/merge-requests');

  return (
    <MergeRequestDetail
      mergeRequest={mergeRequest}
      onBack={handleBack}
    />
  );
}