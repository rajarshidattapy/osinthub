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
      case 'open': return <GitPullRequest className="w-4 h-4 text-green-400" />;
      case 'merged': return <CheckCircle className="w-4 h-4 text-purple-400" />;
      case 'closed': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusCount = (status: string) => {
    return mergeRequests.filter(mr => mr.status === status).length;
  };

  return (
    <div className="min-h-screen bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={onBack}
            className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
              <GitPullRequest className="w-8 h-8" />
              <span>Pull Requests</span>
            </h1>
            <p className="text-gray-400">Review and merge intelligence contributions</p>
          </div>
          
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <GitPullRequest className="w-4 h-4" />
            <span>New Pull Request</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-gray-700 mb-6">
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
                    ? 'border-orange-500 text-white' 
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {getStatusIcon(tab.id)}
                <span>{tab.label}</span>
                <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs">
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
          <div className="text-center py-16">
            <GitPullRequest className="w-16 h-16 mx-auto text-gray-400 mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No pull requests found</h3>
            <p className="text-gray-500">No pull requests match the current filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};