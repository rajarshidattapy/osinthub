import React from 'react';
import { FileText, Plus, Minus } from 'lucide-react';
import { FileChange } from '../../types';

interface DiffViewerProps {
  change: FileChange;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ change }) => {
  const getChangeIcon = () => {
    switch (change.type) {
      case 'added': return <Plus className="w-4 h-4 text-green-400" />;
      case 'deleted': return <Minus className="w-4 h-4 text-red-400" />;
      default: return <FileText className="w-4 h-4 text-blue-400" />;
    }
  };

  const getChangeColor = () => {
    switch (change.type) {
      case 'added': return 'border-l-green-500 bg-green-900/20';
      case 'deleted': return 'border-l-red-500 bg-red-900/20';
      default: return 'border-l-blue-500 bg-blue-900/20';
    }
  };

  // Parse diff content for display
  const parseDiff = (diff: string) => {
    const lines = diff.split('\n');
    return lines.map((line, index) => {
      let className = 'text-gray-300';
      let prefix = '';
      
      if (line.startsWith('+')) {
        className = 'text-green-300 bg-green-900/30';
        prefix = '+';
      } else if (line.startsWith('-')) {
        className = 'text-red-300 bg-red-900/30';
        prefix = '-';
      } else if (line.startsWith('@@')) {
        className = 'text-blue-300 bg-blue-900/30 font-medium';
      }

      return (
        <div key={index} className={`${className} px-4 py-1 font-mono text-sm`}>
          {line}
        </div>
      );
    });
  };

  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg border-l-4 ${getChangeColor()}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          {getChangeIcon()}
          <span className="text-white font-medium">{change.file}</span>
          <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
            {change.type.toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-green-400">+{change.additions}</span>
          <span className="text-red-400">-{change.deletions}</span>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {parseDiff(change.diff)}
      </div>
    </div>
  );
};