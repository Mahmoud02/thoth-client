import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { SendIcon, BotIcon, UserIcon, FileIcon, FolderIcon, Loader2, BrainIcon, CheckCircleIcon, DatabaseIcon } from 'lucide-react';
import { useListObjects, useQueryRAG, useListBuckets, useIngestDocument, useAPIError } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Bucket, ObjectMetadata } from '@/types';
import Breadcrumbs from '@/components/Layout/Breadcrumbs';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
  fileContext?: string;
  queryScope?: 'specific' | 'all';
}

const AIChat = () => {
  const { toast } = useToast();
  const { handleError } = useAPIError();
  const queryRAG = useQueryRAG();
  const ingestDocumentMutation = useIngestDocument();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedBucket, setSelectedBucket] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [queryScope, setQueryScope] = useState<'specific' | 'all'>('specific');
  const [contextOverview, setContextOverview] = useState<string | null>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [ingestingFiles, setIngestingFiles] = useState<Set<string>>(new Set());
  const [successfullyIngestedFiles, setSuccessfullyIngestedFiles] = useState<Set<string>>(new Set());

  // Get buckets from API
  const { data: buckets = [], isLoading: isLoadingBuckets } = useListBuckets(1); // Default namespace ID

  // Get files from API when bucket is selected
  const { data: objects, isLoading: isLoadingObjects } = useListObjects(
    selectedBucket, 
    !!selectedBucket
  );

  const currentFiles = objects || [];
  
  // Helper function to check if a file is ingested (either from API or locally marked)
  const isFileIngested = (file: ObjectMetadata) => {
    return file.ingested || successfullyIngestedFiles.has(file.objectName);
  };
  
  const ingestedFiles = currentFiles.filter(file => isFileIngested(file));

  // Cleanup streaming on unmount
  useEffect(() => {
    return () => {
      setIsStreaming(false);
      setStreamingMessage('');
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedBucket) return;

    // For specific file queries, check if file is selected
    if (queryScope === 'specific') {
      if (!selectedFile) {
        toast({
          title: "No File Selected",
          description: "Please select a specific file to ask questions about.",
          variant: "destructive"
        });
        return;
      }
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),  
      type: 'user',
      message: inputMessage,
      timestamp: new Date(),
      fileContext: queryScope === 'specific' ? selectedFile : undefined,
      queryScope: queryScope,
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      console.log('Sending RAG query:', { q: inputMessage, bucket: selectedBucket });
      
      const response = await queryRAG.mutateAsync({
        q: inputMessage,
        bucket: selectedBucket
      });

      console.log('RAG response received:', response, 'Type:', typeof response);

      // Handle JSON response structure: { "response": "string" }
      const responseText = response.response || 'No response received';

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        message: '', // Start with empty message for streaming
        timestamp: new Date(),
        fileContext: queryScope === 'specific' ? selectedFile : undefined,
        queryScope: queryScope,
      };
      
      // Add the message first, then start streaming
      setMessages(prev => [...prev, aiMessage]);
      
      // Start streaming the response
      setTimeout(() => {
        streamText(responseText, aiMessage.id);
      }, 100);
    } catch (error) {
      const errorMessage = handleError(error);
      const errorChatMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        message: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date(),
        fileContext: queryScope === 'specific' ? selectedFile : undefined,
        queryScope: queryScope,
      };
      setMessages(prev => [...prev, errorChatMessage]);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }

    setInputMessage('');
  };

  const handleIngestFile = async (fileName: string) => {
    if (!selectedBucket) return;

    // Add file to ingesting set
    setIngestingFiles(prev => new Set([...prev, fileName]));

    try {
      await ingestDocumentMutation.mutateAsync({
        bucket: selectedBucket,
        filename: fileName
      });
      
      // Manually update the file status to AI Ready
      setSuccessfullyIngestedFiles(prev => new Set([...prev, fileName]));
      
      toast({
        title: "Success",
        description: "File ingested successfully and is now ready for AI queries",
      });
    } catch (error) {
      const errorMessage = handleError(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      // Remove file from ingesting set
      setIngestingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileName);
        return newSet;
      });
    }
  };

  const fetchContextOverview = async (bucketName: string) => {
    setIsLoadingContext(true);
    try {
      const response = await queryRAG.mutateAsync({
        q: "What questions can I ask about the files in this bucket? Please provide an overview of the context and suggest some example questions I can ask.",
        bucket: bucketName
      });
      
      setContextOverview(response.response);
      
      // Add the context overview as a pinned message at the top
      const contextMessage: ChatMessage = {
        id: 'context-overview',
        type: 'ai',
        message: '', // Start with empty message for streaming
        timestamp: new Date(),
        queryScope: 'all',
      };
      
      setMessages(prev => [contextMessage, ...prev]);
      
      // Start streaming the context overview
      setTimeout(() => {
        streamText(response.response, 'context-overview');
      }, 200);
      
    } catch (error) {
      console.error('Failed to fetch context overview:', error);
      const errorMessage = handleError(error);
      setContextOverview(`Unable to load context overview: ${errorMessage}`);
    } finally {
      setIsLoadingContext(false);
    }
  };

  const handleBucketChange = (bucketName: string) => {
    setSelectedBucket(bucketName);
    setSelectedFile(''); // Reset file selection when bucket changes
    setContextOverview(null); // Clear previous context
    setMessages([]); // Clear previous messages
    
    // Fetch context overview for the new bucket
    if (bucketName) {
      fetchContextOverview(bucketName);
    }
  };

  const streamText = (text: string, messageId: string) => {
    setIsStreaming(true);
    setStreamingMessage('');
    
    const words = text.split(' ');
    let currentIndex = 0;
    
    const streamInterval = setInterval(() => {
      if (currentIndex < words.length) {
        setStreamingMessage(prev => prev + (currentIndex > 0 ? ' ' : '') + words[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(streamInterval);
        setIsStreaming(false);
        
        // Update the actual message with the complete text
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, message: text }
            : msg
        ));
        setStreamingMessage('');
      }
    }, 50); // 50ms delay between words (adjustable speed)
  };

  const handleQueryScopeChange = (scope: 'specific' | 'all') => {
    setQueryScope(scope);
    if (scope === 'all') {
      setSelectedFile(''); // Clear file selection when switching to all files
    }
  };

  return (
    <div className="space-y-6 w-full">
      <Breadcrumbs />
      
      <div>
        <h1 className="text-3xl font-bold text-slate-900">AI File Analysis</h1>
        <p className="text-slate-600 mt-2">Ask questions about your uploaded files</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Query Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Choose Bucket</label>
              <Select value={selectedBucket} onValueChange={handleBucketChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a bucket" />
                </SelectTrigger>
                <SelectContent>
                  {buckets.map((bucket) => (
                    <SelectItem key={bucket.id} value={bucket.name}>
                      <div className="flex items-center space-x-2">
                        <FolderIcon className="w-4 h-4 text-blue-600" />
                        <span>{bucket.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {currentFiles.length} files
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedBucket && (
              <div>
                <label className="text-sm font-medium mb-2 block">Query Scope</label>
                <RadioGroup value={queryScope} onValueChange={handleQueryScopeChange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="specific" id="specific" />
                    <Label htmlFor="specific" className="flex items-center space-x-2">
                      <FileIcon className="w-4 h-4" />
                      <span>Specific File</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="flex items-center space-x-2">
                      <DatabaseIcon className="w-4 h-4" />
                      <span>All Files</span>
                      <Badge variant="outline" className="ml-2">
                        {currentFiles.length} total
                      </Badge>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {selectedBucket && queryScope === 'specific' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Choose File</label>
                {isLoadingObjects ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-sm text-slate-600">Loading files...</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {currentFiles.map((file) => (
                      <div
                        key={file.objectName}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedFile === file.objectName
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        onClick={() => setSelectedFile(file.objectName)}
                      >
                        <div className="flex items-center space-x-2">
                          <FileIcon className="w-4 h-4 text-slate-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{file.objectName}</p>
                            <div className="flex items-center space-x-2">
                              <p className="text-xs text-slate-500">{file.contentType}</p>
                              {isFileIngested(file) ? (
                                <div className="flex items-center space-x-1 text-green-600">
                                  <CheckCircleIcon className="w-3 h-3" />
                                  <span className="text-xs">AI Ready</span>
                                </div>
                              ) : ingestingFiles.has(file.objectName) ? (
                                <div className="flex items-center space-x-1 text-blue-600">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span className="text-xs">Processing...</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1 text-gray-500">
                                  <BrainIcon className="w-3 h-3" />
                                  <span className="text-xs">Not Ready</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {!isFileIngested(file) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIngestFile(file.objectName);
                              }}
                              disabled={ingestingFiles.has(file.objectName)}
                              className="ml-2"
                            >
                              {ingestingFiles.has(file.objectName) ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <BrainIcon className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedBucket && queryScope === 'all' && (
              <div>
                <label className="text-sm font-medium mb-2 block">All Files in Bucket</label>
                {isLoadingObjects ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-sm text-slate-600">Loading files...</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {currentFiles.length > 0 ? (
                      currentFiles.map((file) => (
                        <div
                          key={file.objectName}
                          className={`p-3 rounded-lg border ${
                            file.ingested 
                              ? 'border-green-200 bg-green-50' 
                              : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <FileIcon className="w-4 h-4 text-slate-600" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{file.objectName}</p>
                              <div className="flex items-center space-x-2">
                                <p className="text-xs text-slate-500">{file.contentType}</p>
                                {isFileIngested(file) ? (
                                  <div className="flex items-center space-x-1 text-green-600">
                                    <CheckCircleIcon className="w-3 h-3" />
                                    <span className="text-xs">AI Ready</span>
                                  </div>
                                ) : ingestingFiles.has(file.objectName) ? (
                                  <div className="flex items-center space-x-1 text-blue-600">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span className="text-xs">Processing...</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-1 text-gray-500">
                                    <BrainIcon className="w-3 h-3" />
                                    <span className="text-xs">Not Ready</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <DatabaseIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm">No files in this bucket</p>
                        <p className="text-xs text-slate-400 mt-1">Upload files to get started</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!selectedBucket && (
              <div className="text-center py-8 text-slate-500">
                <FolderIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Select a bucket to see files</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 flex flex-col h-[calc(100vh-200px)]">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center space-x-2">
              <BotIcon className="w-5 h-5 text-blue-600" />
              <span>AI Assistant</span>
              {selectedBucket && (
                <Badge variant="secondary" className="ml-auto">
                  {queryScope === 'specific' && selectedFile 
                    ? `Analyzing: ${selectedFile}`
                    : queryScope === 'all' 
                    ? `Analyzing: All Files (${currentFiles.length} total)`
                    : 'Select configuration'
                  }
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 border rounded-lg p-4 bg-slate-50">
              {isLoadingContext && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-sm text-slate-600">Loading context overview...</span>
                </div>
              )}
              
              {messages && messages.length > 0 ? messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <BotIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`w-full max-w-[80vw] sm:max-w-[60vw] md:max-w-[50vw] lg:max-w-[40vw] xl:max-w-[35vw] px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.id === 'context-overview'
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md'
                        : 'bg-white border border-slate-200'
                    }`}
                  >
                    {message.id === 'context-overview' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Context Overview</span>
                      </div>
                    )}
                    <p className={`text-sm ${message.id === 'context-overview' ? 'text-slate-800' : ''}`}>
                      {isStreaming && message.message === '' ? streamingMessage : message.message}
                      {isStreaming && message.message === '' && (
                        <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                      )}
                    </p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-slate-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.type === 'user' && (
                    <div className="w-8 h-8 bg-slate-500 rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              )) : !isLoadingContext && (
                <div className="text-center py-8 text-slate-500">
                  <BotIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs text-slate-400 mt-1">Start a conversation by asking a question</p>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  !selectedBucket 
                    ? "Select a bucket first..."
                    : queryScope === 'specific' && !selectedFile
                    ? "Select a specific file first..."
                    : queryScope === 'specific'
                    ? "Ask a question about the selected file..."
                    : "Ask a question about all files in the bucket..."
                }
                disabled={!selectedBucket || (queryScope === 'specific' && !selectedFile)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={
                  !selectedBucket || 
                  !inputMessage.trim() || 
                  queryRAG.isPending ||
                  (queryScope === 'specific' && !selectedFile)
                }
              >
                {queryRAG.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <SendIcon className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIChat;
