
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'user';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bucket {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  fileCount: number;
  size: number;
  functions?: BucketFunction[];
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
