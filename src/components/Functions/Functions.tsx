
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  CheckCircleIcon, 
  FileTypeIcon, 
  ScaleIcon, 
  TextIcon,
  PlusIcon,
  TrashIcon,
  SettingsIcon,
  GripVerticalIcon,
  PlayIcon
} from 'lucide-react';
import { ValidationFunction, Bucket, BucketFunction } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Breadcrumbs from '@/components/Layout/Breadcrumbs';

const Functions = () => {
  const { toast } = useToast();
  const [selectedBucket, setSelectedBucket] = useState<string>('');
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [configFunction, setConfigFunction] = useState<ValidationFunction | null>(null);
  const [functionParams, setFunctionParams] = useState<{ [key: string]: any }>({});

  // Mock data for available functions
  const availableFunctions: ValidationFunction[] = [
    {
      id: 'size-check',
      name: 'File Size Check',
      description: 'Validate file size limits',
      type: 'size',
      icon: 'ScaleIcon',
      parameters: { maxSize: 10485760, unit: 'MB' }
    },
    {
      id: 'extension-check',
      name: 'File Extension Check',
      description: 'Validate allowed file extensions',
      type: 'extension',
      icon: 'FileTypeIcon',
      parameters: { allowedExtensions: ['pdf', 'jpg', 'png', 'docx'] }
    },
    {
      id: 'name-check',
      name: 'File Name Check',
      description: 'Validate file name patterns',
      type: 'name',
      icon: 'TextIcon',
      parameters: { pattern: '^[a-zA-Z0-9_-]+$', minLength: 1, maxLength: 255 }
    },
    {
      id: 'content-scan',
      name: 'Content Scan',
      description: 'Scan file content for malware',
      type: 'content',
      icon: 'CheckCircleIcon',
      parameters: { scanDepth: 'deep' }
    }
  ];

  // Mock buckets data
  const buckets: Bucket[] = [
    {
      id: '1',
      name: 'project-documents',
      description: 'All project related documents',
      createdBy: '1',
      createdAt: new Date(),
      fileCount: 24,
      size: 1024000,
      functions: [
        { id: '1', functionId: 'size-check', order: 1, parameters: { maxSize: 5242880 } },
        { id: '2', functionId: 'extension-check', order: 2, parameters: { allowedExtensions: ['pdf', 'docx'] } }
      ]
    },
    {
      id: '2',
      name: 'media-assets',
      description: 'Images and media files',
      createdBy: '1',
      createdAt: new Date(),
      fileCount: 156,
      size: 5120000,
      functions: []
    }
  ];

  const [bucketFunctions, setBucketFunctions] = useState<{ [bucketId: string]: BucketFunction[] }>({
    '1': buckets[0].functions || [],
    '2': buckets[1].functions || []
  });

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'ScaleIcon': return <ScaleIcon className="w-5 h-5" />;
      case 'FileTypeIcon': return <FileTypeIcon className="w-5 h-5" />;
      case 'TextIcon': return <TextIcon className="w-5 h-5" />;
      case 'CheckCircleIcon': return <CheckCircleIcon className="w-5 h-5" />;
      default: return <SettingsIcon className="w-5 h-5" />;
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination || !selectedBucket) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    const sourceDroppableId = result.source.droppableId;
    const destDroppableId = result.destination.droppableId;

    if (sourceDroppableId === 'available' && destDroppableId === 'assigned') {
      // Adding function to bucket
      const functionToAdd = availableFunctions[sourceIndex];
      const newBucketFunction: BucketFunction = {
        id: Date.now().toString(),
        functionId: functionToAdd.id,
        order: bucketFunctions[selectedBucket].length + 1,
        parameters: { ...functionToAdd.parameters }
      };

      setBucketFunctions(prev => ({
        ...prev,
        [selectedBucket]: [...prev[selectedBucket], newBucketFunction]
      }));

      toast({
        title: "Function Added",
        description: `Added ${functionToAdd.name} to the processing chain`,
      });
    } else if (sourceDroppableId === 'assigned' && destDroppableId === 'assigned') {
      // Reordering functions in bucket
      const functions = [...bucketFunctions[selectedBucket]];
      const [removed] = functions.splice(sourceIndex, 1);
      functions.splice(destIndex, 0, removed);

      // Update order
      const updatedFunctions = functions.map((func, index) => ({
        ...func,
        order: index + 1
      }));

      setBucketFunctions(prev => ({
        ...prev,
        [selectedBucket]: updatedFunctions
      }));
    }
  };

  const removeFunction = (functionId: string) => {
    if (!selectedBucket) return;

    setBucketFunctions(prev => ({
      ...prev,
      [selectedBucket]: prev[selectedBucket].filter(f => f.id !== functionId)
    }));

    toast({
      title: "Function Removed",
      description: "Function removed from processing chain",
    });
  };

  const openConfigDialog = (bucketFunction: BucketFunction) => {
    const validationFunction = availableFunctions.find(f => f.id === bucketFunction.functionId);
    if (validationFunction) {
      setConfigFunction(validationFunction);
      setFunctionParams(bucketFunction.parameters);
      setIsConfigDialogOpen(true);
    }
  };

  const saveConfiguration = () => {
    if (!selectedBucket || !configFunction) return;

    setBucketFunctions(prev => ({
      ...prev,
      [selectedBucket]: prev[selectedBucket].map(f => 
        f.functionId === configFunction.id 
          ? { ...f, parameters: functionParams }
          : f
      )
    }));

    setIsConfigDialogOpen(false);
    toast({
      title: "Configuration Saved",
      description: "Function parameters updated successfully",
    });
  };

  const testChain = async () => {
    if (!selectedBucket) return;

    toast({
      title: "Testing Chain",
      description: "Running validation chain test...",
    });

    // Simulate testing
    setTimeout(() => {
      toast({
        title: "Test Complete",
        description: "All functions in the chain executed successfully",
      });
    }, 2000);
  };

  const selectedBucketData = buckets.find(b => b.id === selectedBucket);
  const currentFunctions = selectedBucket ? bucketFunctions[selectedBucket] || [] : [];

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Function Management</h1>
        <p className="text-slate-600 mt-2">Configure validation functions for your buckets</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Bucket</CardTitle>
          <CardDescription>Choose a bucket to configure its validation chain</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedBucket} onValueChange={setSelectedBucket}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a bucket to configure" />
            </SelectTrigger>
            <SelectContent>
              {buckets.map((bucket) => (
                <SelectItem key={bucket.id} value={bucket.id}>
                  {bucket.name} ({bucket.fileCount} files)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedBucket && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Functions */}
            <Card>
              <CardHeader>
                <CardTitle>Available Functions</CardTitle>
                <CardDescription>Drag functions to the processing chain</CardDescription>
              </CardHeader>
              <CardContent>
                <Droppable droppableId="available" isDropDisabled={true}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                      {availableFunctions.map((func, index) => (
                        <Draggable key={func.id} draggableId={func.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 border rounded-lg cursor-move transition-colors ${
                                snapshot.isDragging ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                  {getIconComponent(func.icon)}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-slate-900">{func.name}</h4>
                                  <p className="text-sm text-slate-500">{func.description}</p>
                                </div>
                                <GripVerticalIcon className="w-4 h-4 text-slate-400" />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>

            {/* Processing Chain */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Processing Chain - {selectedBucketData?.name}</CardTitle>
                    <CardDescription>Functions will execute in this order</CardDescription>
                  </div>
                  {currentFunctions.length > 0 && (
                    <Button onClick={testChain} size="sm" variant="outline">
                      <PlayIcon className="w-4 h-4 mr-2" />
                      Test Chain
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Droppable droppableId="assigned">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`min-h-[200px] space-y-3 p-4 border-2 border-dashed rounded-lg transition-colors ${
                        snapshot.isDraggingOver 
                          ? 'border-blue-400 bg-blue-50' 
                          : currentFunctions.length === 0 
                            ? 'border-slate-200 bg-slate-50' 
                            : 'border-transparent bg-transparent'
                      }`}
                    >
                      {currentFunctions.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-slate-500">Drop functions here to create a processing chain</p>
                        </div>
                      ) : (
                        currentFunctions.map((bucketFunc, index) => {
                          const func = availableFunctions.find(f => f.id === bucketFunc.functionId);
                          if (!func) return null;

                          return (
                            <Draggable key={bucketFunc.id} draggableId={bucketFunc.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`p-4 border rounded-lg transition-colors ${
                                    snapshot.isDragging ? 'bg-green-50 border-green-300' : 'bg-white border-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div {...provided.dragHandleProps}>
                                      <GripVerticalIcon className="w-4 h-4 text-slate-400 cursor-move" />
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {index + 1}
                                    </Badge>
                                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                      {getIconComponent(func.icon)}
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-medium text-slate-900">{func.name}</h4>
                                      <p className="text-sm text-slate-500">{func.description}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => openConfigDialog(bucketFunc)}
                                      >
                                        <SettingsIcon className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeFunction(bucketFunc.id)}
                                      >
                                        <TrashIcon className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>
        </DragDropContext>
      )}

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure {configFunction?.name}</DialogTitle>
            <DialogDescription>
              Adjust parameters for this validation function
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {configFunction?.type === 'size' && (
              <div>
                <Label htmlFor="maxSize">Maximum File Size (MB)</Label>
                <Input
                  id="maxSize"
                  type="number"
                  value={functionParams.maxSize ? Math.round(functionParams.maxSize / 1024 / 1024) : 10}
                  onChange={(e) => setFunctionParams(prev => ({
                    ...prev,
                    maxSize: parseInt(e.target.value) * 1024 * 1024
                  }))}
                />
              </div>
            )}
            {configFunction?.type === 'extension' && (
              <div>
                <Label htmlFor="extensions">Allowed Extensions (comma-separated)</Label>
                <Input
                  id="extensions"
                  value={functionParams.allowedExtensions?.join(', ') || ''}
                  onChange={(e) => setFunctionParams(prev => ({
                    ...prev,
                    allowedExtensions: e.target.value.split(',').map(ext => ext.trim())
                  }))}
                />
              </div>
            )}
            {configFunction?.type === 'name' && (
              <>
                <div>
                  <Label htmlFor="pattern">Name Pattern (regex)</Label>
                  <Input
                    id="pattern"
                    value={functionParams.pattern || ''}
                    onChange={(e) => setFunctionParams(prev => ({
                      ...prev,
                      pattern: e.target.value
                    }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minLength">Min Length</Label>
                    <Input
                      id="minLength"
                      type="number"
                      value={functionParams.minLength || 1}
                      onChange={(e) => setFunctionParams(prev => ({
                        ...prev,
                        minLength: parseInt(e.target.value)
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxLength">Max Length</Label>
                    <Input
                      id="maxLength"
                      type="number"
                      value={functionParams.maxLength || 255}
                      onChange={(e) => setFunctionParams(prev => ({
                        ...prev,
                        maxLength: parseInt(e.target.value)
                      }))}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveConfiguration}>Save Configuration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Functions;
