export class DocumentProcessor {
  async processFile(file: File): Promise<string[]> {
    const text = await this.extractText(file);
    return this.chunkText(text);
  }

  private async extractText(file: File): Promise<string> {
    const fileType = file.type || this.getTypeFromName(file.name);

    switch (fileType) {
      case 'application/pdf':
        return this.extractFromPDF(file);
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        return this.extractFromWord(file);
      case 'text/plain':
      case 'text/markdown':
      case 'application/rtf':
      default:
        return this.extractFromText(file);
    }
  }

  private getTypeFromName(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'application/pdf';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'doc':
        return 'application/msword';
      case 'txt':
        return 'text/plain';
      case 'md':
        return 'text/markdown';
      case 'rtf':
        return 'application/rtf';
      default:
        return 'text/plain';
    }
  }

  private async extractFromPDF(file: File): Promise<string> {
    // For demo purposes, we'll use a simple text extraction
    // In production, you'd use pdf-parse or similar library
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Simulate PDF text extraction
      return `Extracted text from PDF: ${file.name}\n\nThis is a demonstration of PDF text extraction. In a real implementation, you would use a library like pdf-parse to extract the actual text content from the PDF file.`;
    } catch (error) {
      console.error('PDF extraction failed:', error);
      return `Error extracting PDF: ${file.name}`;
    }
  }

  private async extractFromWord(file: File): Promise<string> {
    // For demo purposes, we'll use a simple text extraction
    // In production, you'd use mammoth.js or similar library
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Simulate Word text extraction
      return `Extracted text from Word document: ${file.name}\n\nThis is a demonstration of Word document text extraction. In a real implementation, you would use a library like mammoth.js to extract the actual text content from Word documents.`;
    } catch (error) {
      console.error('Word extraction failed:', error);
      return `Error extracting Word document: ${file.name}`;
    }
  }

  private async extractFromText(file: File): Promise<string> {
    try {
      return await file.text();
    } catch (error) {
      console.error('Text extraction failed:', error);
      return `Error reading text file: ${file.name}`;
    }
  }

  private chunkText(text: string, chunkSize: number = 500): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (trimmedSentence.length === 0) continue;

      if (currentChunk.length + trimmedSentence.length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = trimmedSentence;
      } else {
        currentChunk += (currentChunk.length > 0 ? '. ' : '') + trimmedSentence;
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    // Ensure minimum chunk size and merge small chunks
    const mergedChunks: string[] = [];
    let tempChunk = '';

    for (const chunk of chunks) {
      if (tempChunk.length + chunk.length < 100 && tempChunk.length > 0) {
        tempChunk += '. ' + chunk;
      } else {
        if (tempChunk.length > 0) {
          mergedChunks.push(tempChunk);
        }
        tempChunk = chunk;
      }
    }

    if (tempChunk.length > 0) {
      mergedChunks.push(tempChunk);
    }

    return mergedChunks.length > 0 ? mergedChunks : [text.substring(0, chunkSize)];
  }
}