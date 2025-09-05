import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useListBuckets } from '@/hooks/use-api';
import { useUploadObject } from '@/hooks/use-api';
import { useAPIError } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload as UploadIcon, 
  X, 
  File, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  FolderIcon
} from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedBucketName?: string;
}

interface UploadFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ 
  isOpen, 
  onClose, 
  preselectedBucketName 
}) => {
  const [selectedBucket, setSelectedBucket] = useState<string>(preselectedBucketName || '');
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: buckets = [], isLoading: isLoadingBuckets } = useListBuckets(1);
  const uploadObjectMutation = useUploadObject();
  const { handleError } = useAPIError();
  const { toast } = useToast();

  const onDrop = (acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      progress: 0
    }));
    
    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      onDrop(fileArray);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    disabled: !selectedBucket,
    noClick: true // Disable default click behavior
  });

  const handleClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (selectedBucket && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFilesToBucket = async () => {
    if (!selectedBucket || uploadFiles.length === 0) return;

    setIsUploading(true);
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');

    for (const uploadFile of pendingFiles) {
      try {
        setUploadFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'uploading', progress: 0 }
              : f
          )
        );

        await uploadObjectMutation.mutateAsync({
          bucketName: selectedBucket,
          file: uploadFile.file,
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadFiles(prev => 
              prev.map(f => 
                f.id === uploadFile.id 
                  ? { ...f, progress }
                  : f
              )
            );
          }
        });

        setUploadFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'success', progress: 100 }
              : f
          )
        );

        toast({
          title: "File uploaded successfully",
          description: `${uploadFile.file.name} has been uploaded to ${selectedBucket}`,
        });

      } catch (error) {
        const errorMessage = handleError(error);
        setUploadFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'error', error: errorMessage }
              : f
          )
        );
      }
    }

    setIsUploading(false);
  };

  const handleClose = () => {
    setUploadFiles([]);
    setSelectedBucket(preselectedBucketName || '');
    onClose();
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      txt: '📄',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      mp4: '🎥',
      avi: '🎥',
      zip: '📦',
      rar: '📦',
    };
    return iconMap[extension || ''] || '📄';
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'uploading':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const canUpload = selectedBucket && uploadFiles.length > 0 && !isUploading;
  const hasErrors = uploadFiles.some(f => f.status === 'error');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UploadIcon className="h-5 w-5" />
            <span>Upload Files</span>
          </DialogTitle>
          <DialogDescription>
            {preselectedBucketName 
              ? `Upload files to the ${preselectedBucketName} bucket. You can drag and drop files or click to browse.`
              : 'Select a bucket and upload your files. You can drag and drop files or click to browse.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bucket Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload to Bucket</label>
            {preselectedBucketName ? (
              <div className="flex items-center space-x-2 p-3 bg-gray-50 border rounded-lg">
                <FolderIcon className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-900">{preselectedBucketName}</span>
                <Badge variant="secondary" className="ml-auto">Selected</Badge>
              </div>
            ) : (
              <Select 
                value={selectedBucket} 
                onValueChange={setSelectedBucket}
                disabled={isLoadingBuckets}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingBuckets ? "Loading buckets..." : "Choose a bucket"} />
                </SelectTrigger>
                <SelectContent>
                  {buckets.map((bucket) => (
                    <SelectItem key={bucket.id} value={bucket.name}>
                      {bucket.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Drop Zone */}
          <div
            {...getRootProps()}
            onClick={handleClick}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : selectedBucket
                ? 'border-gray-300 hover:border-gray-400'
                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
            }`}
          >
            <input 
              {...getInputProps()} 
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <UploadIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the files here...</p>
            ) : selectedBucket ? (
              <div>
                <p className="text-gray-600 mb-2">
                  {preselectedBucketName 
                    ? `Upload files to ${preselectedBucketName}` 
                    : 'Drag & drop files here, or click to select'
                  }
                </p>
                <p className="text-sm text-gray-500 mb-3">Supports multiple files</p>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleClick}
                  className="mt-2"
                >
                  Browse Files
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 mb-2">Please select a bucket first</p>
                <p className="text-sm text-gray-400">Then drag & drop files or click to select</p>
              </div>
            )}
          </div>

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Files to Upload ({uploadFiles.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {uploadFiles.map((uploadFile) => (
                  <div
                    key={uploadFile.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      {getStatusIcon(uploadFile.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getFileIcon(uploadFile.file.name)}</span>
                        <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {formatFileSize(uploadFile.file.size)}
                        </Badge>
                      </div>
                      
                      {uploadFile.status === 'uploading' && (
                        <Progress value={uploadFile.progress} className="mt-2 h-2" />
                      )}
                      
                      {uploadFile.status === 'error' && uploadFile.error && (
                        <p className="text-xs text-red-600 mt-1">{uploadFile.error}</p>
                      )}
                    </div>
                    
                    {uploadFile.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadFile.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Alert */}
          {hasErrors && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Some files failed to upload. Please check the errors above and try again.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button 
              onClick={uploadFilesToBucket} 
              disabled={!canUpload}
              className="min-w-[120px]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload Files
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadModal;
