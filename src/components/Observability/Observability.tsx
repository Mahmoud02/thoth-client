
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  CpuIcon, 
  MemoryStickIcon, 
  HardDriveIcon, 
  NetworkIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshCwIcon,
  ActivityIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Breadcrumbs from '@/components/Layout/Breadcrumbs';

const Observability = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 65,
    memory: 78,
    storage: 45,
    network: 23
  });

  const [performanceData] = useState([
    { time: '00:00', cpu: 45, memory: 60, requests: 120 },
    { time: '00:05', cpu: 52, memory: 65, requests: 150 },
    { time: '00:10', cpu: 48, memory: 62, requests: 180 },
    { time: '00:15', cpu: 65, memory: 78, requests: 200 },
    { time: '00:20', cpu: 58, memory: 70, requests: 165 },
    { time: '00:25', cpu: 72, memory: 82, requests: 220 },
  ]);

  const [storageBreakdown] = useState([
    { name: 'Documents', value: 1200, color: '#3b82f6' },
    { name: 'Images', value: 800, color: '#10b981' },
    { name: 'Videos', value: 2100, color: '#f59e0b' },
    { name: 'Other', value: 400, color: '#ef4444' },
  ]);

  const [recentErrors] = useState([
    { id: 1, message: 'Connection timeout to bucket-1', timestamp: '2 min ago', severity: 'destructive' as const },
    { id: 2, message: 'High memory usage detected', timestamp: '5 min ago', severity: 'secondary' as const },
    { id: 3, message: 'Function execution failed', timestamp: '12 min ago', severity: 'destructive' as const },
  ]);

  const [activeRequests] = useState([
    { endpoint: '/api/buckets', count: 45, avgTime: '120ms' },
    { endpoint: '/api/functions', count: 23, avgTime: '85ms' },
    { endpoint: '/api/upload', count: 12, avgTime: '340ms' },
    { endpoint: '/api/auth', count: 8, avgTime: '95ms' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 8)),
        storage: Math.max(0, Math.min(100, prev.storage + (Math.random() - 0.5) * 3)),
        network: Math.max(0, Math.min(100, prev.network + (Math.random() - 0.5) * 15))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusColor = (value: number) => {
    if (value < 50) return 'text-green-600';
    if (value < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (value: number) => {
    if (value < 50) return 'bg-green-500';
    if (value < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <Breadcrumbs />
        <Button onClick={handleRefresh} disabled={isRefreshing} size="sm">
          <RefreshCwIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">System Observability</h1>
        <p className="text-slate-600 mt-2">Real-time monitoring and system health</p>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <CpuIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2 text-slate-900">{systemMetrics.cpu.toFixed(1)}%</div>
            <Progress value={systemMetrics.cpu} className="h-2" />
            <p className={`text-xs mt-2 ${getStatusColor(systemMetrics.cpu)}`}>
              {systemMetrics.cpu < 50 ? 'Normal' : systemMetrics.cpu < 80 ? 'Moderate' : 'High'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStickIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2 text-slate-900">{systemMetrics.memory.toFixed(1)}%</div>
            <Progress value={systemMetrics.memory} className="h-2" />
            <p className={`text-xs mt-2 ${getStatusColor(systemMetrics.memory)}`}>
              {systemMetrics.memory < 50 ? 'Normal' : systemMetrics.memory < 80 ? 'Moderate' : 'High'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <HardDriveIcon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2 text-slate-900">{systemMetrics.storage.toFixed(1)}%</div>
            <Progress value={systemMetrics.storage} className="h-2" />
            <p className={`text-xs mt-2 ${getStatusColor(systemMetrics.storage)}`}>
              {systemMetrics.storage < 50 ? 'Normal' : systemMetrics.storage < 80 ? 'Moderate' : 'High'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network I/O</CardTitle>
            <NetworkIcon className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2 text-slate-900">{systemMetrics.network.toFixed(1)}%</div>
            <Progress value={systemMetrics.network} className="h-2" />
            <p className={`text-xs mt-2 ${getStatusColor(systemMetrics.network)}`}>
              {systemMetrics.network < 50 ? 'Normal' : systemMetrics.network < 80 ? 'Moderate' : 'High'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Performance Over Time</CardTitle>
              <CardDescription>CPU and Memory usage trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2} name="Memory %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Storage Breakdown</CardTitle>
              <CardDescription>Distribution of file types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={storageBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active API Requests</CardTitle>
              <CardDescription>Current request load and response times</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeRequests.map((request, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{request.endpoint}</p>
                      <p className="text-sm text-slate-600">Average response: {request.avgTime}</p>
                    </div>
                    <Badge variant="secondary">{request.count} active</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
              <CardDescription>System errors and warnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentErrors.map((error) => (
                  <div key={error.id} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                    {error.severity === 'destructive' ? (
                      <XCircleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                    ) : (
                      <AlertTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{error.message}</p>
                      <p className="text-sm text-slate-600">{error.timestamp}</p>
                    </div>
                    <Badge variant={error.severity}>{error.severity === 'destructive' ? 'Error' : 'Warning'}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Observability;
