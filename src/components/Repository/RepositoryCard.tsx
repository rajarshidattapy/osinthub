import React from 'react';
import { GitFork, Lock, Globe, Calendar, Users } from 'lucide-react';
import { Repository } from '../../types';

interface RepositoryCardProps {
  repository: Repository;
  onSelect: (repo: Repository) => void;
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({ repository, onSelect }) => {
  const timeAgo = new Date(repository.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div 
      className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors cursor-pointer"
      onClick={() => onSelect(repository)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            {repository.owner.username}/{repository.name}
          </h3>
          <div className="flex items-center space-x-1">
            {repository.isPrivate ? (
              <Lock className="w-4 h-4 text-gray-400" />
            ) : (
              <Globe className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <GitFork className="w-4 h-4" />
            <span>{repository.forkCount}</span>
          </div>
        </div>
      </div>
      
      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{repository.description}</p>
      
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>Updated {timeAgo}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{repository.collaborators.length} collaborators</span>
          </div>
        </div>
        
        {repository.forkedFrom && (
          <div className="text-blue-400 text-xs">
            Forked from {repository.forkedFrom.owner.username}/{repository.forkedFrom.name}
          </div>
        )}
      </div>
    </div>
  );
};