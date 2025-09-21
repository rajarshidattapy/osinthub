// src/components/MergeRequest/CreateMergeRequestModal.tsx

import React, { useState, useEffect } from 'react';
import { X, GitMerge } from 'lucide-react';
import { Repository } from '@/types'; // Assuming you have this type defined

interface CreateMergeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  repositories: Repository[]; // Pass the list of repositories for the dropdowns
}

export const CreateMergeRequestModal: React.FC<CreateMergeRequestModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  repositories 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sourceRepoId, setSourceRepoId] = useState('');
  const [targetRepoId, setTargetRepoId] = useState('');

  // Reset form when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setSourceRepoId('');
      setTargetRepoId('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceRepoId || !targetRepoId) {
        alert("Please select both a source and target repository.");
        return;
    }
    onSubmit({ 
        title, 
        description, 
        source_repo_id: sourceRepoId, 
        target_repo_id: targetRepoId 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="card p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-fg">Create New Pull Request</h2>
            <button onClick={onClose} className="text-muted hover:text-fg">
                <X size={20} />
            </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted block mb-1">Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="form-input w-full" 
              placeholder="e.g., Add analysis of new malware samples"
              required 
            />
          </div>
          <div>
            <label className="text-sm text-muted block mb-1">Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="form-input w-full h-24"
              placeholder="Provide a detailed description of the changes..."
            />
          </div>
          <div>
            <label className="text-sm text-muted block mb-1">Source Repository (Your Fork)</label>
            <select value={sourceRepoId} onChange={e => setSourceRepoId(e.target.value)} className="form-input w-full" required>
                <option value="" disabled>Select a source repository...</option>
                {repositories.map(repo => (
                    <option key={repo.id} value={repo.id}>{repo.owner.username}/{repo.name}</option>
                ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-muted block mb-1">Target Repository (Base)</label>
            <select value={targetRepoId} onChange={e => setTargetRepoId(e.target.value)} className="form-input w-full" required>
                <option value="" disabled>Select a target repository...</option>
                {repositories.map(repo => (
                    <option key={repo.id} value={repo.id}>{repo.owner.username}/{repo.name}</option>
                ))}
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-grid">
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
            <button type="submit" className="btn-success flex items-center gap-2">
                <GitMerge size={16} />
                Create Pull Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};