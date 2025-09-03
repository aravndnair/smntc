# Semantic File Search System

A powerful semantic file search application built with React and Weaviate vector database. This system allows you to upload, index, and semantically search through your personal documents with advanced AI-powered relevance matching.

## Features

- **Semantic Search**: Advanced vector-based search that understands context and meaning
- **Multiple File Formats**: Support for PDF, DOCX, DOC, TXT, MD, and RTF files
- **Real-time Processing**: Fast document indexing and search capabilities
- **Weaviate Integration**: Leverages Weaviate vector database for optimal performance
- **Responsive Design**: Clean, modern interface that works on all devices
- **Dark/Light Mode**: Automatic theme detection with manual toggle
- **Export Results**: Save search results for further analysis
- **Document Management**: Easy upload, view, and delete operations

## Prerequisites

### Weaviate Setup (Windows)

1. **Install Docker Desktop for Windows**
   - Download from [Docker Desktop](https://docs.docker.com/desktop/windows/install/)
   - Follow the installation instructions

2. **Run Weaviate with Docker**
   ```bash
   docker run -p 8080:8080 -e CLUSTER_HOSTNAME=node1 semitechnologies/weaviate:latest
   ```

   Or use Docker Compose with this `docker-compose.yml`:
   ```yaml
   version: '3.4'
   services:
     weaviate:
       command:
         - --host
         - 0.0.0.0
         - --port
         - '8080'
         - --scheme
         - http
       image: semitechnologies/weaviate:latest
       ports:
         - "8080:8080"
       environment:
         CLUSTER_HOSTNAME: 'node1'
         AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
         PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
       volumes:
         - weaviate_data:/var/lib/weaviate
   volumes:
     weaviate_data:
   ```

   Run with: `docker-compose up -d`

3. **Verify Weaviate is Running**
   - Open http://localhost:8080/v1/schema in your browser
   - You should see an empty schema response

## Installation

1. **Clone and Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```

3. **Open the Application**
   - Navigate to http://localhost:5173
   - Ensure the connection status shows "Connected to Weaviate"

## Usage

### Uploading Documents

1. Click the upload area or drag and drop files
2. Supported formats: PDF, DOCX, DOC, TXT, MD, RTF (max 10MB each)
3. Documents are automatically processed and indexed
4. View progress in the progress bar

### Searching Documents

1. Enter your search query in natural language
2. Choose between semantic and keyword search modes
3. View results ranked by relevance score
4. Click on results to see highlighted content

### Managing Documents

1. View all uploaded documents in the Document Library
2. Click documents to see details and content preview
3. Delete individual documents or clear all
4. Export search results as JSON for analysis

## Architecture

### Frontend Components

- **App.tsx**: Main application component with state management
- **FileUpload.tsx**: Drag-and-drop file upload interface
- **SearchInterface.tsx**: Search input with mode selection
- **DocumentCard.tsx**: Individual document display component
- **SearchResults.tsx**: Search results with highlighting
- **ProgressBar.tsx**: Visual progress indicator

### Services

- **WeaviateService.ts**: Handles all Weaviate database operations
- **DocumentProcessor.ts**: Extracts text and creates chunks from documents

### Key Features

- **Vector Embeddings**: Documents are converted to vector representations
- **Semantic Understanding**: Search by meaning, not just keywords
- **Chunked Storage**: Large documents are split into searchable chunks
- **Real-time Search**: Fast vector similarity search
- **Relevance Scoring**: Results ranked by semantic similarity

## Technical Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Vector Database**: Weaviate
- **State Management**: React hooks with localStorage persistence
- **Build Tool**: Vite for fast development and building

## Configuration

### Weaviate Connection

The application connects to Weaviate on `localhost:8080` by default. To change this:

1. Edit `src/services/WeaviateService.ts`
2. Update the connection settings in the `initialize()` method

### Chunk Size

Document chunking can be configured in `src/services/DocumentProcessor.ts`:

- Default chunk size: 500 characters
- Overlap: Handled automatically for better search results

## Production Deployment

### Building for Production

```bash
npm run build
```

### Weaviate Production Setup

For production, use a persistent Weaviate setup with:
- Persistent storage volumes
- Authentication enabled
- SSL/TLS configuration
- Backup strategies

## Troubleshooting

### Connection Issues

1. **"Disconnected" status**: Ensure Weaviate is running on localhost:8080
2. **Docker issues**: Check Docker Desktop is running and accessible
3. **Port conflicts**: Make sure port 8080 is not used by other applications

### Upload Issues

1. **File size**: Ensure files are under 10MB
2. **File type**: Check that files are in supported formats
3. **Processing errors**: Check browser console for detailed error messages

### Search Issues

1. **No results**: Try different keywords or check if documents were indexed properly
2. **Poor relevance**: Semantic search works better with natural language queries
3. **Slow search**: Large document collections may require optimization

## Development

### Adding New File Types

1. Update `SUPPORTED_FILE_TYPES` in `src/utils/constants.ts`
2. Add extraction logic in `DocumentProcessor.ts`
3. Update file input accept attribute in `FileUpload.tsx`

### Customizing Search

1. Modify embedding generation in `WeaviateService.ts`
2. Adjust chunk size and overlap in `DocumentProcessor.ts`
3. Customize relevance scoring in search results

### Extending UI

1. Components use Tailwind CSS for styling
2. Dark/light theme support built-in
3. Responsive design patterns established

## License

This project is designed for educational and research purposes. Please ensure compliance with any institutional requirements and data handling policies.