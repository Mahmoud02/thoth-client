
// ===== API Response Types =====

export interface Namespace {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNamespaceRequest {
  namespaceName: string;
}

export interface UpdateNamespaceRequest {
  newNamespaceName: string;
}

export interface Bucket {
  id: number;
  name: string;
  namespaceId: number;
  createdAt: string;
  updatedAt: string;
  functions?: Record<string, any>;
}

export interface ObjectMetadata {
  bucketName: string;
  objectName: string;
  contentType: string;
  size: number;
  createdAt?: string;
  updatedAt?: string;
  isIngested?: boolean; // Whether the file has been ingested for AI/RAG
}

export interface BucketFunctionConfig {
  type: 'SIZE_LIMIT' | 'EXTENSION_VALIDATOR' | 'CONTENT_VALIDATOR' | 'NAME_VALIDATOR';
  maxSizeBytes?: number;
  allowedExtensions?: string[];
  allowedContentTypes?: string[];
  namePattern?: string;
}

export interface CreateBucketFunctionRequest {
  bucketId: number;
  configs: BucketFunctionConfig[];
}

export interface CreateBucketFunctionResponse {
  bucketName: number;
  functionsAdded: number;
  configValues: BucketFunctionConfig[];
}

export interface RAGQueryRequest {
  query: string;
}

export interface RAGQueryResponse {
  answer: string;
  sources: string[];
  confidence: number;
}

export interface AIQueryRequest {
  query: string;
  context?: string;
}

export interface AIQueryResponse {
  response: string;
  metadata?: Record<string, any>;
}

// ===== Request Types =====

export interface CreateNamespaceRequest {
  name: string;
}

export interface CreateBucketRequest {
  name: string;
  namespaceId: number;
}

export interface UpdateBucketRequest {
  name: string;
}

export interface UploadObjectRequest {
  objectName: string;
  file: File;
}

// ===== Error Types =====
// Note: APIError is defined as a class in src/services/api.ts

// ===== Legacy Types (for backward compatibility) =====

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'user';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  bucketId: string;
  uploadedBy: string;
  uploadedAt: Date;
  url?: string;
}

export interface AIAnalysis {
  id: string;
  fileId: string;
  question: string;
  response: string;
  createdAt: Date;
}

export interface Statistics {
  totalUsers: number;
  totalBuckets: number;
  totalFiles: number;
  totalStorage: number;
  recentActivity: number;
}

export interface ValidationFunction {
  id: string;
  name: string;
  description: string;
  type: 'size' | 'extension' | 'content' | 'name';
  icon: string;
  parameters?: { [key: string]: any };
}

export interface BucketFunction {
  id: string;
  functionId: string;
  order: number;
  parameters: { [key: string]: any };
}

export interface FunctionStep {
  id: string;
  name: string;
  description: string;
  type: 'validation' | 'security' | 'processing';
  icon: any;
  parameters: { [key: string]: any };
  order: number;
}

export interface FunctionChain {
  id: string;
  name: string;
  description: string;
  bucketId: string;
  steps: FunctionStep[];
  isActive: boolean;
}
