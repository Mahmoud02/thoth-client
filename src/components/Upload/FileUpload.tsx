
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { UploadIcon, FileIcon, CheckCircleIcon } from 'lucide-react';

const FileUpload = () => {
  const [selectedBucket, setSelectedBucket] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const buckets = [
    { id: '1', name: 'project-documents' },
    { id: '2', name: 'media-assets' },
    { id: '3', name: 'backup-files' },
  ];

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!selectedBucket) {
      alert('Please select a bucket first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const fileNames = Array.from(files).map(file => file.name);
    setUploadedFiles(prev => [...prev, ...fileNames]);
    setIsUploading(false);
    setUploadProgress(0);
  }, [selectedBucket]);

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
              <Select value={selectedBucket} onValueChange={setSelectedBucket}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a bucket" />
                </SelectTrigger>
                <SelectContent>
                  {buckets.map((bucket) => (
                    <SelectItem key={bucket.id} value={bucket.id}>
                      {bucket.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  disabled={!selectedBucket || isUploading}
                >
                  Browse Files
                </Button>
              </div>

              {isUploading && (
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
