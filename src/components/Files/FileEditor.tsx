import React from 'react';
import { Edit3, Copy, Download, History } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { RepositoryFile } from '../../types';

interface FileEditorProps {
  file: RepositoryFile;
}

export const FileEditor: React.FC<FileEditorProps> = ({ file }) => {
  const renderContent = () => {
    if (file.type === 'markdown') {
      return (
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown>{file.content}</ReactMarkdown>
        </div>
      );
    }

    if (file.type === 'json') {
      const formatted = JSON.stringify(JSON.parse(file.content), null, 2);
      return (
        <pre className="text-gray-300 text-sm overflow-x-auto">
          <code>{formatted}</code>
        </pre>
      );
    }

    return (
      <pre className="text-gray-300 text-sm whitespace-pre-wrap">
        {file.content}
      </pre>
    );
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <h3 className="text-white font-semibold">{file.name}</h3>
          <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
            {file.type.toUpperCase()}
          </span>
          <span className="text-xs text-gray-400">
            {Math.round(file.content.length / 1024 * 10) / 10} KB
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <History className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Copy className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center space-x-1 transition-colors">
            <Edit3 className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  );
};