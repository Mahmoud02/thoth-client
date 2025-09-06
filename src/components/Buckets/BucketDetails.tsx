
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeftIcon, UploadIcon, DownloadIcon, MoreVerticalIcon, FileIcon, TrashIcon, ArrowUpDownIcon, Loader2, BrainIcon, CheckCircleIcon } from 'lucide-react';
import { ObjectMetadata } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useGetBucket, useListObjects, useDeleteObject, useIngestDocument, useAPIError } from '@/hooks/use-api';
import Breadcrumbs from '@/components/Layout/Breadcrumbs';
import FileUploadModal from '@/components/Upload/FileUploadModal';

const BucketDetails = () => {
  const { bucketId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' |'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [ingestingFiles, setIngestingFiles] = useState<Set<string>>(new Set());
  const [successfullyIngestedFiles, setSuccessfullyIngestedFiles] = useState<Set<string>>(new Set());
  const itemsPerPage = 10;
  
  // API Hooks
  const { data: bucket, isLoading: isLoadingBucket } = useGetBucket(Number(bucketId), !!bucketId);
  const { data: objects = [], isLoading: isLoadingObjects } = useListObjects(bucket?.name || '', !!bucket?.name);
  const deleteObjectMutation = useDeleteObject();
  const ingestDocumentMutation = useIngestDocument();
  const { handleError } = useAPIError();

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Helper function to check if a file is ingested (either from API or locally marked)
  const isFileIngested = (file: ObjectMetadata) => {
    return file.ingested || successfullyIngestedFiles.has(file.objectName);
  };

  const getFileTypeIcon = (type: string) => {
    return <FileIcon className="w-4 h-4 text-blue-600" />;
  };

  const handleDeleteFile = async (objectName: string) => {
    if (!bucket?.name) return;
    
    try {
      await deleteObjectMutation.mutateAsync({
        bucketName: bucket.name,
        objectName: objectName
      });
      
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    } catch (error) {
      const errorMessage = handleError(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleIngestFile = async (objectName: string) => {
    if (!bucket?.name) return;

    // Add file to ingesting set
    setIngestingFiles(prev => new Set([...prev, objectName]));

    try {
      await ingestDocumentMutation.mutateAsync({
        bucket: bucket.name,
        filename: objectName
      });
      
      // Manually update the file status to AI Ready
      setSuccessfullyIngestedFiles(prev => new Set([...prev, objectName]));
      
      toast({
        title: "Success",
        description: "File ingested successfully and is now ready for AI queries",
      });
    } catch (error) {
      const errorMessage = handleError(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      // Remove file from ingesting set
      setIngestingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(objectName);
        return newSet;
      });
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedFiles = [...(objects || [])].sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case 'name':
        aVal = a.objectName.toLowerCase();
        bVal = b.objectName.toLowerCase();
        break;
      case 'size':
        aVal = a.size;
        bVal = b.size;
        break;
      case 'type':
        aVal = a.contentType.toLowerCase();
        bVal = b.contentType.toLowerCase();
        break;
      case 'uploadedAt':
        aVal = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        bVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedFiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFiles = sortedFiles.slice(startIndex, startIndex + itemsPerPage);

  if (isLoadingBucket) {
    return (
      <div className="space-y-6">
        <Breadcrumbs />
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg text-slate-600">Loading bucket...</span>
        </div>
      </div>
    );
  }

  if (!bucket) {
    return (
      <div className="space-y-6">
        <Breadcrumbs />
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-slate-900">Bucket not found</h1>
          <p className="text-slate-600 mt-2">The requested bucket could not be found.</p>
          <Button onClick={() => navigate('/buckets')} className="mt-4">
            Back to Buckets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/buckets')}
          className="p-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{bucket.name}</h1>
          <p className="text-slate-600 mt-2">Bucket contents and file management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Files</CardTitle>
            <CardDescription>Number of files in this bucket</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{objects?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Size</CardTitle>
            <CardDescription>Total size of all files</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {formatFileSize((objects || []).reduce((total, file) => total + (file.size || 0), 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
            <CardDescription>File management operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              className="w-full" 
              size="sm"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <UploadIcon className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
            {objects && objects.some(file => !isFileIngested(file)) && (
              <Button 
                className="w-full" 
                size="sm"
                variant="outline"
                onClick={async () => {
                  const uningestedFiles = objects.filter(file => !isFileIngested(file) && !ingestingFiles.has(file.objectName));
                  // Ingest all uningested files sequentially to avoid overwhelming the server
                  for (const file of uningestedFiles) {
                    await handleIngestFile(file.objectName);
                  }
                }}
                disabled={ingestingFiles.size > 0}
              >
                {ingestingFiles.size > 0 ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing {ingestingFiles.size} file{ingestingFiles.size > 1 ? 's' : ''}...
                  </>
                ) : (
                  <>
                    <BrainIcon className="w-4 h-4 mr-2" />
                    Make All AI Ready
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Files</CardTitle>
              <CardDescription>All files in this bucket</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                  <SelectItem value="uploadedAt">Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('name')} className="h-auto p-0">
                    Name <ArrowUpDownIcon className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('type')} className="h-auto p-0">
                    Type <ArrowUpDownIcon className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('size')} className="h-auto p-0">
                    Size <ArrowUpDownIcon className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('uploadedAt')} className="h-auto p-0">
                    Uploaded <ArrowUpDownIcon className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>AI Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingObjects ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                    <span className="text-slate-600">Loading files...</span>
                  </TableCell>
                </TableRow>
              ) : (objects?.length || 0) === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <FileIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                    <p className="text-gray-600 mb-4">This bucket is empty. Upload some files to get started.</p>
                    <Button 
                      onClick={() => setIsUploadModalOpen(true)}
                      size="sm"
                    >
                      <UploadIcon className="w-4 h-4 mr-2" />
                      Upload Files
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedFiles.map((file) => (
                  <TableRow key={file.objectName}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        {getFileTypeIcon(file.contentType || 'unknown')}
                        <span>{file.objectName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {file.contentType ? file.contentType.split('/')[1] || 'Unknown' : 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>
                      {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {isFileIngested(file) ? (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircleIcon className="w-4 h-4" />
                          <span className="text-sm">AI Ready</span>
                        </div>
                      ) : ingestingFiles.has(file.objectName) ? (
                        <div className="flex items-center space-x-1 text-blue-600">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-gray-500">
                          <BrainIcon className="w-4 h-4" />
                          <span className="text-sm">Not Ready</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVerticalIcon className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <DownloadIcon className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          {!isFileIngested(file) && (
                            <DropdownMenuItem 
                              onClick={() => handleIngestFile(file.objectName)}
                              disabled={ingestingFiles.has(file.objectName)}
                            >
                              {ingestingFiles.has(file.objectName) ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <BrainIcon className="w-4 h-4 mr-2" />
                              )}
                              Make AI Ready
                            </DropdownMenuItem>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <TrashIcon className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete File</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{file.objectName}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteFile(file.objectName)}
                                  disabled={deleteObjectMutation.isPending}
                                >
                                  {deleteObjectMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        preselectedBucketName={bucket?.name}
      />
    </div>
  );
};

export default BucketDetails;
