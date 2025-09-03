import React, { useState, useCallback, useRef } from 'react';
import { Search, Upload, FileText, Database, Settings, Moon, Sun, Download, Trash2 } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { SearchInterface } from './components/SearchInterface';
import { DocumentCard } from './components/DocumentCard';
import { SearchResults } from './components/SearchResults';
import { ProgressBar } from './components/ProgressBar';
import { WeaviateService } from './services/WeaviateService';
import { DocumentProcessor } from './services/DocumentProcessor';
import { useTheme } from './hooks/useTheme';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Document, SearchResult } from './types';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [documents, setDocuments] = useLocalStorage<Document[]>('semantic-search-docs', []);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const weaviateService = useRef(new WeaviateService());
  const documentProcessor = useRef(new DocumentProcessor());

  // Initialize Weaviate connection
  React.useEffect(() => {
    const initializeConnection = async () => {
      try {
        await weaviateService.current.initialize();
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect to Weaviate:', error);
        setIsConnected(false);
      }
    };

    initializeConnection();
  }, []);

  const handleFileUpload = useCallback(async (files: File[]) => {
    if (!isConnected) {
      alert('Please connect to Weaviate first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const newDocuments: Document[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress((i / files.length) * 50);

        // Process document
        const chunks = await documentProcessor.current.processFile(file);
        
        // Create document object
        const document: Document = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          uploadedAt: new Date().toISOString(),
          chunks: chunks.length,
          content: chunks.join(' ').substring(0, 1000) + '...' // Preview
        };

        // Store in Weaviate
        await weaviateService.current.indexDocument(document, chunks);
        newDocuments.push(document);
        
        setUploadProgress(50 + ((i + 1) / files.length) * 50);
      }

      setDocuments(prev => [...prev, ...newDocuments]);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Failed to upload documents. Please try again.');
    }
  }, [isConnected, setDocuments]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim() || !isConnected) return;

    setIsSearching(true);
    setSearchQuery(query);

    try {
      const results = await weaviateService.current.searchDocuments(query, 10);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [isConnected]);

  const handleDeleteDocument = useCallback(async (documentId: string) => {
    try {
      await weaviateService.current.deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      setSearchResults(prev => prev.filter(result => result.documentId !== documentId));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete document. Please try again.');
    }
  }, [setDocuments]);

  const handleClearAll = useCallback(async () => {
    if (!confirm('Are you sure you want to clear all documents? This action cannot be undone.')) {
      return;
    }

    try {
      for (const doc of documents) {
        await weaviateService.current.deleteDocument(doc.id);
      }
      setDocuments([]);
      setSearchResults([]);
      setSelectedDocument(null);
    } catch (error) {
      console.error('Clear all failed:', error);
      alert('Failed to clear documents. Please try again.');
    }
  }, [documents, setDocuments]);

  const exportResults = useCallback(() => {
    const dataStr = JSON.stringify({
      query: searchQuery,
      results: searchResults,
      timestamp: new Date().toISOString()
    }, null, 2);
    
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `search-results-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [searchQuery, searchResults]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gradient-to-br from-blue-50 via-white to-teal-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`border-b transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white/80 backdrop-blur-sm border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
              }`}>
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Semantic File Search</h1>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Powered by Weaviate Vector Database
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isConnected 
                  ? (theme === 'dark' ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800')
                  : (theme === 'dark' ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-800')
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                {isConnected ? 'Connected to Weaviate' : 'Disconnected'}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {searchResults.length > 0 && (
                  <button
                    onClick={exportResults}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark' 
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    }`}
                    title="Export Results"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                )}
                
                {documents.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark' 
                        ? 'hover:bg-red-700 text-red-400 hover:text-red-300' 
                        : 'hover:bg-red-100 text-red-600 hover:text-red-700'
                    }`}
                    title="Clear All Documents"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Upload & Documents */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Section */}
            <div className={`p-6 rounded-xl shadow-lg transition-colors ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            }`}>
              <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload Documents</span>
              </h2>
              
              <FileUpload 
                onUpload={handleFileUpload}
                isUploading={isUploading}
                disabled={!isConnected}
              />
              
              {isUploading && (
                <div className="mt-4">
                  <ProgressBar progress={uploadProgress} />
                </div>
              )}
            </div>

            {/* Document Library */}
            <div className={`p-6 rounded-xl shadow-lg transition-colors ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            }`}>
              <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Document Library</span>
                <span className={`ml-auto px-2 py-1 rounded-full text-xs ${
                  theme === 'dark' ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'
                }`}>
                  {documents.length}
                </span>
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {documents.length === 0 ? (
                  <p className={`text-center py-8 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    No documents uploaded yet
                  </p>
                ) : (
                  documents.map(document => (
                    <DocumentCard
                      key={document.id}
                      document={document}
                      isSelected={selectedDocument?.id === document.id}
                      onClick={() => setSelectedDocument(document)}
                      onDelete={() => handleDeleteDocument(document.id)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Search & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Interface */}
            <div className={`p-6 rounded-xl shadow-lg transition-colors ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            }`}>
              <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Semantic Search</span>
              </h2>
              
              <SearchInterface 
                onSearch={handleSearch}
                isSearching={isSearching}
                disabled={!isConnected || documents.length === 0}
                placeholder={
                  !isConnected 
                    ? "Connect to Weaviate to search..." 
                    : documents.length === 0 
                      ? "Upload documents to start searching..."
                      : "Search your documents..."
                }
              />
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className={`p-6 rounded-xl shadow-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white border border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <Search className="h-5 w-5" />
                    <span>Search Results</span>
                    {searchResults.length > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        theme === 'dark' ? 'bg-teal-800 text-teal-200' : 'bg-teal-100 text-teal-800'
                      }`}>
                        {searchResults.length}
                      </span>
                    )}
                  </h2>
                  
                  {searchResults.length > 0 && (
                    <button
                      onClick={exportResults}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        theme === 'dark'
                          ? 'bg-blue-700 hover:bg-blue-600 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      Export Results
                    </button>
                  )}
                </div>
                
                <SearchResults 
                  results={searchResults}
                  documents={documents}
                  query={searchQuery}
                  isLoading={isSearching}
                />
              </div>
            )}

            {/* Selected Document Details */}
            {selectedDocument && (
              <div className={`p-6 rounded-xl shadow-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white border border-gray-200'
              }`}>
                <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Document Details</span>
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">{selectedDocument.name}</h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {selectedDocument.type} • {(selectedDocument.size / 1024).toFixed(1)} KB • {selectedDocument.chunks} chunks
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Content Preview</h4>
                    <div className={`p-3 rounded-lg text-sm ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      {selectedDocument.content}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`mt-16 border-t transition-colors ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Semantic File Search System © 2024
            </p>
            <div className="flex items-center space-x-4">
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Powered by Weaviate & React
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;