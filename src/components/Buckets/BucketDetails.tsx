
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
import { ArrowLeftIcon, UploadIcon, DownloadIcon, MoreVerticalIcon, FileIcon, TrashIcon, ArrowUpDownIcon } from 'lucide-react';
import { FileItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Breadcrumbs from '@/components/Layout/Breadcrumbs';

const BucketDetails = () => {
  const { bucketId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bucketName] = useState('project-documents');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' |'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [files, setFiles] = useState<FileItem[]>([
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
    {
      id: '4',
      name: 'budget.xlsx',
      size: 512000,
      type: 'application/vnd.ms-excel',
      bucketId: bucketId || '',
      uploadedBy: '1',
      uploadedAt: new Date('2024-01-18'),
    },
    {
      id: '5',
      name: 'design-mockup.png',
      size: 3072000,
      type: 'image/png',
      bucketId: bucketId || '',
      uploadedBy: '1',
      uploadedAt: new Date('2024-01-19'),
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

  const handleDeleteFile = (fileId: string) => {
    setFiles(files.filter(file => file.id !== fileId));
    toast({
      title: "Success",
      description: "File deleted successfully",
    });
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedFiles = [...files].sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'size':
        aVal = a.size;
        bVal = b.size;
        break;
      case 'type':
        aVal = a.type.toLowerCase();
        bVal = b.type.toLowerCase();
        break;
      case 'uploadedAt':
        aVal = a.uploadedAt.getTime();
        bVal = b.uploadedAt.getTime();
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFiles.map((file) => (
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
                                Are you sure you want to delete "{file.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteFile(file.id)}>
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
    </div>
  );
};

export default BucketDetails;
