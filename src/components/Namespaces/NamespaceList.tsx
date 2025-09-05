import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  PlusIcon, 
  SearchIcon, 
  MoreVerticalIcon, 
  EditIcon, 
  TrashIcon, 
  FolderIcon,
  CalendarIcon,
  Loader2,
  Grid3X3Icon,
  ListIcon
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useListNamespaces, useCreateNamespace, useUpdateNamespace, useDeleteNamespace, useAPIError } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Namespace, CreateNamespaceRequest, UpdateNamespaceRequest } from '@/types';

const NamespaceList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleError } = useAPIError();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingNamespace, setEditingNamespace] = useState<Namespace | null>(null);
  const [newNamespaceName, setNewNamespaceName] = useState('');
  const [editNamespaceName, setEditNamespaceName] = useState('');

  // API Hooks
  const { data: namespaces = [], isLoading, error } = useListNamespaces();
  const createNamespaceMutation = useCreateNamespace();
  const updateNamespaceMutation = useUpdateNamespace();
  const deleteNamespaceMutation = useDeleteNamespace();

  // Filtered namespaces
  const filteredNamespaces = namespaces.filter(namespace =>
    namespace.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleCreateNamespace = async () => {
    if (!newNamespaceName.trim()) return;

    try {
      await createNamespaceMutation.mutateAsync({
        namespaceName: newNamespaceName.trim()
      });
      
      toast({
        title: "Success",
        description: "Namespace created successfully",
      });
      
      setNewNamespaceName('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      const errorMessage = handleError(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEditNamespace = async () => {
    if (!editingNamespace || !editNamespaceName.trim()) return;

    try {
      await updateNamespaceMutation.mutateAsync({
        namespaceId: editingNamespace.id,
        data: { newNamespaceName: editNamespaceName.trim() }
      });
      
      toast({
        title: "Success",
        description: "Namespace updated successfully",
      });
      
      setEditNamespaceName('');
      setEditingNamespace(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      const errorMessage = handleError(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteNamespace = async (namespace: Namespace) => {
    try {
      await deleteNamespaceMutation.mutateAsync(namespace.id);
      
      toast({
        title: "Success",
        description: "Namespace deleted successfully",
      });
    } catch (error) {
      const errorMessage = handleError(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (namespace: Namespace) => {
    setEditingNamespace(namespace);
    setEditNamespaceName(namespace.name);
    setIsEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading namespaces...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Failed to load namespaces</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Namespaces</h1>
          <p className="text-gray-600 mt-1">Manage your data namespaces</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Namespace
        </Button>
      </div>

      {/* Search and View Controls */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search namespaces..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3Icon className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <ListIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {filteredNamespaces.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No namespaces found' : 'No namespaces yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Get started by creating your first namespace'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Namespace
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNamespaces.map((namespace) => (
            <Card key={namespace.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FolderIcon className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">{namespace.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVerticalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/buckets?namespace=${namespace.id}`)}>
                        View Buckets
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(namespace)}>
                        <EditIcon className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteNamespace(namespace)}
                        className="text-red-600"
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {namespace.description && (
                  <CardDescription>{namespace.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Created {formatDate(namespace.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Updated {formatDate(namespace.updatedAt)}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate(`/buckets?namespace=${namespace.id}`)}
                  >
                    View Buckets
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNamespaces.map((namespace) => (
                <TableRow key={namespace.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <FolderIcon className="h-4 w-4 text-blue-600" />
                      <span>{namespace.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{namespace.description || '-'}</TableCell>
                  <TableCell>{formatDate(namespace.createdAt)}</TableCell>
                  <TableCell>{formatDate(namespace.updatedAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/buckets?namespace=${namespace.id}`)}>
                          View Buckets
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(namespace)}>
                          <EditIcon className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteNamespace(namespace)}
                          className="text-red-600"
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create Namespace Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Namespace</DialogTitle>
            <DialogDescription>
              Create a new namespace to organize your data and buckets.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="namespaceName">Namespace Name</Label>
              <Input
                id="namespaceName"
                value={newNamespaceName}
                onChange={(e) => setNewNamespaceName(e.target.value)}
                placeholder="Enter namespace name"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateNamespace}
              disabled={!newNamespaceName.trim() || createNamespaceMutation.isPending}
            >
              {createNamespaceMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Create Namespace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Namespace Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Namespace</DialogTitle>
            <DialogDescription>
              Update the namespace name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editNamespaceName">Namespace Name</Label>
              <Input
                id="editNamespaceName"
                value={editNamespaceName}
                onChange={(e) => setEditNamespaceName(e.target.value)}
                placeholder="Enter namespace name"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditNamespace}
              disabled={!editNamespaceName.trim() || updateNamespaceMutation.isPending}
            >
              {updateNamespaceMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Update Namespace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NamespaceList;
