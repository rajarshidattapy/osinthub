import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { RepositoryCard } from './RepositoryCard';
import { Repository } from '../../types';
import { repositories } from '../../data/mockData';

interface RepositoryListProps {
  onSelectRepository: (repo: Repository) => void;
  onCreateRepository: () => void;
}

export const RepositoryList: React.FC<RepositoryListProps> = ({
  onSelectRepository,
  onCreateRepository
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredRepositories = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedFilter === 'private') return matchesSearch && repo.isPrivate;
    if (selectedFilter === 'public') return matchesSearch && !repo.isPrivate;
    if (selectedFilter === 'forked') return matchesSearch && repo.forkedFrom;

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Cases</h1>
            <p className="text-gray-400">Collaborative intelligence investigations</p>
          </div>

          <button
            onClick={onCreateRepository}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Case</span>
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Cases</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="forked">Forked</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRepositories.map(repo => (
            <RepositoryCard
              key={repo.id}
              repository={repo}
              onSelect={onSelectRepository}
            />
          ))}
        </div>

        {filteredRepositories.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No cases found</h3>
              <p>Try adjusting your search terms or filters.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};