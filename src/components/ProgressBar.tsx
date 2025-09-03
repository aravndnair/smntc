import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface ProgressBarProps {
  progress: number;
  label?: string;
}

export function ProgressBar({ progress, label }: ProgressBarProps) {
  const { theme } = useTheme();

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {label}
          </span>
          <span className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {Math.round(progress)}%
          </span>
        </div>
      )}
      
      <div className={`w-full h-2 rounded-full overflow-hidden ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      
      {!label && (
        <div className="text-center">
          <span className={`text-xs ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {Math.round(progress)}% complete
          </span>
        </div>
      )}
    </div>
  );
}