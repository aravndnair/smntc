import React, { useState, useCallback } from 'react';
import { Search, Loader2, Filter } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface SearchInterfaceProps {
  onSearch: (query: string) => Promise<void>;
  isSearching: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function SearchInterface({ onSearch, isSearching, disabled, placeholder }: SearchInterfaceProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'semantic' | 'keyword'>('semantic');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || disabled || isSearching) return;
    onSearch(query.trim());
  }, [query, onSearch, disabled, isSearching]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  return (
    <div className="space-y-4">
      {/* Search Type Toggle */}
      <div className="flex items-center space-x-4">
        <span className={`text-sm font-medium ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Search Mode:
        </span>
        <div className={`flex rounded-lg p-1 ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <button
            onClick={() => setSearchType('semantic')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              searchType === 'semantic'
                ? (theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                : (theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900')
            }`}
          >
            Semantic
          </button>
          <button
            onClick={() => setSearchType('keyword')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              searchType === 'keyword'
                ? (theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                : (theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900')
            }`}
          >
            Keyword
          </button>
        </div>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isSearching ? (
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            ) : (
              <Search className={`h-5 w-5 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
              }`} />
            )}
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSearching}
            placeholder={placeholder || "Search your documents..."}
            className={`w-full pl-10 pr-12 py-3 rounded-lg border text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              className={`p-1 rounded-md transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-gray-600 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
              title="Advanced Filters"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Search Tips */}
      <div className={`text-xs space-y-1 ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <p className="font-medium">Search Tips:</p>
        <ul className="space-y-0.5 ml-2">
          <li>• Use natural language for semantic search (e.g., "documents about machine learning")</li>
          <li>• Try different phrasings to find related content</li>
          <li>• Semantic search understands context and meaning beyond keywords</li>
          <li>• Use keyword search for exact term matches</li>
        </ul>
      </div>
    </div>
  );
}