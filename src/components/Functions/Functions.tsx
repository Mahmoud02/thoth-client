import React, { useState, useEffect } from 'react';
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
  FolderIcon,
  LayersIcon
} from 'lucide-react';
import { FunctionChain, FunctionStep, Bucket, AvailableFunction } from '@/types';
import { useGetAvailableFunctions, useListBuckets, useAddBucketFunctions, useGetBucket, useListNamespaces, queryKeys } from '@/hooks/use-api';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import Breadcrumbs from '@/components/Layout/Breadcrumbs';
import ConfiguredFunction from './ConfiguredFunction';

// Helper function to map available functions to UI format
const mapAvailableFunctionToFunctionStep = (func: AvailableFunction): FunctionStep => {
  const getIcon = (functionType: string) => {
    // Dynamic icon mapping based on function type
    const iconMap: Record<string, any> = {
      'SIZE_LIMIT': ScaleIcon,
      'EXTENSION_VALIDATOR': FileTypeIcon,
      'CONTENT_VALIDATOR': CheckCircleIcon,
      'NAME_VALIDATOR': ShieldIcon,
    };
    return iconMap[functionType] || SettingsIcon;
  };

  const getType = (functionType: string): 'validation' | 'security' | 'processing' => {
    // Dynamic type mapping - you can extend this based on your needs
    const validationTypes = ['SIZE_LIMIT', 'EXTENSION_VALIDATOR', 'CONTENT_VALIDATOR', 'NAME_VALIDATOR'];
    return validationTypes.includes(functionType) ? 'validation' : 'processing';
  };

  return {
    id: func.functionId,
    name: func.functionName,
    description: func.description,
    type: getType(func.functionType),
    icon: getIcon(func.functionType),
    parameters: func.exampleConfig,
    order: 0,
  };
};

