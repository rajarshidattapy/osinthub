import React, { useState } from 'react';
import { X, Lock, Globe, GitBranch } from 'lucide-react';

interface CreateRepositoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const CreateRepositoryModal: React.FC<CreateRepositoryModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    template: 'blank'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: '', description: '', isPrivate: false, template: 'blank' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create New Repository</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Repository Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="my-osint-investigation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 h-20 resize-none"
              placeholder="Brief description of your investigation..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Visibility
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={!formData.isPrivate}
                  onChange={() => setFormData({ ...formData, isPrivate: false })}
                  className="text-blue-500"
                />
                <Globe className="w-4 h-4 text-gray-400" />
                <div className="flex-1">
                  <span className="text-white font-medium">Public</span>
                  <p className="text-gray-400 text-xs">Anyone can see this repository</p>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={formData.isPrivate}
                  onChange={() => setFormData({ ...formData, isPrivate: true })}
                  className="text-blue-500"
                />
                <Lock className="w-4 h-4 text-gray-400" />
                <div className="flex-1">
                  <span className="text-white font-medium">Private</span>
                  <p className="text-gray-400 text-xs">Only you and collaborators can see this</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Initialize with template
            </label>
            <select
              value={formData.template}
              onChange={(e) => setFormData({ ...formData, template: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="blank">Blank Repository</option>
              <option value="osint-basic">OSINT Investigation Template</option>
              <option value="threat-intel">Threat Intelligence Template</option>
              <option value="incident-response">Incident Response Template</option>
            </select>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-1 transition-colors"
            >
              <GitBranch className="w-4 h-4" />
              <span>Create Repository</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};