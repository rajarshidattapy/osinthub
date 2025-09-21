import React, { useState } from 'react';
import { ArrowLeft, GitPullRequest, CheckCircle, XCircle, Clock } from 'lucide-react';
import { MergeRequestCard } from './MergeRequestCard';
import { mergeRequests } from '../../data/mockData';
import { MergeRequest } from '../../types';

interface MergeRequestListProps {
  onBack: () => void;
  onSelectMergeRequest: (mr: MergeRequest) => void;
}

export const MergeRequestList: React.FC<MergeRequestListProps> = ({ 
  onBack, 
  onSelectMergeRequest 
}) => {
  const [filter, setFilter] = useState<'all' | 'open' | 'closed' | 'merged'>('all');

  const filteredMRs = mergeRequests.filter(mr => {
    if (filter === 'all') return true;
    return mr.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <GitPullRequest className="w-4 h-4" style={{color: 'var(--accent-success)'}} />;
      case 'merged': return <CheckCircle className="w-4 h-4" style={{color: 'var(--accent-primary)'}} />;
      case 'closed': return <XCircle className="w-4 h-4" style={{color: 'var(--accent-danger)'}} />;
      default: return <Clock className="w-4 h-4" style={{color: 'var(--fg-muted)'}} />;
    }
  };

  const getStatusCount = (status: string) => {
    return mergeRequests.filter(mr => mr.status === status).length;
  };

  return (
    <div className="app-container">
      <div className="page-container">
        <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={onBack}
            className="btn-outline flex items-center space-x-2 hover:text-blue-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        <div className="page-header">
          <div>
            <h1 className="page-title flex items-center space-x-3">
              <GitPullRequest className="w-8 h-8" />
              <span>Pull Requests</span>
            </h1>
            <p className="page-subtitle">Review and merge intelligence contributions</p>
          </div>
          
          <button className="btn-success flex items-center space-x-2">
            <GitPullRequest className="w-4 h-4" />
            <span>New Pull Request</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="border-b mb-6" style={{borderColor: 'var(--border-default)'}}>
          <nav className="flex space-x-8">
            {[
              { id: 'all', label: 'All', count: mergeRequests.length },
              { id: 'open', label: 'Open', count: getStatusCount('open') },
              { id: 'merged', label: 'Merged', count: getStatusCount('merged') },
              { id: 'closed', label: 'Closed', count: getStatusCount('closed') }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`flex items-center space-x-2 pb-3 border-b-2 transition-colors ${
                  filter === tab.id 
                    ? 'border-blue-500 text-fg' 
                    : 'border-transparent text-muted hover:text-fg'
                }`}
              >
                {getStatusIcon(tab.id)}
                <span>{tab.label}</span>
                <span className="px-2 py-0.5 rounded-full text-xs" style={{backgroundColor: 'var(--bg-2)', color: 'var(--fg-muted)'}}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Merge Request List */}
        <div className="space-y-4">
          {filteredMRs.map(mr => (
            <MergeRequestCard 
              key={mr.id} 
              mergeRequest={mr} 
              onSelect={onSelectMergeRequest}
            />
          ))}
        </div>

        {filteredMRs.length === 0 && (
          <div className="error-container">
            <GitPullRequest className="w-16 h-16 mx-auto mb-4 opacity-50" style={{color: 'var(--fg-subtle)'}} />
            <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--fg-muted)'}}>No pull requests found</h3>
            <p className="text-subtle">No pull requests match the current filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};