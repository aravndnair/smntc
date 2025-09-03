export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/markdown',
  'application/rtf'
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const CHUNK_SIZE = 500; // Characters per chunk

export const WEAVIATE_CONFIG = {
  scheme: 'http',
  host: 'localhost:8080',
  className: 'DocumentChunk'
} as const;

export const SEARCH_LIMITS = {
  maxResults: 20,
  minScore: 0.1
} as const;