import React from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, MessageSquare, Calendar, User } from 'lucide-react';
import { MergeRequest } from '../../types';

interface MergeRequestCardProps {
  mergeRequest: MergeRequest;
  onSelect: (mr: MergeRequest) => void;
}

export const MergeRequestCard: React.FC<MergeRequestCardProps> = ({ mergeRequest, onSelect }) => {
  const getStatusBadge = () => {
    const { status } = mergeRequest;
    
    if (status === 'merged') {
      return (
        <div className="status-success">
          <CheckCircle className="w-3 h-3 mr-1" />
          Merged
        </div>
      );
    }
    
    if (status === 'closed') {
      return (
        <div className="status-danger">
          <XCircle className="w-3 h-3 mr-1" />
          Closed
        </div>
      );
    }
    
    return (
      <div className="status-info">
        <Clock className="w-3 h-3 mr-1" />
        Open
      </div>
    );
  };

  const getAIValidationBadge = () => {
    const { aiValidation } = mergeRequest;
    
    switch (aiValidation.status) {
      case 'approved':
        return (
          <div className="status-success">
            <CheckCircle className="w-3 h-3 mr-1" />
            AI Approved ({Math.round(aiValidation.score * 100)}%)
          </div>
        );
      case 'rejected':
        return (
          <div className="status-danger">
            <XCircle className="w-3 h-3 mr-1" />
            AI Rejected
          </div>
        );
      case 'needs_review':
        return (
          <div className="status-warning">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Needs Review
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-800 text-gray-300">
            <Clock className="w-3 h-3 mr-1" />
            AI Pending
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
      className="card-hover p-6 cursor-pointer"
      onClick={() => onSelect(mergeRequest)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center flex-wrap gap-3 mb-2">
            <h3 className="repo-title hover:text-blue-400 transition-colors">
              {mergeRequest.title}
            </h3>
            {getStatusBadge()}
            {getAIValidationBadge()}
          </div>
          
          <p className="repo-description">
            {mergeRequest.description}
          </p>
          
          <div className="repo-meta">
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
      <div className="flex items-center space-x-4 text-sm p-3 rounded-md" style={{backgroundColor: 'var(--bg-2)'}}>
        <span className="text-muted">
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
        <div className="mt-4 p-3 rounded-md" style={{backgroundColor: 'rgba(88, 166, 255, 0.1)', border: '1px solid rgba(88, 166, 255, 0.3)'}}>
          <div className="text-xs font-medium text-blue-300 mb-1">AI Analysis</div>
          <p className="text-blue-200 text-sm line-clamp-2">
            {mergeRequest.aiValidation.feedback}
          </p>
        </div>
      )}
    </div>
  );
};