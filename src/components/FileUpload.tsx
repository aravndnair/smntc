import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  isUploading: boolean;
  disabled?: boolean;
}

export function FileUpload({ onUpload, isUploading, disabled }: FileUploadProps) {
  const { theme } = useTheme();
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supportedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
    'text/markdown',
    'application/rtf'
  ];

  const validateFiles = (files: File[]): { valid: File[], invalid: File[] } => {
    const valid: File[] = [];
    const invalid: File[] = [];

    files.forEach(file => {
      const isSupported = supportedTypes.includes(file.type) || 
                         file.name.toLowerCase().endsWith('.txt') ||
                         file.name.toLowerCase().endsWith('.md');
      
      if (isSupported && file.size <= 10 * 1024 * 1024) { // 10MB limit
        valid.push(file);
      } else {
        invalid.push(file);
      }
    });

    return { valid, invalid };
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    setError(null);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const { valid, invalid } = validateFiles(files);

    if (invalid.length > 0) {
      setError(`${invalid.length} file(s) were rejected. Only PDF, DOCX, DOC, TXT, MD, and RTF files under 10MB are supported.`);
    }

    if (valid.length > 0) {
      onUpload(valid);
    }
  }, [onUpload, disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const { valid, invalid } = validateFiles(files);

    if (invalid.length > 0) {
      setError(`${invalid.length} file(s) were rejected. Only PDF, DOCX, DOC, TXT, MD, and RTF files under 10MB are supported.`);
    }

    if (valid.length > 0) {
      onUpload(valid);
    }

    // Reset input
    e.target.value = '';
  }, [onUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all ${
          disabled
            ? (theme === 'dark' ? 'border-gray-600 bg-gray-700/50' : 'border-gray-300 bg-gray-100')
            : dragOver
              ? (theme === 'dark' ? 'border-blue-400 bg-blue-900/20' : 'border-blue-400 bg-blue-50')
              : isUploading
                ? (theme === 'dark' ? 'border-blue-500 bg-blue-900/10' : 'border-blue-300 bg-blue-50')
                : (theme === 'dark' ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400')
        }`}
      >
        <div className="text-center">
          <div className={`mx-auto mb-4 ${
            disabled ? 'opacity-50' : ''
          }`}>
            {isUploading ? (
              <div className="animate-spin rounded-full h-12 w-12 mx-auto border-b-2 border-blue-500" />
            ) : (
              <Upload className={`h-12 w-12 mx-auto ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
              }`} />
            )}
          </div>
          
          <div className={disabled ? 'opacity-50' : ''}>
            <p className={`text-lg font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {isUploading ? 'Processing documents...' : 'Drop files here or click to browse'}
            </p>
            <p className={`text-sm mt-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Supports PDF, DOCX, DOC, TXT, MD, RTF (max 10MB each)
            </p>
          </div>

          <input
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.txt,.md,.rtf"
            onChange={handleFileInput}
            disabled={disabled || isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {error && (
        <div className={`p-3 rounded-lg flex items-start space-x-2 ${
          theme === 'dark' ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-700'
        }`}>
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className={`text-xs ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <p className="font-medium mb-1">Supported file types:</p>
        <ul className="space-y-0.5">
          <li>• PDF documents (.pdf)</li>
          <li>• Microsoft Word (.docx, .doc)</li>
          <li>• Plain text files (.txt)</li>
          <li>• Markdown files (.md)</li>
          <li>• Rich Text Format (.rtf)</li>
        </ul>
      </div>
    </div>
  );
}