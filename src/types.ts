export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  chunks: number;
  content: string; // Preview content
}

export interface SearchResult {
  documentId: string;
  content: string;
  score: number;
  chunkIndex: number;
  metadata: {
    documentName: string;
    uploadedAt: string;
  };
}

export interface DocumentChunk {
  id: string;
  content: string;
  documentId: string;
  chunkIndex: number;
  embedding: number[];
}