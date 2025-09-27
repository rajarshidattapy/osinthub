import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Clock, MessageSquare, User, Calendar, GitCommit, Merge } from 'lucide-react';
import { MergeRequest } from '../../types';
import { DiffViewer } from './DiffViewer';

interface MergeRequestDetailProps {
  mergeRequest: MergeRequest;
  onBack: () => void;
  onMerge?: () => void | Promise<void>;
  onClose?: () => void | Promise<void>;
  onValidate?: () => void | Promise<void>;
}

export const MergeRequestDetail: React.FC<MergeRequestDetailProps> = ({ 
  mergeRequest, 
  onBack,
  onMerge,
  onClose,
  onValidate
}) => {
  const [activeTab, setActiveTab] = useState<'conversation' | 'files' | 'commits'>('conversation');

  const getAIStatusIcon = () => {
    switch (mergeRequest.aiValidation.status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'needs_review': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="py-4">
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

        {/* Header */}
  <div className="card p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">{mergeRequest.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{mergeRequest.author.username}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(mergeRequest.createdAt)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {mergeRequest.status === 'open' && (
                <>
                  <button onClick={onClose} className="btn btn-outline border-red-600 text-red-300 hover:bg-red-600/20">
                    Close
                  </button>
                  <button onClick={onMerge} className="btn btn-primary flex items-center space-x-1">
                    <Merge className="w-4 h-4" />
                    <span>Merge</span>
                  </button>
                </>
              )}
              {onValidate && (
                <button onClick={onValidate} className="btn btn-secondary">
                  Re-Validate
                </button>
              )}
            </div>
          </div>

          <p className="text-gray-300 mb-4">{mergeRequest.description}</p>

          {/* Branch Info */}
          <div className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
            <GitCommit className="w-4 h-4" />
            <span>{mergeRequest.sourceBranch}</span>
            <span>→</span>
            <span>{mergeRequest.targetBranch}</span>
          </div>
        </div>

        {/* AI Validation Panel */}
  <div className="card p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            {getAIStatusIcon()}
            <h3 className="text-lg font-semibold text-white">
              AI Validation Result
            </h3>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
              Score: {Math.round(mergeRequest.aiValidation.score * 100)}%
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-white font-medium mb-2">Feedback</h4>
              <p className="text-gray-300 text-sm">{mergeRequest.aiValidation.feedback}</p>
            </div>

            {mergeRequest.aiValidation.suggestions.length > 0 && (
              <div>
                <h4 className="text-white font-medium mb-2">Suggestions</h4>
                <ul className="space-y-1">
                  {mergeRequest.aiValidation.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-blue-300 text-sm flex items-start space-x-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
  <div className="border-b border-gray-800 mb-6">
          <nav className="flex space-x-8">
            {(
              [
                { id: 'conversation', label: 'Conversation', icon: MessageSquare, count: mergeRequest.comments.length },
                { id: 'files', label: 'Files Changed', count: mergeRequest.changes.length },
                { id: 'commits', label: 'Commits', count: 1 }
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 pb-3 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'border-accent-primary text-fg' : 'border-transparent text-muted hover:text-fg'
                }`}
              >
                {(() => {
                  type TabWithIcon = { icon?: React.ComponentType<{ className?: string }> };
                  const maybe = tab as TabWithIcon;
                  const Icon = maybe.icon;
                  return Icon ? <Icon className="w-4 h-4" /> : null;
                })()}
                <span>{tab.label}</span>
                <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs">{tab.count}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'conversation' && (
          <div className="space-y-6">
            {mergeRequest.comments.map(comment => (
              <div key={comment.id} className="card p-6">
                <div className="flex items-start space-x-3">
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-white font-medium">{comment.author.username}</span>
                      <span className="text-gray-400 text-sm">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-300">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-6">
            {mergeRequest.changes.map((change, index) => (
              <DiffViewer key={index} change={change} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};