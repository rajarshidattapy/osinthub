import React from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, MessageSquare, Calendar, User } from 'lucide-react';
import { MergeRequest } from '../../types';

interface MergeRequestCardProps {
  mergeRequest: MergeRequest;
  onSelect: (mr: MergeRequest) => void;
}

export const MergeRequestCard: React.FC<MergeRequestCardProps> = ({ mergeRequest, onSelect }) => {
  const getStatusBadge = () => {
    const { status, aiValidation } = mergeRequest;
    
    if (status === 'merged') {
      return (
        <div className="flex items-center space-x-1 bg-purple-900 text-purple-200 px-2 py-1 rounded-full text-xs">
          <CheckCircle className="w-3 h-3" />
          <span>Merged</span>
        </div>
      );
    }
    
    if (status === 'closed') {
      return (
        <div className="flex items-center space-x-1 bg-red-900 text-red-200 px-2 py-1 rounded-full text-xs">
          <XCircle className="w-3 h-3" />
          <span>Closed</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-1 bg-green-900 text-green-200 px-2 py-1 rounded-full text-xs">
        <Clock className="w-3 h-3" />
        <span>Open</span>
      </div>
    );
  };

  const getAIValidationBadge = () => {
    const { aiValidation } = mergeRequest;
    
    switch (aiValidation.status) {
      case 'approved':
        return (
          <div className="flex items-center space-x-1 bg-green-900 text-green-200 px-2 py-1 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            <span>AI Approved ({Math.round(aiValidation.score * 100)}%)</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center space-x-1 bg-red-900 text-red-200 px-2 py-1 rounded-full text-xs">
            <XCircle className="w-3 h-3" />
            <span>AI Rejected</span>
          </div>
        );
      case 'needs_review':
        return (
          <div className="flex items-center space-x-1 bg-yellow-900 text-yellow-200 px-2 py-1 rounded-full text-xs">
            <AlertTriangle className="w-3 h-3" />
            <span>Needs Review</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1 bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            <span>AI Pending</span>
          </div>
        );
    }
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffHours = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div 
      className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors cursor-pointer"
      onClick={() => onSelect(mergeRequest)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-white hover:text-blue-400 transition-colors">
              {mergeRequest.title}
            </h3>
            {getStatusBadge()}
            {getAIValidationBadge()}
          </div>
          
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {mergeRequest.description}
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{mergeRequest.author.username}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{timeAgo(mergeRequest.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-3 h-3" />
              <span>{mergeRequest.comments.length} comments</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <img
            src={mergeRequest.author.avatar}
            alt={mergeRequest.author.username}
            className="w-8 h-8 rounded-full"
          />
        </div>
      </div>
      
      {/* Change Summary */}
      <div className="flex items-center space-x-4 text-sm bg-gray-700 rounded p-3">
        <span className="text-gray-300">
          {mergeRequest.changes.length} file{mergeRequest.changes.length !== 1 ? 's' : ''} changed
        </span>
        <span className="text-green-400">
          +{mergeRequest.changes.reduce((acc, change) => acc + change.additions, 0)} additions
        </span>
        <span className="text-red-400">
          -{mergeRequest.changes.reduce((acc, change) => acc + change.deletions, 0)} deletions
        </span>
      </div>
      
      {/* AI Feedback Preview */}
      {mergeRequest.aiValidation.feedback && (
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded">
          <div className="text-xs font-medium text-blue-300 mb-1">AI Analysis</div>
          <p className="text-blue-200 text-sm line-clamp-2">
            {mergeRequest.aiValidation.feedback}
          </p>
        </div>
      )}
    </div>
  );
};