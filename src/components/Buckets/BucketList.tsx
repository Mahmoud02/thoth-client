
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderIcon, PlusIcon, MoreVerticalIcon, GridIcon, ListIcon } from 'lucide-react';
import { Bucket } from '@/types';
import { useToast } from '@/hooks/use-toast';

const BucketList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBucketName, setNewBucketName] = useState('');
  const [newBucketDescription, setNewBucketDescription] = useState('');
  const [buckets, setBuckets] = useState<Bucket[]>([
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

  const handleCreateBucket = () => {
    if (!newBucketName.trim()) {
      toast({
        title: "Error",
        description: "Bucket name is required",
        variant: "destructive"
      });
      return;
    }

    const newBucket: Bucket = {
      id: Date.now().toString(),
      name: newBucketName.trim(),
      description: newBucketDescription.trim(),
      createdBy: '1',
      createdAt: new Date(),
      fileCount: 0,
      size: 0,
    };

    setBuckets([...buckets, newBucket]);
    setNewBucketName('');
    setNewBucketDescription('');
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Bucket created successfully",
    });
  };

  const handleBucketClick = (bucketId: string) => {
    navigate(`/buckets/${bucketId}`);
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {buckets.map((bucket) => (
        <Card 
          key={bucket.id} 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleBucketClick(bucket.id)}
        >
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
              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
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
              <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                Open
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const TableView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Files</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {buckets.map((bucket) => (
          <TableRow 
            key={bucket.id} 
            className="cursor-pointer hover:bg-slate-50"
            onClick={() => handleBucketClick(bucket.id)}
          >
            <TableCell className="font-medium flex items-center space-x-2">
              <FolderIcon className="w-4 h-4 text-blue-600" />
              <span>{bucket.name}</span>
            </TableCell>
            <TableCell>{bucket.description}</TableCell>
            <TableCell>{bucket.fileCount}</TableCell>
            <TableCell>{formatFileSize(bucket.size)}</TableCell>
            <TableCell>{bucket.createdAt.toLocaleDateString()}</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                <MoreVerticalIcon className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Buckets</h1>
          <p className="text-slate-600 mt-2">Organize and manage your file containers</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <GridIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Bucket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Bucket</DialogTitle>
                <DialogDescription>
                  Create a new bucket to organize your files.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bucketName">Bucket Name</Label>
                  <Input
                    id="bucketName"
                    value={newBucketName}
                    onChange={(e) => setNewBucketName(e.target.value)}
                    placeholder="Enter bucket name"
                  />
                </div>
                <div>
                  <Label htmlFor="bucketDescription">Description (Optional)</Label>
                  <Textarea
                    id="bucketDescription"
                    value={newBucketDescription}
                    onChange={(e) => setNewBucketDescription(e.target.value)}
                    placeholder="Enter bucket description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBucket}>Create Bucket</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'table')}>
        <TabsList className="hidden">
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>
        <TabsContent value="grid">
          <GridView />
        </TabsContent>
        <TabsContent value="table">
          <TableView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BucketList;
