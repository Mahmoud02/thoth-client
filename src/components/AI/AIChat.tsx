
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SendIcon, BotIcon, UserIcon, FileIcon, FolderIcon } from 'lucide-react';
import Breadcrumbs from '@/components/Layout/Breadcrumbs';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
  fileContext?: string;
}

const AIChat = () => {
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

  const mockBuckets = [
    { id: '1', name: 'project-documents', fileCount: 24 },
    { id: '2', name: 'media-assets', fileCount: 156 },
    { id: '3', name: 'backup-files', fileCount: 8 },
  ];

  const mockFiles: { [key: string]: Array<{ id: string; name: string; type: string }> } = {
    '1': [
      { id: '1', name: 'project-proposal.pdf', type: 'PDF Document' },
      { id: '2', name: 'requirements.docx', type: 'Word Document' },
      { id: '3', name: 'budget.xlsx', type: 'Excel Spreadsheet' },
    ],
    '2': [
      { id: '4', name: 'logo.png', type: 'Image' },
      { id: '5', name: 'video-demo.mp4', type: 'Video' },
      { id: '6', name: 'banner.jpg', type: 'Image' },
    ],
    '3': [
      { id: '7', name: 'database-backup.sql', type: 'SQL File' },
      { id: '8', name: 'config-backup.json', type: 'JSON File' },
    ],
  };

  const currentFiles = selectedBucket ? mockFiles[selectedBucket] || [] : [];

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedFile) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date(),
      fileContext: selectedFile,
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        message: `Based on your file "${selectedFile}", I can see that ${inputMessage.toLowerCase().includes('summary') ? 'this document contains important information about project milestones and budget allocations. The key points include quarterly targets and resource planning details.' : 'the content relates to your query. I\'ve analyzed the document structure and can provide specific insights about the data patterns and key information contained within.'}`,
        timestamp: new Date(),
        fileContext: selectedFile,
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);

    setInputMessage('');
  };

  const handleBucketChange = (bucketId: string) => {
    setSelectedBucket(bucketId);
    setSelectedFile(''); // Reset file selection when bucket changes
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      
      <div>
        <h1 className="text-3xl font-bold text-slate-900">AI File Analysis</h1>
        <p className="text-slate-600 mt-2">Ask questions about your uploaded files</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                  {mockBuckets.map((bucket) => (
                    <SelectItem key={bucket.id} value={bucket.id}>
                      <div className="flex items-center space-x-2">
                        <FolderIcon className="w-4 h-4 text-blue-600" />
                        <span>{bucket.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {bucket.fileCount} files
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
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {currentFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedFile === file.name
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setSelectedFile(file.name)}
                    >
                      <div className="flex items-center space-x-2">
                        <FileIcon className="w-4 h-4 text-slate-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                          <p className="text-xs text-slate-500">{file.type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
              <Button onClick={handleSendMessage} disabled={!selectedFile || !inputMessage.trim()}>
                <SendIcon className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIChat;
