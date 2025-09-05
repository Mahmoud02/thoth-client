import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SendIcon, BotIcon, UserIcon, FileIcon, FolderIcon, Loader2 } from 'lucide-react';
import { useListObjects, useQueryBucketAI, useListBuckets, useAPIError } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Bucket, ObjectMetadata } from '@/types';
import Breadcrumbs from '@/components/Layout/Breadcrumbs';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
  fileContext?: string;
}

const AIChat = () => {
  const { toast } = useToast();
  const { handleError } = useAPIError();
  const queryBucketAI = useQueryBucketAI();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      message: 'Hello! I can help you analyze your uploaded files. Select a bucket and file to get started.',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedBucket, setSelectedBucket] = useState('');
  const [selectedFile, setSelectedFile] = useState('');

  // Get buckets from API
  const { data: buckets = [], isLoading: isLoadingBuckets } = useListBuckets(1); // Default namespace ID

  // Get files from API when bucket is selected
  const { data: objects, isLoading: isLoadingObjects } = useListObjects(
    selectedBucket, 
    !!selectedBucket
  );

  const currentFiles = objects || [];

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedFile) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),  
      type: 'user',
      message: inputMessage,
      timestamp: new Date(),
      fileContext: selectedFile,
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await queryBucketAI.mutateAsync({
        query: inputMessage,
        context: `File: ${selectedFile} in bucket: ${selectedBucket}`
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        message: response.response,
        timestamp: new Date(),
        fileContext: selectedFile,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const apiError = handleError(error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        message: `Sorry, I encountered an error: ${apiError.message}`,
        timestamp: new Date(),
        fileContext: selectedFile,
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: apiError.message,
        variant: "destructive"
      });
    }

    setInputMessage('');
  };

  const handleBucketChange = (bucketName: string) => {
    setSelectedBucket(bucketName);
    setSelectedFile(''); // Reset file selection when bucket changes
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
            <CardTitle className="text-lg">Select Files</CardTitle>
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
                            <p className="text-xs text-slate-500">{file.contentType}</p>
                          </div>
                        </div>
                      </div>
                    ))}
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
              {selectedFile && (
                <Badge variant="secondary" className="ml-auto">
                  Analyzing: {selectedFile}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-y-auto mb-4 space-y-4 border rounded-lg p-4 bg-slate-50">
              {messages.map((message) => (
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
              ))}
            </div>

            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={selectedFile ? "Ask a question about the selected file..." : "Select a file first"}
                disabled={!selectedFile}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!selectedFile || !inputMessage.trim() || queryBucketAI.isPending}
              >
                {queryBucketAI.isPending ? (
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
