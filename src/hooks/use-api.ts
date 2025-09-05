import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, APIError } from '@/services/api';
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
  RAGQueryRequest,
  AIQueryRequest
} from '@/types';

// Query Keys
export const queryKeys = {
  namespaces: ['namespaces'] as const,
  namespace: (id: number) => ['namespaces', id] as const,
  buckets: ['buckets'] as const,
  bucket: (id: number) => ['buckets', id] as const,
  objects: (bucketName: string) => ['objects', bucketName] as const,
} as const;

// Namespace Hooks
export const useCreateNamespace = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateNamespaceRequest) => apiClient.createNamespace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.namespaces });
    },
  });
};

export const useGetNamespace = (namespaceId: number, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.namespace(namespaceId),
    queryFn: () => apiClient.getNamespace(namespaceId),
    enabled: enabled && !!namespaceId,
  });
};

export const useListNamespaces = () => {
  return useQuery({
    queryKey: queryKeys.namespaces,
    queryFn: () => apiClient.listNamespaces(),
  });
};

export const useUpdateNamespace = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ namespaceId, data }: { namespaceId: number; data: UpdateNamespaceRequest }) => 
      apiClient.updateNamespace(namespaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.namespaces });
    },
  });
};

export const useDeleteNamespace = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (namespaceId: number) => apiClient.deleteNamespace(namespaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.namespaces });
    },
  });
};

// Bucket Hooks
export const useCreateBucket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateBucketRequest) => apiClient.createBucket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.buckets });
    },
  });
};

export const useGetBucket = (bucketId: number, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.bucket(bucketId),
    queryFn: () => apiClient.getBucket(bucketId),
    enabled: enabled && !!bucketId,
  });
};

export const useListBuckets = (namespaceId: number, enabled = true) => {
  return useQuery({
    queryKey: ['buckets', 'list', namespaceId],
    queryFn: () => apiClient.listBuckets(namespaceId),
    enabled: enabled && !!namespaceId,
  });
};

export const useUpdateBucket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bucketId, data }: { bucketId: number; data: UpdateBucketRequest }) => 
      apiClient.updateBucket(bucketId, data),
    onSuccess: (_, { bucketId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bucket(bucketId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.buckets });
    },
  });
};

export const useDeleteBucket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bucketId: number) => apiClient.deleteBucket(bucketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.buckets });
    },
  });
};

// Object Hooks
export const useUploadObject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bucketName, file, onUploadProgress }: { 
      bucketName: string; 
      file: File; 
      onUploadProgress?: (progressEvent: ProgressEvent) => void;
    }) => {
      const data: UploadObjectRequest = {
        objectName: file.name,
        file: file
      };
      return apiClient.uploadObject(bucketName, data, onUploadProgress);
    },
    onSuccess: (_, { bucketName }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.objects(bucketName) });
    },
  });
};

export const useListObjects = (bucketName: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.objects(bucketName),
    queryFn: () => apiClient.listObjects(bucketName),
    enabled: enabled && !!bucketName,
  });
};

export const useDeleteObject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bucketName, objectName }: { bucketName: string; objectName: string }) => 
      apiClient.deleteObject(bucketName, objectName),
    onSuccess: (_, { bucketName }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.objects(bucketName) });
    },
  });
};

// Bucket Functions Hooks
export const useAddBucketFunctions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateBucketFunctionRequest) => apiClient.addBucketFunctions(data),
    onSuccess: (_, { bucketId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bucket(bucketId) });
    },
  });
};

export const useRemoveBucketFunction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bucketId, functionType }: { bucketId: number; functionType: string }) => 
      apiClient.removeBucketFunction(bucketId, functionType),
    onSuccess: (_, { bucketId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bucket(bucketId) });
    },
  });
};

// RAG Hooks
export const useProcessDocument = () => {
  return useMutation({
    mutationFn: (file: File) => apiClient.processDocument(file),
  });
};

export const useQueryDocuments = () => {
  return useMutation({
    mutationFn: (data: RAGQueryRequest) => apiClient.queryDocuments(data),
  });
};

// AI Hooks
export const useQueryBucketAI = () => {
  return useMutation({
    mutationFn: (data: AIQueryRequest) => apiClient.queryBucketAI(data),
  });
};

// RAG Hooks
export const useIngestDocument = () => {
  return useMutation({
    mutationFn: ({ bucket, filename }: { bucket: string; filename: string }) => 
      apiClient.ingestDocument(bucket, filename),
  });
};

export const useQueryRAG = () => {
  return useMutation({
    mutationFn: ({ q, bucket }: { q: string; bucket: string }) => 
      apiClient.queryRAG(q, bucket),
  });
};

// Utility hook for error handling
export const useAPIError = () => {
  const handleError = (error: unknown): string => {
    if (error instanceof APIError) {
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unexpected error occurred';
  };

  return { handleError };
};
