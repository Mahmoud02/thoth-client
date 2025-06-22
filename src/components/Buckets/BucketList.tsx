
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderIcon, PlusIcon, MoreVerticalIcon } from 'lucide-react';
import { Bucket } from '@/types';

const BucketList = () => {
  const [buckets] = useState<Bucket[]>([
    {
      id: '1',
      name: 'project-documents',
      description: 'All project related documents and files',
      createdBy: '1',
      createdAt: new Date('2024-01-15'),
      fileCount: 24,
      size: 1024000,
    },
    {
      id: '2',
      name: 'media-assets',
      description: 'Images, videos, and other media files',
      createdBy: '1',
      createdAt: new Date('2024-01-20'),
      fileCount: 156,
      size: 5120000,
    },
    {
      id: '3',
      name: 'backup-files',
      description: 'System backups and archived data',
      createdBy: '1',
      createdAt: new Date('2024-02-01'),
      fileCount: 8,
      size: 2048000,
    },
  ]);

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Buckets</h1>
          <p className="text-slate-600 mt-2">Organize and manage your file containers</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Bucket
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buckets.map((bucket) => (
          <Card key={bucket.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FolderIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{bucket.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {bucket.description}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVerticalIcon className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-4">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{bucket.fileCount}</p>
                    <p className="text-sm text-slate-500">Files</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatFileSize(bucket.size)}
                    </p>
                    <p className="text-sm text-slate-500">Size</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Badge variant="secondary" className="text-xs">
                  Created {bucket.createdAt.toLocaleDateString()}
                </Badge>
                <Button variant="outline" size="sm">
                  Open
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BucketList;
