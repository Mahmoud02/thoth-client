
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, UploadIcon, DownloadIcon, MoreVerticalIcon, FileIcon } from 'lucide-react';
import { FileItem } from '@/types';

const BucketDetails = () => {
  const { bucketId } = useParams();
  const navigate = useNavigate();
  
  // Mock data - in real app this would come from API
  const [bucketName] = useState('project-documents');
  const [files] = useState<FileItem[]>([
    {
      id: '1',
      name: 'project-proposal.pdf',
      size: 2048000,
      type: 'application/pdf',
      bucketId: bucketId || '',
      uploadedBy: '1',
      uploadedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'presentation.pptx',
      size: 5120000,
      type: 'application/vnd.ms-powerpoint',
      bucketId: bucketId || '',
      uploadedBy: '1',
      uploadedAt: new Date('2024-01-16'),
    },
    {
      id: '3',
      name: 'requirements.docx',
      size: 1024000,
      type: 'application/msword',
      bucketId: bucketId || '',
      uploadedBy: '1',
      uploadedAt: new Date('2024-01-17'),
    },
  ]);

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileTypeIcon = (type: string) => {
    return <FileIcon className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/buckets')}
          className="p-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{bucketName}</h1>
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
            <p className="text-3xl font-bold text-blue-600">{files.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Size</CardTitle>
            <CardDescription>Total size of all files</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {formatFileSize(files.reduce((total, file) => total + file.size, 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
            <CardDescription>File management operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" size="sm">
              <UploadIcon className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
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
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      {getFileTypeIcon(file.type)}
                      <span>{file.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{file.type.split('/')[1]}</Badge>
                  </TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>{file.uploadedAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <DownloadIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVerticalIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BucketDetails;
