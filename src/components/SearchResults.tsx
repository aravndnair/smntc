import React from 'react';
import { FileText, Target, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { SearchResult, Document } from '../types';

interface SearchResultsProps {
  results: SearchResult[];
  documents: Document[];
  query: string;
  isLoading: boolean;
}

export function SearchResults({ results, documents, query, isLoading }: SearchResultsProps) {
  const { theme } = useTheme();

  const getDocumentById = (id: string) => {
    return documents.find(doc => doc.id === id);
  };

  const highlightQuery = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className={
          theme === 'dark' 
            ? 'bg-yellow-900/50 text-yellow-200' 
            : 'bg-yellow-200 text-yellow-900'
        }>
          {part}
        </mark>
      ) : part
    );
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return theme === 'dark' ? 'text-green-400' : 'text-green-600';
    if (score >= 0.6) return theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600';
    if (score >= 0.4) return theme === 'dark' ? 'text-orange-400' : 'text-orange-600';
    return theme === 'dark' ? 'text-red-400' : 'text-red-600';
  };

  const getRelevanceLabel = (score: number) => {
    if (score >= 0.8) return 'Highly Relevant';
    if (score >= 0.6) return 'Very Relevant';
    if (score >= 0.4) return 'Relevant';
    return 'Somewhat Relevant';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className={`text-lg font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Searching your documents...
          </p>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Using semantic analysis to find relevant content
          </p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className={`mx-auto mb-4 p-3 rounded-full ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <Target className={`h-8 w-8 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
        <p className={`text-lg font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          No results found
        </p>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Try different keywords or rephrase your search query
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`text-sm ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        Found {results.length} relevant passages for "{query}"
      </div>

      <div className="space-y-4">
        {results.map((result, index) => {
          const document = getDocumentById(result.documentId);
          if (!document) return null;

          return (
            <div
              key={`${result.documentId}-${index}`}
              className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 hover:border-gray-500' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Result Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-md ${
                    theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'
                  }`}>
                    <FileText className="h-4 w-4 text-blue-500" />
                  </div>
                  
                  <div>
                    <h3 className={`font-medium text-sm ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      {document.name}
                    </h3>
                    <div className={`flex items-center space-x-3 text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="h-3 w-3" />
                        <span className={getRelevanceColor(result.score)}>
                          {getRelevanceLabel(result.score)} ({(result.score * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  className={`p-2 rounded-md transition-colors ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-600 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                  }`}
                  title="View Document"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>

              {/* Result Content */}
              <div className={`text-sm leading-relaxed ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {highlightQuery(result.content, query)}
              </div>

              {/* Relevance Bar */}
              <div className="mt-3">
                <div className={`h-1 rounded-full ${
                  theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${
                      result.score >= 0.8 
                        ? 'bg-green-500' 
                        : result.score >= 0.6 
                          ? 'bg-yellow-500'
                          : result.score >= 0.4
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                    }`}
                    style={{ width: `${result.score * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}