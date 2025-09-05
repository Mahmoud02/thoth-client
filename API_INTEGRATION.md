# Thoth API Integration Guide

This document explains how the frontend integrates with the Thoth backend API.

## Overview

The frontend uses a modern React + TypeScript stack with React Query for data management and caching. The API integration is built with a clean separation of concerns:

- **API Client** (`src/services/api.ts`): Low-level HTTP client
- **React Query Hooks** (`src/hooks/use-api.ts`): High-level data management
- **TypeScript Types** (`src/types/index.ts`): Type safety
- **Configuration** (`src/config/api.ts`): Environment settings

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │───▶│  React Query    │───▶│   API Client    │
│                 │    │     Hooks       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                               ┌─────────────────┐
                                               │  Thoth Backend  │
                                               │      API        │
                                               └─────────────────┘
```

## Setup

### 1. Environment Configuration

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 2. API Endpoints

The integration supports all Thoth API endpoints:

- **Namespace API**: Create, read namespaces
- **Bucket API**: CRUD operations for buckets
- **Object API**: Upload, download, list, delete objects
- **Bucket Functions API**: Manage bucket validation functions
- **RAG API**: Document processing and querying
- **AI API**: AI-powered bucket queries

## Usage Examples

### Creating a Bucket

```tsx
import { useCreateBucket } from '@/hooks/use-api';

const MyComponent = () => {
  const createBucket = useCreateBucket();
  
  const handleCreate = async () => {
    try {
      await createBucket.mutateAsync({
        name: 'my-bucket',
        namespaceId: 1
      });
      // Success - React Query will automatically update the cache
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <Button 
      onClick={handleCreate}
      disabled={createBucket.isPending}
    >
      {createBucket.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      Create Bucket
    </Button>
  );
};
```

### Uploading Files

```tsx
import { useUploadObject } from '@/hooks/use-api';

const FileUpload = () => {
  const uploadObject = useUploadObject();
  
  const handleUpload = async (file: File, bucketName: string) => {
    try {
      await uploadObject.mutateAsync({
        bucketName,
        data: {
          objectName: file.name,
          file: file
        }
      });
    } catch (error) {
      // Handle error
    }
  };
};
```

### Querying Data

```tsx
import { useListObjects } from '@/hooks/use-api';

const ObjectList = ({ bucketName }: { bucketName: string }) => {
  const { data: objects, isLoading, error } = useListObjects(bucketName);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {objects?.map(object => (
        <div key={object.objectName}>{object.objectName}</div>
      ))}
    </div>
  );
};
```

## Error Handling

The integration includes comprehensive error handling:

```tsx
import { useAPIError } from '@/hooks/use-api';

const MyComponent = () => {
  const { handleError } = useAPIError();
  
  const handleAction = async () => {
    try {
      // API call
    } catch (error) {
      const apiError = handleError(error);
      toast({
        title: "Error",
        description: apiError.message,
        variant: "destructive"
      });
    }
  };
};
```

## Data Caching

React Query provides automatic caching and synchronization:

- **Automatic Refetching**: Data refetches when components mount
- **Background Updates**: Stale data is updated in the background
- **Optimistic Updates**: UI updates immediately, rolls back on error
- **Cache Invalidation**: Related queries are invalidated on mutations

## Type Safety

All API calls are fully typed:

```typescript
// Request types
interface CreateBucketRequest {
  name: string;
  namespaceId: number;
}

// Response types
interface Bucket {
  id: number;
  name: string;
  namespaceId: number;
  createdAt: string;
  updatedAt: string;
}
```

## Configuration

API configuration is centralized in `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};
```

## Development

### Running the Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Environment Variables

- `VITE_API_BASE_URL`: Backend API base URL
- `VITE_DEV_MODE`: Development mode flag

## Testing

The API integration can be tested by:

1. Starting the Thoth backend server
2. Running the frontend development server
3. Testing API calls through the UI

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend allows requests from the frontend origin
2. **Network Errors**: Check that the backend is running and accessible
3. **Type Errors**: Ensure TypeScript types match the API responses

### Debug Mode

Enable debug logging by setting `VITE_DEV_MODE=true` in your environment.

## Contributing

When adding new API endpoints:

1. Add types to `src/types/index.ts`
2. Add methods to `src/services/api.ts`
3. Create React Query hooks in `src/hooks/use-api.ts`
4. Update components to use the new hooks
5. Add error handling and loading states