const Functions = () => {
  // Get data from API
  const { data: namespaces = [], isLoading: isLoadingNamespaces } = useListNamespaces();
  const [selectedNamespaceId, setSelectedNamespaceId] = useState<number | null>(null);
  const { data: bucketsData = [], isLoading: isLoadingBuckets } = useListBuckets(selectedNamespaceId || 1);
  const { data: availableFunctionsData = [], isLoading: isLoadingFunctions } = useGetAvailableFunctions();

  // Transform API data to UI format
  const buckets = bucketsData.map(bucket => ({
    id: bucket.id.toString(),
    name: bucket.name,
    description: `Bucket in namespace ${bucket.namespaceId}`,
    createdBy: 'system',
    createdAt: new Date(bucket.createdAt),
    fileCount: 0, // This would need a separate API call
    size: 0, // This would need a separate API call
  }));

  const availableFunctions: FunctionStep[] = availableFunctionsData.map(mapAvailableFunctionToFunctionStep);

  // Bucket-specific function configurations
  const [bucketConfigurations, setBucketConfigurations] = useState<Record<string, any[]>>({});
  const [selectedBucketId, setSelectedBucketId] = useState<string>('');
  const [lastSavedBucket, setLastSavedBucket] = useState<string | null>(null);
  const { toast } = useToast();

  // Get detailed bucket data when a bucket is selected
  const { data: selectedBucketData, isLoading: isLoadingBucketDetails } = useGetBucket(
    selectedBucketId ? parseInt(selectedBucketId) : 0,
    !!selectedBucketId
  );
  
  // Extract functions from bucket data
  const existingBucketFunctions = selectedBucketData?.functions || {};

  // Load existing bucket functions when bucket is first selected
  useEffect(() => {
    if (selectedBucketId && !isLoadingBucketDetails) {
      // Only load if we don't already have configurations for this bucket
      if (!bucketConfigurations[selectedBucketId]) {
        if (existingBucketFunctions && Object.keys(existingBucketFunctions).length > 0) {
          // Convert existing functions object to our local format
          const existingConfigs = Object.entries(existingBucketFunctions).map(([functionType, config]: [string, any]) => ({
            type: functionType,
            properties: config.properties || {}
          }));

          setBucketConfigurations(prev => ({
            ...prev,
            [selectedBucketId]: existingConfigs
          }));
        } else {
          // Initialize with empty array if no existing functions found
          setBucketConfigurations(prev => ({
            ...prev,
            [selectedBucketId]: []
          }));
        }
      }
    }
  }, [selectedBucketId, isLoadingBucketDetails, existingBucketFunctions]);

  // Clear selected bucket and configurations when namespace changes
  useEffect(() => {
    setSelectedBucketId('');
    setLastSavedBucket(null);
    setBucketConfigurations({});
  }, [selectedNamespaceId]);

  // Add function to bucket configuration
  const addFunctionToBucket = (functionId: string) => {
    if (!selectedBucketId) return;

    const func = availableFunctionsData.find(f => f.functionId === functionId);
    if (!func) return;

    const newConfiguration = {
      type: func.functionType,
      properties: { ...(func.exampleConfig || {}) }
    };
    
    // Remove any 'type' field from properties if it exists
    if (newConfiguration.properties.type) {
      delete newConfiguration.properties.type;
    }

    setBucketConfigurations(prev => ({
      ...prev,
      [selectedBucketId]: [...(prev[selectedBucketId] || []), newConfiguration]
    }));
  };

  // Remove function from bucket configuration
  const removeFunctionFromBucket = (index: number) => {
    if (!selectedBucketId) return;

    const configs = bucketConfigurations[selectedBucketId] || [];
    const removedConfig = configs[index];

    setBucketConfigurations(prev => ({
      ...prev,
      [selectedBucketId]: prev[selectedBucketId]?.filter((_, i) => i !== index) || []
    }));
  };

  // Update function configuration
  const updateFunctionConfiguration = (index: number, configuration: any) => {
    if (!selectedBucketId) return;

    setBucketConfigurations(prev => ({
      ...prev,
      [selectedBucketId]: prev[selectedBucketId]?.map((config, i) => 
        i === index ? configuration : config
      ) || []
    }));
  };

  // Reorder functions
  const reorderFunction = (index: number, direction: 'up' | 'down') => {
    if (!selectedBucketId) return;

    const configs = bucketConfigurations[selectedBucketId] || [];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= configs.length) return;

    const newConfigs = [...configs];
    [newConfigs[index], newConfigs[newIndex]] = [newConfigs[newIndex], newConfigs[index]];
    
    setBucketConfigurations(prev => ({
      ...prev,
      [selectedBucketId]: newConfigs
    }));
  };

  // Save configuration to backend
  const addBucketFunctionsMutation = useAddBucketFunctions();
  const queryClient = useQueryClient();
  
  const saveConfiguration = async () => {
    if (!selectedBucketId) return;

    const configs = bucketConfigurations[selectedBucketId] || [];
    if (configs.length === 0) {
      toast({
        title: "No functions to save",
        description: "Add some functions before saving the configuration.",
        variant: "destructive",
      });
      return;
    }

    try {
      const requestData = {
        bucketId: parseInt(selectedBucketId),
        configs: configs.map((config, index) => {
          // Create a clean properties object without the type field
          const cleanProperties = { ...config.properties };
          delete cleanProperties.type; // Remove type field if it exists
          
          return {
            type: config.type,
            properties: {
              ...cleanProperties,
              order: index + 1
            }
          };
        })
      };
      
      console.log('🚀 Sending bucket functions request:', JSON.stringify(requestData, null, 2));
      
      await addBucketFunctionsMutation.mutateAsync(requestData);
      
      setLastSavedBucket(selectedBucketId);
      
      // Invalidate bucket details query to refresh functions
      queryClient.invalidateQueries({ queryKey: queryKeys.bucket(parseInt(selectedBucketId)) });
      // Also invalidate buckets list to keep it in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.buckets });
      
      // Update local state to reflect the saved configuration
      // This ensures the UI shows the saved state correctly
      setBucketConfigurations(prev => ({
        ...prev,
        [selectedBucketId]: configs.map((config, index) => ({
          type: config.type,
          properties: {
            ...config.properties,
            order: index + 1
          }
        }))
      }));
      
      toast({
        title: "Configuration saved successfully!",
        description: `${configs.length} function(s) configured for ${selectedBucket?.name}`,
      });
    } catch (error) {
      console.error('Failed to save configuration:', error);
      toast({
        title: "Failed to save configuration",
        description: "Please check your configuration and try again.",
        variant: "destructive",
      });
    }
  };

  const selectedBucket = buckets.find(b => b.id === selectedBucketId);
  const currentConfigurations = selectedBucketId ? bucketConfigurations[selectedBucketId] || [] : [];

  // Check if a function is already selected for the current bucket
  const isFunctionSelected = (functionId: string) => {
    if (!selectedBucketId) return false;
    const configs = bucketConfigurations[selectedBucketId] || [];
    const func = availableFunctionsData.find(f => f.functionId === functionId);
    if (!func) return false;
    return configs.some(config => config.type === func.functionType);
  };

  return (
    <div className="space-y-6 w-full">
      <Breadcrumbs />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Function Management</h1>
          <p className="text-slate-600 mt-2">
            {selectedNamespaceId ? 
              `Configure functions for buckets in ${namespaces.find(ns => ns.id === selectedNamespaceId)?.name || 'selected namespace'}` :
              'Configure validation and processing functions for your buckets'
            }
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select 
            value={selectedNamespaceId?.toString() || 'all'} 
            onValueChange={(value) => setSelectedNamespaceId(value === 'all' ? null : parseInt(value))}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select namespace" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingNamespaces ? (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Loading...</span>
                  </div>
                </SelectItem>
              ) : namespaces.length === 0 ? (
                <SelectItem value="no-namespaces" disabled>
                  <div className="flex items-center space-x-2">
                    <LayersIcon className="h-4 w-4" />
                    <span>No namespaces</span>
                  </div>
                </SelectItem>
              ) : (
                <>
                  <SelectItem value="all">
                    <div className="flex items-center space-x-2">
                      <LayersIcon className="h-4 w-4" />
                      <span>All Namespaces</span>
                    </div>
                  </SelectItem>
                  {namespaces.map((namespace) => (
                    <SelectItem key={namespace.id} value={namespace.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <LayersIcon className="h-4 w-4" />
                        <span>{namespace.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bucket Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Bucket</CardTitle>
          <CardDescription>Choose a bucket to configure its functions</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedBucketId} onValueChange={setSelectedBucketId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select a bucket to configure" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingBuckets ? (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Loading buckets...</span>
                  </div>
                </SelectItem>
              ) : buckets.length === 0 ? (
                <SelectItem value="no-buckets" disabled>
                  <div className="flex items-center space-x-2">
                    <FolderIcon className="w-4 h-4" />
                    <span>
                      No buckets available
                      {selectedNamespaceId && ` in ${namespaces.find(n => n.id === selectedNamespaceId)?.name || 'this namespace'}`}
                    </span>
                  </div>
                </SelectItem>
              ) : (
                <>
                  <div className="px-2 py-1.5 text-xs text-slate-500 border-b">
                    {buckets.length} bucket{buckets.length !== 1 ? 's' : ''} available
                    {selectedNamespaceId && ` in ${namespaces.find(n => n.id === selectedNamespaceId)?.name || 'this namespace'}`}
                  </div>
                  {buckets.map((bucket) => (
                    <SelectItem key={bucket.id} value={bucket.id}>
                      <div className="flex items-center space-x-2">
                        <FolderIcon className="w-4 h-4" />
                        <span>{bucket.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedBucketId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* Available Functions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Functions</CardTitle>
              <CardDescription>Click to add functions to {selectedBucket?.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingFunctions ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-slate-500 mt-2">Loading available functions...</p>
                </div>
              ) : availableFunctionsData.length === 0 ? (
                <div className="text-center py-8">
                  <SettingsIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm text-slate-500">No functions available</p>
                </div>
              ) : (
                availableFunctionsData.map((func) => {
                  const isSelected = isFunctionSelected(func.functionType);
                  return (
                    <div
                      key={func.functionId}
                      className={`p-3 border rounded-lg transition-colors ${
                        isSelected 
                          ? 'bg-green-50 border-green-200 cursor-not-allowed opacity-60' 
                          : 'hover:bg-slate-50 cursor-pointer'
                      }`}
                      onClick={() => !isSelected && addFunctionToBucket(func.functionId)}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="text-2xl">
                          {(() => {
                            const iconMap: Record<string, string> = {
                              'SIZE_LIMIT': '⚖️',
                              'EXTENSION_VALIDATOR': '📄',
                              'CONTENT_VALIDATOR': '✅',
                              'NAME_VALIDATOR': '🛡️',
                            };
                            return iconMap[func.functionType] || '⚙️';
                          })()}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${isSelected ? 'text-green-700' : ''}`}>
                            {func.functionName}
                          </p>
                          <p className={`text-xs ${isSelected ? 'text-green-600' : 'text-slate-500'}`}>
                            {isSelected ? 'Already added to this bucket' : func.description}
                          </p>
                        </div>
                        {isSelected ? (
                          <div className="flex items-center space-x-1">
                            <CheckCircleIcon className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">Added</span>
                          </div>
                        ) : (
                          <PlusIcon className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Configured Functions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Configured Functions</CardTitle>
                  <CardDescription>Functions for {selectedBucket?.name}</CardDescription>
                </div>
                <Button 
                  onClick={saveConfiguration}
                  disabled={currentConfigurations.length === 0 || addBucketFunctionsMutation.isPending}
                  variant={lastSavedBucket === selectedBucketId ? "outline" : "default"}
                  className={lastSavedBucket === selectedBucketId ? "border-green-500 text-green-700 hover:bg-green-50" : ""}
                >
                  {addBucketFunctionsMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : lastSavedBucket === selectedBucketId ? (
                    <>
                      <CheckCircleIcon className="w-4 h-4 mr-2 text-green-600" />
                      Saved
                    </>
                  ) : (
                    'Save Configuration'
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingBucketDetails ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-slate-500 mt-2">Loading bucket functions...</p>
                </div>
              ) : currentConfigurations.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <SettingsIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>No functions configured for this bucket</p>
                  <p className="text-sm">Add functions from the left panel</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentConfigurations.map((config, index) => {
                    const func = availableFunctionsData.find(f => f.functionType === config.type);
                    if (!func) return null;

                    return (
                      <ConfiguredFunction
                        key={`${config.type}-${index}`}
                        function={func}
                        configuration={config.properties}
                        onUpdate={(newConfig) => updateFunctionConfiguration(index, { ...config, properties: newConfig })}
                        onRemove={() => removeFunctionFromBucket(index)}
                        onReorder={(direction) => reorderFunction(index, direction)}
                        canMoveUp={index > 0}
                        canMoveDown={index < currentConfigurations.length - 1}
                      />
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Functions;
