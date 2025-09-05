import React, { useState } from 'react';
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
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      message: 'Hello! I can help you analyze your uploaded files. Select a bucket and choose whether to ask about a specific file or all ingested files.',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedBucket, setSelectedBucket] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [queryScope, setQueryScope] = useState<'specific' | 'all'>('specific');

  // Get buckets from API
  const { data: buckets = [], isLoading: isLoadingBuckets } = useListBuckets(1); // Default namespace ID

  // Get files from API when bucket is selected
  const { data: objects, isLoading: isLoadingObjects } = useListObjects(
    selectedBucket, 
    !!selectedBucket
  );

  const currentFiles = objects || [];
  const ingestedFiles = currentFiles.filter(file => file.isIngested);

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
        message: responseText,
        timestamp: new Date(),
        fileContext: queryScope === 'specific' ? selectedFile : undefined,
        queryScope: queryScope,
      };
      setMessages(prev => [...prev, aiMessage]);
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

    try {
      await ingestDocumentMutation.mutateAsync({
        bucket: selectedBucket,
        filename: fileName
      });
      
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
    }
  };

  const handleBucketChange = (bucketName: string) => {
    setSelectedBucket(bucketName);
    setSelectedFile(''); // Reset file selection when bucket changes
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
                              {file.isIngested ? (
                                <div className="flex items-center space-x-1 text-green-600">
                                  <CheckCircleIcon className="w-3 h-3" />
                                  <span className="text-xs">AI Ready</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1 text-gray-500">
                                  <BrainIcon className="w-3 h-3" />
                                  <span className="text-xs">Not ingested</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {!file.isIngested && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIngestFile(file.objectName);
                              }}
                              disabled={ingestDocumentMutation.isPending}
                              className="ml-2"
                            >
                              {ingestDocumentMutation.isPending ? (
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
                            file.isIngested 
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
                                {file.isIngested ? (
                                  <div className="flex items-center space-x-1 text-green-600">
                                    <CheckCircleIcon className="w-3 h-3" />
                                    <span className="text-xs">AI Ready</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-1 text-gray-500">
                                    <BrainIcon className="w-3 h-3" />
                                    <span className="text-xs">Not ingested</span>
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

        <Card className="lg:col-span-3">
          <CardHeader>
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
          <CardContent>
            <div className="h-96 overflow-y-auto mb-4 space-y-4 border rounded-lg p-4 bg-slate-50">
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
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-200'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
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
              )) : (
                <div className="text-center py-8 text-slate-500">
                  <BotIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs text-slate-400 mt-1">Start a conversation by asking a question</p>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
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
