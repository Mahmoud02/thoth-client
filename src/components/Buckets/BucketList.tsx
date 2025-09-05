
import React, { useState, useEffect } from 'react';
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
import { FolderIcon, PlusIcon, MoreVerticalIcon, GridIcon, ListIcon, TrashIcon, EditIcon, ArrowUpDownIcon, Loader2 } from 'lucide-react';
import { Bucket, CreateBucketRequest } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useCreateBucket, useUpdateBucket, useDeleteBucket, useListBuckets, useAPIError } from '@/hooks/use-api';
import Breadcrumbs from '@/components/Layout/Breadcrumbs';

const BucketList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleError } = useAPIError();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBucket, setEditingBucket] = useState<Bucket | null>(null);
  const [newBucketName, setNewBucketName] = useState('');
  const [newBucketDescription, setNewBucketDescription] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // API Hooks
  const createBucketMutation = useCreateBucket();
  const updateBucketMutation = useUpdateBucket();
  const deleteBucketMutation = useDeleteBucket();
  const { data: buckets = [], isLoading: isLoadingBuckets } = useListBuckets(1); // Default namespace ID

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleCreateBucket = async () => {
    if (!newBucketName.trim()) {
      toast({
        title: "Error",
        description: "Bucket name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const createRequest: CreateBucketRequest = {
        name: newBucketName.trim(),
        namespaceId: 1, // Default namespace for now
      };

      await createBucketMutation.mutateAsync(createRequest);
      
      setNewBucketName('');
      setNewBucketDescription('');
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Bucket created successfully",
      });
    } catch (error) {
      const apiError = handleError(error);
      toast({
        title: "Error",
        description: apiError.message,
        variant: "destructive"
      });
    }
  };

  const handleEditBucket = async () => {
    if (!editingBucket || !newBucketName.trim()) return;

    try {
      await updateBucketMutation.mutateAsync({
        bucketId: editingBucket.id,
        data: { name: newBucketName.trim() }
      });

      setIsEditDialogOpen(false);
      setEditingBucket(null);
      setNewBucketName('');
      setNewBucketDescription('');

      toast({
        title: "Success",
        description: "Bucket updated successfully",
      });
    } catch (error) {
      const apiError = handleError(error);
      toast({
        title: "Error",
        description: apiError.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteBucket = async (bucketId: number) => {
    try {
      await deleteBucketMutation.mutateAsync(bucketId);
      toast({
        title: "Success",
        description: "Bucket deleted successfully",
      });
    } catch (error) {
      const apiError = handleError(error);
      toast({
        title: "Error",
        description: apiError.message,
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (bucket: Bucket) => {
    setEditingBucket(bucket);
    setNewBucketName(bucket.name);
    setNewBucketDescription(''); // API doesn't have description field
    setIsEditDialogOpen(true);
  };

  const handleBucketClick = (bucketId: number) => {
    navigate(`/buckets/${bucketId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedBuckets = [...buckets].sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'createdAt':
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedBuckets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBuckets = sortedBuckets.slice(startIndex, startIndex + itemsPerPage);

  if (isLoadingBuckets) {
    return (
      <div className="space-y-6">
        <Breadcrumbs />
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg text-slate-600">Loading buckets...</span>
        </div>
      </div>
    );
  }

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {paginatedBuckets.map((bucket) => (
        <Card 
          key={bucket.id} 
          className="hover:shadow-lg transition-shadow cursor-pointer relative"
          onClick={() => handleBucketClick(bucket.id)}
        >
          <div className="absolute top-2 right-2 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 w-8 p-0"
                >
                  <MoreVerticalIcon className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  openEditDialog(bucket);
                }}>
                  <EditIcon className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Bucket</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{bucket.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteBucket(bucket.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FolderIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{bucket.name}</CardTitle>
                <CardDescription className="text-sm">
                  Namespace ID: {bucket.namespaceId}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-4">
                <div>
                  <p className="text-2xl font-bold text-slate-900">-</p>
                  <p className="text-sm text-slate-500">Files</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">-</p>
                  <p className="text-sm text-slate-500">Size</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <Badge variant="secondary" className="text-xs">
                Created {formatDate(bucket.createdAt)}
              </Badge>
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
          <TableHead>
            <Button variant="ghost" onClick={() => handleSort('name')} className="h-auto p-0">
              Name <ArrowUpDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>Namespace</TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => handleSort('createdAt')} className="h-auto p-0">
              Created <ArrowUpDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paginatedBuckets.map((bucket) => (
          <TableRow 
            key={bucket.id} 
            className="cursor-pointer hover:bg-slate-50"
            onClick={() => handleBucketClick(bucket.id)}
          >
            <TableCell className="font-medium flex items-center space-x-2">
              <FolderIcon className="w-4 h-4 text-blue-600" />
              <span>{bucket.name}</span>
            </TableCell>
            <TableCell>{bucket.namespaceId}</TableCell>
            <TableCell>{formatDate(bucket.createdAt)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                    <MoreVerticalIcon className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    openEditDialog(bucket);
                  }}>
                    <EditIcon className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Bucket</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{bucket.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteBucket(bucket.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Buckets</h1>
          <p className="text-slate-600 mt-2">Organize and manage your file containers</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="createdAt">Date</SelectItem>
            </SelectContent>
          </Select>
          
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
                <Button 
                  onClick={handleCreateBucket}
                  disabled={createBucketMutation.isPending}
                >
                  {createBucketMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Bucket
                </Button>
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

      {totalPages > 1 && (
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
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bucket</DialogTitle>
            <DialogDescription>
              Update bucket information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editBucketName">Bucket Name</Label>
              <Input
                id="editBucketName"
                value={newBucketName}
                onChange={(e) => setNewBucketName(e.target.value)}
                placeholder="Enter bucket name"
              />
            </div>
            <div>
              <Label htmlFor="editBucketDescription">Description (Optional)</Label>
              <Textarea
                id="editBucketDescription"
                value={newBucketDescription}
                onChange={(e) => setNewBucketDescription(e.target.value)}
                placeholder="Enter bucket description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditBucket}
              disabled={updateBucketMutation.isPending}
            >
              {updateBucketMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Bucket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BucketList;
