import React from 'react';
import { FileText, Calendar, HardDrive, Layers, Trash2, Eye } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Document } from '../types';

interface DocumentCardProps {
  document: Document;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export function DocumentCard({ document, isSelected, onClick, onDelete }: DocumentCardProps) {
  const { theme } = useTheme();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    const ext = document.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'txt':
      case 'md':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'rtf':
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${document.name}"?`)) {
      onDelete();
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? (theme === 'dark' 
              ? 'bg-blue-900/30 border-blue-500 shadow-md' 
              : 'bg-blue-50 border-blue-300 shadow-md')
          : (theme === 'dark' 
              ? 'bg-gray-700 border-gray-600 hover:border-gray-500 hover:bg-gray-600' 
              : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-white')
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-0.5">
            {getFileIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium text-sm truncate ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`} title={document.name}>
              {document.name}
            </h3>
            
            <div className={`mt-2 space-y-1 text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(document.uploadedAt)}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <HardDrive className="h-3 w-3" />
                <span>{formatFileSize(document.size)}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Layers className="h-3 w-3" />
                <span>{document.chunks} chunks</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onClick}
            className={`p-1 rounded-md transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-blue-600 text-gray-400 hover:text-white' 
                : 'hover:bg-blue-100 text-gray-500 hover:text-blue-600'
            }`}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleDeleteClick}
            className={`p-1 rounded-md transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-red-600 text-gray-400 hover:text-white' 
                : 'hover:bg-red-100 text-gray-500 hover:text-red-600'
            }`}
            title="Delete Document"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}