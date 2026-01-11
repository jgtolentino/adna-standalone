// API configuration for document extraction
// This will be replaced with actual backend implementation when server is set up

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ExtractionConfig {
  folderId: string;
  credentials: File | null;
  extractionOptions: {
    processImages: boolean;
    extractText: boolean;
    generateEmbeddings: boolean;
    autoTag: boolean;
  };
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  folderName?: string;
  fileCount?: number;
}

export interface StartExtractionResponse {
  jobId: string;
  estimatedTime: number;
  totalFiles: number;
}

export interface ExtractionStatusResponse {
  status: 'idle' | 'testing' | 'extracting' | 'processing' | 'completed' | 'error';
  progress: number;
  currentStep: string;
  processedFiles: number;
  totalFiles: number;
  errors: string[];
  results?: {
    documentsExtracted: number;
    pagesProcessed: number;
    embeddingsGenerated: number;
    tagsCreated: string[];
    storageLocation: string;
  };
}

export const extractionAPI = {
  async testConnection(folderId: string, credentials: File): Promise<TestConnectionResponse> {
    const formData = new FormData();
    formData.append('folderId', folderId);
    formData.append('credentials', credentials);

    const response = await fetch(`${API_BASE_URL}/ces/extraction/test-connection`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async startExtraction(config: ExtractionConfig): Promise<StartExtractionResponse> {
    const formData = new FormData();
    formData.append('folderId', config.folderId);
    formData.append('credentials', config.credentials!);
    formData.append('options', JSON.stringify(config.extractionOptions));

    const response = await fetch(`${API_BASE_URL}/ces/extraction/start`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async getStatus(jobId: string): Promise<ExtractionStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/ces/extraction/status/${jobId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

// Mock implementations for development
export const mockAPI = {
  async testConnection(folderId: string, credentials: File): Promise<TestConnectionResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      message: 'Connection successful',
      folderName: 'TBWA Campaign Assets 2024',
      fileCount: 42,
    };
  },

  async startExtraction(config: ExtractionConfig): Promise<StartExtractionResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      jobId: `job_${Date.now()}`,
      estimatedTime: 300,
      totalFiles: 42,
    };
  },

  async getStatus(jobId: string): Promise<ExtractionStatusResponse> {
    // Simulate progress
    const random = Math.random();
    const progress = Math.min(100, Math.floor(random * 100));
    
    return {
      status: progress === 100 ? 'completed' : 'extracting',
      progress,
      currentStep: progress === 100 ? 'Extraction completed' : `Processing file ${Math.floor(progress / 2.5)}/42`,
      processedFiles: Math.floor(progress / 2.5),
      totalFiles: 42,
      errors: [],
      results: progress === 100 ? {
        documentsExtracted: 42,
        pagesProcessed: 210,
        embeddingsGenerated: 42,
        tagsCreated: ['campaign-2024', 'creative', 'archived'],
        storageLocation: 'supabase://ces-documents',
      } : undefined,
    };
  },
};

// Use mock API in development
export const api = import.meta.env.DEV ? mockAPI : extractionAPI;