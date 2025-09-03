import weaviate, { WeaviateClient } from 'weaviate-ts-client';
import { Document, SearchResult } from '../types';

export class WeaviateService {
  private client: WeaviateClient | null = null;
  private readonly className = 'DocumentChunk';

  async initialize(): Promise<void> {
    try {
      // Initialize Weaviate client
      this.client = weaviate.client({
        scheme: 'http',
        host: 'localhost:8080', // Default Weaviate port
        headers: {}
      });

      // Check if schema exists, create if not
      await this.ensureSchema();
    } catch (error) {
      console.error('Failed to initialize Weaviate:', error);
      throw new Error('Could not connect to Weaviate. Please ensure Weaviate is running on localhost:8080');
    }
  }

  private async ensureSchema(): Promise<void> {
    if (!this.client) throw new Error('Client not initialized');

    try {
      // Check if class exists
      const exists = await this.client.schema
        .getter()
        .do()
        .then(schema => schema.classes?.some(cls => cls.class === this.className));

      if (!exists) {
        // Create schema
        await this.client.schema
          .classCreator()
          .withClass({
            class: this.className,
            description: 'Document chunks for semantic search',
            vectorizer: 'none', // We'll use custom vectors
            properties: [
              {
                name: 'content',
                dataType: ['text'],
                description: 'The text content of the document chunk'
              },
              {
                name: 'documentId',
                dataType: ['string'],
                description: 'The ID of the parent document'
              },
              {
                name: 'documentName',
                dataType: ['string'],
                description: 'The name of the parent document'
              },
              {
                name: 'chunkIndex',
                dataType: ['int'],
                description: 'The index of this chunk within the document'
              },
              {
                name: 'uploadedAt',
                dataType: ['date'],
                description: 'When the document was uploaded'
              }
            ]
          })
          .do();
      }
    } catch (error) {
      console.error('Failed to ensure schema:', error);
      throw error;
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // In a real implementation, you would call an embedding service like OpenAI
    // For demo purposes, we'll create a simple hash-based embedding
    const embedding = new Array(384).fill(0);
    
    for (let i = 0; i < text.length && i < 384; i++) {
      embedding[i] = (text.charCodeAt(i) / 255) - 0.5;
    }
    
    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / (magnitude || 1));
  }

  async indexDocument(document: Document, chunks: string[]): Promise<void> {
    if (!this.client) throw new Error('Client not initialized');

    const objects = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (chunk.trim().length === 0) continue;

      const embedding = await this.generateEmbedding(chunk);

      objects.push({
        class: this.className,
        properties: {
          content: chunk,
          documentId: document.id,
          documentName: document.name,
          chunkIndex: i,
          uploadedAt: document.uploadedAt
        },
        vector: embedding
      });
    }

    if (objects.length > 0) {
      await this.client.batch
        .objectsBatcher()
        .withObjects(...objects)
        .do();
    }
  }

  async searchDocuments(query: string, limit: number = 10): Promise<SearchResult[]> {
    if (!this.client) throw new Error('Client not initialized');

    try {
      const queryEmbedding = await this.generateEmbedding(query);

      const result = await this.client.graphql
        .get()
        .withClassName(this.className)
        .withFields('content documentId documentName chunkIndex uploadedAt')
        .withNearVector({
          vector: queryEmbedding,
          certainty: 0.1 // Lower threshold for more results
        })
        .withLimit(limit)
        .withAdditional('certainty')
        .do();

      if (!result.data?.Get?.[this.className]) {
        return [];
      }

      return result.data.Get[this.className].map((item: any) => ({
        documentId: item.documentId,
        content: item.content,
        score: item._additional?.certainty || 0,
        chunkIndex: item.chunkIndex,
        metadata: {
          documentName: item.documentName,
          uploadedAt: item.uploadedAt
        }
      }));
    } catch (error) {
      console.error('Search failed:', error);
      
      // Fallback to keyword search if vector search fails
      return this.fallbackKeywordSearch(query, limit);
    }
  }

  private async fallbackKeywordSearch(query: string, limit: number): Promise<SearchResult[]> {
    if (!this.client) throw new Error('Client not initialized');

    try {
      const result = await this.client.graphql
        .get()
        .withClassName(this.className)
        .withFields('content documentId documentName chunkIndex uploadedAt')
        .withWhere({
          path: ['content'],
          operator: 'Like',
          valueText: `*${query}*`
        })
        .withLimit(limit)
        .do();

      if (!result.data?.Get?.[this.className]) {
        return [];
      }

      return result.data.Get[this.className].map((item: any, index: number) => ({
        documentId: item.documentId,
        content: item.content,
        score: 1 - (index * 0.1), // Simple relevance scoring
        chunkIndex: item.chunkIndex,
        metadata: {
          documentName: item.documentName,
          uploadedAt: item.uploadedAt
        }
      }));
    } catch (error) {
      console.error('Keyword search also failed:', error);
      return [];
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    if (!this.client) throw new Error('Client not initialized');

    try {
      await this.client.batch
        .objectsBatchDeleter()
        .withClassName(this.className)
        .withWhere({
          path: ['documentId'],
          operator: 'Equal',
          valueString: documentId
        })
        .do();
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  }

  async getStats(): Promise<{ totalDocuments: number; totalChunks: number }> {
    if (!this.client) throw new Error('Client not initialized');

    try {
      const result = await this.client.graphql
        .aggregate()
        .withClassName(this.className)
        .withFields('meta { count }')
        .do();

      const totalChunks = result.data?.Aggregate?.[this.className]?.[0]?.meta?.count || 0;
      
      // Get unique document count
      const documentsResult = await this.client.graphql
        .get()
        .withClassName(this.className)
        .withFields('documentId')
        .withLimit(1000)
        .do();

      const uniqueDocuments = new Set(
        documentsResult.data?.Get?.[this.className]?.map((item: any) => item.documentId) || []
      );

      return {
        totalDocuments: uniqueDocuments.size,
        totalChunks
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      return { totalDocuments: 0, totalChunks: 0 };
    }
  }
}