import React from 'react';
import { FileText, Database, Download, Calendar, User } from 'lucide-react';
import { RepositoryFile } from '../../types';

interface FileExplorerProps {
  files: RepositoryFile[];
  selectedFile?: RepositoryFile;
  onFileSelect: (file: RepositoryFile) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ 
  files, 
  selectedFile, 
  onFileSelect 
}) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'json':
      case 'csv':
        return Database;
      default:
        return FileText;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-white font-semibold flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Files</span>
          <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">
            {files.length}
          </span>
        </h3>
      </div>
      
      <div className="divide-y divide-gray-700">
        {files.map(file => {
          const Icon = getFileIcon(file.type);
          const isSelected = selectedFile?.id === file.id;
          
          return (
            <div
              key={file.id}
              onClick={() => onFileSelect(file)}
              className={`p-4 hover:bg-gray-700 cursor-pointer transition-colors ${
                isSelected ? 'bg-gray-700 border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4 text-blue-400" />
                  <span className="text-white font-medium">{file.name}</span>
                  <span className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded">
                    {file.type.toUpperCase()}
                  </span>
                </div>
                <button className="text-gray-400 hover:text-white">
                  <Download className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{file.author.username}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(file.lastModified)}</span>
                  </div>
                </div>
                <span>{formatFileSize(file.size)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};