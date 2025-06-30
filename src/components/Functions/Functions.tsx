import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  CheckCircleIcon, 
  FileTypeIcon, 
  ScaleIcon, 
  ShieldIcon, 
  PlusIcon, 
  GripVerticalIcon,
  TrashIcon,
  SettingsIcon,
  FolderIcon
} from 'lucide-react';
import { FunctionChain, FunctionStep, Bucket } from '@/types';
import Breadcrumbs from '@/components/Layout/Breadcrumbs';

const Functions = () => {
  // Mock buckets data
  const [buckets] = useState<Bucket[]>([
    {
      id: 'bucket-1',
      name: 'Documents',
      description: 'Office documents and PDFs',
      createdBy: 'user-1',
      createdAt: new Date(),
      fileCount: 45,
      size: 1024000,
    },
    {
      id: 'bucket-2',
      name: 'Images',
      description: 'Photos and graphics',
      createdBy: 'user-1', 
      createdAt: new Date(),
      fileCount: 120,
      size: 5120000,
    },
    {
      id: 'bucket-3',
      name: 'Media Files',
      description: 'Videos and audio files',
      createdBy: 'user-1',
      createdAt: new Date(),
      fileCount: 20,
      size: 10240000,
    },
  ]);

  const [availableFunctions] = useState<FunctionStep[]>([
    {
      id: '1',
      name: 'File Size Check',
      description: 'Validates file size limits',
      type: 'validation',
      icon: ScaleIcon,
      parameters: { maxSize: '10MB' },
      order: 0,
    },
    {
      id: '2',
      name: 'File Extension Check',
      description: 'Validates allowed file extensions',
      type: 'validation',
      icon: FileTypeIcon,
      parameters: { allowedExtensions: ['.jpg', '.png', '.pdf'] },
      order: 0,
    },
    {
      id: '3',
      name: 'Virus Scan',
      description: 'Scans files for malware',
      type: 'security',
      icon: ShieldIcon,
      parameters: {},
      order: 0,
    },
    {
      id: '4',
      name: 'Content Validation',
      description: 'Validates file content and structure',
      type: 'validation',
      icon: CheckCircleIcon,
      parameters: {},
      order: 0,
    },
  ]);

  const [functionChains, setFunctionChains] = useState<FunctionChain[]>([
    {
      id: '1',
      name: 'Standard Upload Chain',
      description: 'Basic validation for all uploads',
      bucketId: 'bucket-1',
      steps: [
        { ...availableFunctions[0], order: 0 },
        { ...availableFunctions[1], order: 1 },
      ],
      isActive: true,
    },
  ]);

  const [selectedChain, setSelectedChain] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newChainName, setNewChainName] = useState('');
  const [newChainDescription, setNewChainDescription] = useState('');
  const [selectedBucketId, setSelectedBucketId] = useState<string>('');

  const handleDragEnd = (result: any) => {
    if (!result.destination || !selectedChain) return;

    const chain = functionChains.find(c => c.id === selectedChain);
    if (!chain) return;

    const items = Array.from(chain.steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setFunctionChains(prev =>
      prev.map(c =>
        c.id === selectedChain
          ? { ...c, steps: updatedItems }
          : c
      )
    );
  };

  const addFunctionToChain = (functionId: string) => {
    if (!selectedChain) return;

    const func = availableFunctions.find(f => f.id === functionId);
    if (!func) return;

    const chain = functionChains.find(c => c.id === selectedChain);
    if (!chain) return;

    const newStep: FunctionStep = {
      id: func.id,
      name: func.name,
      description: func.description,
      type: func.type,
      icon: func.icon,
      parameters: func.parameters,
      order: chain.steps.length,
    };

    setFunctionChains(prev =>
      prev.map(c =>
        c.id === selectedChain
          ? { ...c, steps: [...c.steps, newStep] }
          : c
      )
    );
  };

  const removeFunctionFromChain = (functionId: string) => {
    if (!selectedChain) return;

    setFunctionChains(prev =>
      prev.map(c =>
        c.id === selectedChain
          ? { 
              ...c, 
              steps: c.steps
                .filter(s => s.id !== functionId)
                .map((s, index) => ({ ...s, order: index }))
            }
          : c
      )
    );
  };

  const createNewChain = () => {
    const newChain: FunctionChain = {
      id: Date.now().toString(),
      name: newChainName,
      description: newChainDescription,
      bucketId: selectedBucketId,
      steps: [],
      isActive: false,
    };

    setFunctionChains(prev => [...prev, newChain]);
    setNewChainName('');
    setNewChainDescription('');
    setSelectedBucketId('');
    setIsDialogOpen(false);
  };

  const updateChainBucket = (chainId: string, bucketId: string) => {
    setFunctionChains(prev =>
      prev.map(c =>
        c.id === chainId
          ? { ...c, bucketId }
          : c
      )
    );
  };

  const toggleChainStatus = (chainId: string) => {
    setFunctionChains(prev =>
      prev.map(c =>
        c.id === chainId
          ? { ...c, isActive: !c.isActive }
          : c
      )
    );
  };

  const selectedChainData = functionChains.find(c => c.id === selectedChain);
  const getBucketName = (bucketId: string) => {
    const bucket = buckets.find(b => b.id === bucketId);
    return bucket?.name || 'No bucket assigned';
  };

  return (
    <div className="space-y-6 w-full">
      <Breadcrumbs />
      
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Function Management</h1>
        <p className="text-slate-600 mt-2">Configure pre-upload validation and processing chains</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
        {/* Available Functions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Functions</CardTitle>
            <CardDescription>Drag functions to build your chain</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableFunctions.map((func) => (
              <div
                key={func.id}
                className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => addFunctionToChain(func.id)}
              >
                <div className="flex items-center space-x-2">
                  <func.icon className="w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{func.name}</p>
                    <p className="text-xs text-slate-500">{func.description}</p>
                  </div>
                  <PlusIcon className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Function Chains */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Function Chains</CardTitle>
                <CardDescription>Configure processing workflows for your buckets</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    New Chain
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Function Chain</DialogTitle>
                    <DialogDescription>
                      Create a new processing chain for your buckets
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="chainName">Chain Name</Label>
                      <Input
                        id="chainName"
                        value={newChainName}
                        onChange={(e) => setNewChainName(e.target.value)}
                        placeholder="Enter chain name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="chainDescription">Description</Label>
                      <Input
                        id="chainDescription"
                        value={newChainDescription}
                        onChange={(e) => setNewChainDescription(e.target.value)}
                        placeholder="Enter chain description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bucketSelect">Assign to Bucket</Label>
                      <Select value={selectedBucketId} onValueChange={setSelectedBucketId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a bucket" />
                        </SelectTrigger>
                        <SelectContent>
                          {buckets.map((bucket) => (
                            <SelectItem key={bucket.id} value={bucket.id}>
                              <div className="flex items-center space-x-2">
                                <FolderIcon className="w-4 h-4" />
                                <span>{bucket.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createNewChain} disabled={!newChainName || !selectedBucketId}>
                      Create Chain
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select Chain to Configure</Label>
              <Select value={selectedChain} onValueChange={setSelectedChain}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a function chain" />
                </SelectTrigger>
                <SelectContent>
                  {functionChains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id}>
                      <div className="flex items-center space-x-2">
                        <span>{chain.name}</span>
                        <Badge variant={chain.isActive ? 'default' : 'secondary'}>
                          {chain.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          → {getBucketName(chain.bucketId)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedChainData && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedChainData.name}</h3>
                    <p className="text-sm text-slate-600">{selectedChainData.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <FolderIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">
                        Assigned to: {getBucketName(selectedChainData.bucketId)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select 
                      value={selectedChainData.bucketId} 
                      onValueChange={(bucketId) => updateChainBucket(selectedChainData.id, bucketId)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {buckets.map((bucket) => (
                          <SelectItem key={bucket.id} value={bucket.id}>
                            <div className="flex items-center space-x-2">
                              <FolderIcon className="w-4 h-4" />
                              <span>{bucket.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant={selectedChainData.isActive ? "destructive" : "default"}
                      onClick={() => toggleChainStatus(selectedChainData.id)}
                    >
                      {selectedChainData.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Processing Steps</h4>
                  {selectedChainData.steps.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <SettingsIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p>No functions added to this chain</p>
                      <p className="text-sm">Add functions from the left panel</p>
                    </div>
                  ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="function-chain">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2"
                          >
                            {selectedChainData.steps
                              .sort((a, b) => a.order - b.order)
                              .map((step, index) => (
                                <Draggable
                                  key={step.id}
                                  draggableId={step.id}
                                  index={index}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="bg-white border rounded-lg p-3 flex items-center space-x-3"
                                    >
                                      <div
                                        {...provided.dragHandleProps}
                                        className="text-slate-400 hover:text-slate-600"
                                      >
                                        <GripVerticalIcon className="w-4 h-4" />
                                      </div>
                                      <div className="flex items-center space-x-2 flex-1">
                                        <step.icon className="w-4 h-4 text-blue-600" />
                                        <div>
                                          <p className="text-sm font-medium">{step.name}</p>
                                          <p className="text-xs text-slate-500">{step.description}</p>
                                        </div>
                                      </div>
                                      <Badge variant="outline" className="text-xs">
                                        Step {index + 1}
                                      </Badge>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFunctionFromChain(step.id)}
                                      >
                                        <TrashIcon className="w-4 h-4 text-red-500" />
                                      </Button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Functions;
