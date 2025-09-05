import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircleIcon, XCircleIcon, Loader2, RefreshCwIcon } from 'lucide-react';
import { API_CONFIG } from '@/config/api';

interface APIStatusProps {
  className?: string;
}

const APIStatus: React.FC<APIStatusProps> = ({ className }) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string>('');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkAPIStatus = async () => {
    setStatus('checking');
    setError('');
    
    try {
      // Try to connect to the API
      const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setStatus('connected');
        setError('');
      } else {
        setStatus('error');
        setError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      setStatus('error');
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error occurred');
      }
    }
    
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkAPIStatus();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
      case 'connected':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircleIcon className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'checking':
        return <Badge variant="secondary">Checking...</Badge>;
      case 'connected':
        return <Badge variant="default" className="bg-green-600">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getStatusIcon()}
          <span>API Status</span>
        </CardTitle>
        <CardDescription>
          Backend connectivity status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          {getStatusBadge()}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">API URL:</span>
          <code className="text-xs bg-slate-100 px-2 py-1 rounded">
            {API_CONFIG.BASE_URL}
          </code>
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">Error:</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}
        
        {lastChecked && (
          <div className="text-xs text-slate-500">
            Last checked: {lastChecked.toLocaleTimeString()}
          </div>
        )}
        
        <Button 
          onClick={checkAPIStatus} 
          variant="outline" 
          size="sm" 
          disabled={status === 'checking'}
          className="w-full"
        >
          <RefreshCwIcon className="w-4 h-4 mr-2" />
          Check Again
        </Button>
      </CardContent>
    </Card>
  );
};

export default APIStatus;
