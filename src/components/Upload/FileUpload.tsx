
import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { UploadIcon, FileIcon, CheckCircleIcon, Loader2 } from 'lucide-react';
import { useUploadObject, useListBuckets, useAPIError } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Bucket } from '@/types';

const FileUpload = () => {
  const { toast } = useToast();
  const { handleError } = useAPIError();
  const uploadObjectMutation = useUploadObject();
  const [searchParams] = useSearchParams();
  
  const [selectedBucket, setSelectedBucket] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Get buckets from API
  const { data: buckets = [], isLoading: isLoadingBuckets } = useListBuckets(1); // Default namespace ID

  // Set bucket from URL parameter
  useEffect(() => {
    const bucketParam = searchParams.get('bucket');
    if (bucketParam) {
      setSelectedBucket(bucketParam);
    }
  }, [searchParams]);

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!selectedBucket) {
      toast({
        title: "Error",
        description: "Please select a bucket first",
        variant: "destructive"
      });
      return;
    }

    const fileNames = Array.from(files).map(file => file.name);
    setUploadProgress(0);

    try {
      // Upload files one by one
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progress = ((i + 1) / files.length) * 100;
        setUploadProgress(progress);

        await uploadObjectMutation.mutateAsync({
          bucketName: selectedBucket,
          file: file
        });
      }

      setUploadedFiles(prev => [...prev, ...fileNames]);
      setUploadProgress(0);
      
      toast({
        title: "Success",
        description: `${files.length} file(s) uploaded successfully`,
      });
    } catch (error) {
      const errorMessage = handleError(error);
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
      setUploadProgress(0);
    }
  }, [selectedBucket, uploadObjectMutation, toast, handleError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Upload Files</h1>
        <p className="text-slate-600 mt-2">Add new files to your buckets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Bucket</CardTitle>
              <CardDescription>Choose where to upload your files</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBuckets ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="ml-2 text-sm text-slate-600">Loading buckets...</span>
                </div>
              ) : (
                <Select value={selectedBucket} onValueChange={setSelectedBucket}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bucket" />
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
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Upload Area</CardTitle>
              <CardDescription>Drag and drop files or click to browse</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <UploadIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Drop files here to upload
                </h3>
                <p className="text-slate-500 mb-4">
                  or click to browse your computer
                </p>
                <Button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files) handleFileUpload(files);
                    };
                    input.click();
                  }}
                  disabled={!selectedBucket || uploadObjectMutation.isPending}
                >
                  {uploadObjectMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Browse Files
                </Button>
              </div>

              {uploadObjectMutation.isPending && (
                <div className="mt-6">
                  <div className="mb-2">
                    <span className="text-sm text-slate-600">Uploading files...</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Uploads</CardTitle>
              <CardDescription>Files uploaded in this session</CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedFiles.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  No files uploaded yet
                </p>
              ) : (
                <div className="space-y-3">
                  {uploadedFiles.map((fileName, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      <FileIcon className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-900 truncate">{fileName}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
