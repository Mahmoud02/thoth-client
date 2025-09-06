import { 
  Namespace, 
  Bucket, 
  ObjectMetadata, 
  CreateNamespaceRequest,
  UpdateNamespaceRequest,
  CreateBucketRequest,
  UpdateBucketRequest,
  UploadObjectRequest,
  CreateBucketFunctionRequest,
  CreateBucketFunctionResponse,
  RAGQueryRequest,
  RAGQueryResponse,
  AIQueryRequest,
  AIQueryResponse,
  AvailableFunction
} from '@/types';

import { API_CONFIG } from '@/config/api';
import { debugAPI } from '@/utils/debug';

// API Configuration
const API_BASE_URL = API_CONFIG.BASE_URL;

class APIError extends Error {
  status: number;
  errors?: string[];

  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.errors = errors;
  }
}

// Generic API client
class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Debug logging
    console.log('🔍 API Request Details:');
    console.log('Base URL:', this.baseURL);
    console.log('Endpoint:', endpoint);
    console.log('Full URL:', url);
    console.log('Method:', config.method || 'GET');
    console.log('Headers:', config.headers);
    console.log('Body:', config.body);
    debugAPI.logRequest(url, config);

    try {
      const response = await fetch(url, config);
      
      // Debug response
      const responseData = response.ok ? await response.json().catch(() => ({})) : null;
      debugAPI.logResponse(url, response, responseData);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const apiError = new APIError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.errors
        );
        debugAPI.logError(url, apiError);
        throw apiError;
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return {} as T;
      }

      return responseData as T;
    } catch (error) {
      debugAPI.logError(url, error);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new APIError(
          `Network error: Unable to connect to ${this.baseURL}. Please check if the backend is running.`,
          0
        );
      }
      
      throw new APIError('An unexpected error occurred', 0);
    }
  }

  // Namespace API
  async createNamespace(data: CreateNamespaceRequest): Promise<Namespace> {
    return this.request<Namespace>('/namespaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getNamespace(namespaceId: number): Promise<Namespace> {
    return this.request<Namespace>(`/namespaces/${namespaceId}`);
  }

  async listNamespaces(): Promise<Namespace[]> {
    return this.request<Namespace[]>('/namespaces');
  }

  async updateNamespace(namespaceId: number, data: UpdateNamespaceRequest): Promise<void> {
    return this.request<void>(`/namespaces/${namespaceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteNamespace(namespaceId: number): Promise<void> {
    return this.request<void>(`/namespaces/${namespaceId}`, {
      method: 'DELETE',
    });
  }

  // Bucket API
  async createBucket(data: CreateBucketRequest): Promise<Bucket> {
    return this.request<Bucket>('/buckets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBucket(bucketId: number): Promise<Bucket> {
    return this.request<Bucket>(`/buckets/${bucketId}`);
  }

  async listBuckets(namespaceId: number): Promise<Bucket[]> {
    return this.request<Bucket[]>(`/buckets?namespaceId=${namespaceId}`);
  }

  async updateBucket(bucketId: number, data: UpdateBucketRequest): Promise<void> {
    return this.request<void>(`/buckets/${bucketId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBucket(bucketId: number): Promise<void> {
    return this.request<void>(`/buckets/${bucketId}`, {
      method: 'DELETE',
    });
  }

  // Object API
  async uploadObject(bucketName: string, data: UploadObjectRequest, onUploadProgress?: (progressEvent: ProgressEvent) => void): Promise<ObjectMetadata> {
    const formData = new FormData();
    formData.append('objectName', data.objectName);
    formData.append('file', data.file);

    if (onUploadProgress) {
      return this.uploadWithProgress<ObjectMetadata>(`/buckets/${bucketName}/objects`, formData, onUploadProgress);
    }

    return this.request<ObjectMetadata>(`/buckets/${bucketName}/objects`, {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  private uploadWithProgress<T>(
    endpoint: string,
    formData: FormData,
    onUploadProgress: (progressEvent: ProgressEvent) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = `${this.baseURL}${endpoint}`;

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          onUploadProgress(event);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = xhr.responseText ? JSON.parse(xhr.responseText) : {};
            resolve(response as T);
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            const apiError = new APIError(
              errorData.message || `HTTP ${xhr.status}: ${xhr.statusText}`,
              xhr.status,
              errorData.errors
            );
            reject(apiError);
          } catch {
            reject(new APIError(`HTTP ${xhr.status}: ${xhr.statusText}`, xhr.status));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred'));
      });

      xhr.open('POST', url);
      xhr.send(formData);
    });
  }

  async downloadObject(bucketName: string, objectName: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/buckets/${bucketName}/objects/${objectName}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.message || 'Download failed',
        response.status,
        errorData.errors
      );
    }

    return response.blob();
  }

  async listObjects(bucketName: string): Promise<ObjectMetadata[]> {
    return this.request<ObjectMetadata[]>(`/buckets/${bucketName}/objects`);
  }

  async deleteObject(bucketName: string, objectName: string): Promise<void> {
    return this.request<void>(`/buckets/${bucketName}/objects/${objectName}`, {
      method: 'DELETE',
    });
  }

  // Bucket Functions API
  async addBucketFunctions(data: CreateBucketFunctionRequest): Promise<CreateBucketFunctionResponse> {
    return this.request<CreateBucketFunctionResponse>('/buckets/functions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeBucketFunction(bucketId: number, functionType: string): Promise<void> {
    return this.request<void>(`/buckets/functions/${bucketId}/${functionType}`, {
      method: 'DELETE',
    });
  }

  // RAG API
  async processDocument(file: File): Promise<{ status: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<{ status: string; message: string }>('/rag/process', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async queryDocuments(data: RAGQueryRequest): Promise<RAGQueryResponse> {
    return this.request<RAGQueryResponse>('/rag/query', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Bucket AI API
  async queryBucketAI(data: AIQueryRequest): Promise<AIQueryResponse> {
    return this.request<AIQueryResponse>('/buckets/ai/query', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // RAG API
  async ingestDocument(bucket: string, filename: string): Promise<string> {
    return this.request<string>(`/rag/ingest?bucket=${encodeURIComponent(bucket)}&filename=${encodeURIComponent(filename)}`, {
      method: 'POST',
    });
  }

  async queryRAG(q: string, bucket: string): Promise<{ response: string }> {
    return this.request<{ response: string }>(`/rag/query?q=${encodeURIComponent(q)}&bucket=${encodeURIComponent(bucket)}`, {
      method: 'POST',
    });
  }

  // Available Functions endpoints
  async getAvailableFunctions(): Promise<AvailableFunction[]> {
    return this.request<AvailableFunction[]>('/buckets/functions');
  }

  // Get bucket functions configuration
  async getBucketFunctions(bucketId: number): Promise<any[]> {
    return this.request<any[]>(`/buckets/${bucketId}/functions`);
  }
}

// Create and export API client instance
export const apiClient = new APIClient(API_BASE_URL);
export { APIError };
