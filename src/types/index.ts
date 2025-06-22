
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
