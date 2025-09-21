import React, { useState } from 'react';
import { X, Lock, Globe, GitBranch, AlertCircle, Loader } from 'lucide-react';

interface CreateRepositoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const CreateRepositoryModal: React.FC<CreateRepositoryModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    template: 'blank'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate repository name
    if (!formData.name.trim()) {
      newErrors.name = 'Repository name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Repository name must be at least 3 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Repository name must be less than 50 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.name)) {
      newErrors.name = 'Repository name can only contain letters, numbers, hyphens, and underscores';
    }

    // Validate description
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim()
    };

    onSubmit(submitData);
  };

  const handleClose = () => {
    if (isLoading) return; // Prevent closing while loading
    setFormData({ name: '', description: '', isPrivate: false, template: 'blank' });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <GitBranch className="w-5 h-5" />
              <span>Create New Repository</span>
            </h2>
            <button 
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-white disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Repository Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Repository Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.name ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="my-osint-investigation"
                disabled={isLoading}
              />
              {errors.name && (
                <div className="flex items-center space-x-1 mt-1 text-red-400 text-sm">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none transition-colors ${
                  errors.description ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Brief description of your investigation..."
                disabled={isLoading}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.description && (
                  <div className="flex items-center space-x-1 text-red-400 text-sm">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.description}</span>
                  </div>
                )}
                <span className="text-gray-400 text-xs ml-auto">
                  {formData.description.length}/500
                </span>
              </div>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Visibility
              </label>
              <div className="space-y-2">
                <label className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  !formData.isPrivate ? 'bg-gray-700 border border-blue-500' : 'bg-gray-700 hover:bg-gray-650'
                }`}>
                  <input
                    type="radio"
                    name="visibility"
                    checked={!formData.isPrivate}
                    onChange={() => handleInputChange('isPrivate', false)}
                    className="text-blue-500"
                    disabled={isLoading}
                  />
                  <Globe className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <span className="text-white font-medium">Public</span>
                    <p className="text-gray-400 text-xs">Anyone can see this repository</p>
                  </div>
                </label>
                
                <label className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  formData.isPrivate ? 'bg-gray-700 border border-blue-500' : 'bg-gray-700 hover:bg-gray-650'
                }`}>
                  <input
                    type="radio"
                    name="visibility"
                    checked={formData.isPrivate}
                    onChange={() => handleInputChange('isPrivate', true)}
                    className="text-blue-500"
                    disabled={isLoading}
                  />
                  <Lock className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <span className="text-white font-medium">Private</span>
                    <p className="text-gray-400 text-xs">Only you and collaborators can see this</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Initialize with template
              </label>
              <select
                value={formData.template}
                onChange={(e) => handleInputChange('template', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                disabled={isLoading}
              >
                <option value="blank">Blank Repository</option>
                <option value="osint-basic">OSINT Investigation Template</option>
                <option value="threat-intel">Threat Intelligence Template</option>
                <option value="incident-response">Incident Response Template</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.name.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <GitBranch className="w-4 h-4" />
                    <span>Create Repository</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};