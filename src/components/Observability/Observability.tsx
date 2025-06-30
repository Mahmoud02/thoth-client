
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ActivityIcon, 
  HardDriveIcon, 
  CpuIcon, 
  WifiIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshCwIcon,
  MemoryStickIcon,
  DatabaseIcon,
  UsersIcon,
  TrendingUpIcon,
  ServerIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import Breadcrumbs from '@/components/Layout/Breadcrumbs';

const Observability = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock real-time data
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 45,
    memory: 62,
    storage: 78,
    network: 23,
    uptime: '15d 4h 32m',
    requests: 1847,
    errors: 12,
    activeUsers: 156
  });

  // Mock time series data
  const performanceData = [
    { time: '00:00', cpu: 20, memory: 45, requests: 150 },
    { time: '04:00', cpu: 15, memory: 42, requests: 80 },
    { time: '08:00', cpu: 35, memory: 58, requests: 320 },
    { time: '12:00', cpu: 65, memory: 72, requests: 450 },
    { time: '16:00', cpu: 45, memory: 65, requests: 380 },
    { time: '20:00', cpu: 25, memory: 50, requests: 200 },
  ];

  const storageData = [
    { name: 'Documents', size: 2.4, color: '#3b82f6' },
    { name: 'Images', size: 5.1, color: '#10b981' },
    { name: 'Videos', size: 12.8, color: '#f59e0b' },
    { name: 'Other', size: 1.2, color: '#ef4444' },
  ];

  const errorLogs = [
    {
      id: 1,
      timestamp: '2024-01-15 14:23:15',
      level: 'error',
      message: 'File upload failed: Invalid file type',
      source: 'upload-service',
      user: 'user@example.com'
    },
    {
      id: 2,
      timestamp: '2024-01-15 14:18:42',
      level: 'warning',
      message: 'High memory usage detected',
      source: 'system-monitor',
      user: 'system'
    },
    {
      id: 3,
      timestamp: '2024-01-15 14:15:30',
      level: 'error',
      message: 'Database connection timeout',
      source: 'database',
      user: 'api-service'
    },
    {
      id: 4,
      timestamp: '2024-01-15 14:12:18',
      level: 'info',
      message: 'Backup completed successfully',
      source: 'backup-service',
      user: 'system'
    },
  ];

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate random metrics for demo
    setSystemMetrics(prev => ({
      ...prev,
      cpu: Math.floor(Math.random() * 80) + 10,
      memory: Math.floor(Math.random() * 70) + 20,
      network: Math.floor(Math.random() * 50) + 5,
      requests: prev.requests + Math.floor(Math.random() * 50),
      errors: prev.errors + Math.floor(Math.random() * 3),
    }));
    
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000); // Auto refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-500';
    if (value >= thresholds.warning) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getLogLevelBadge = (level: string) => {
    const variants = {
      error: 'destructive',
      warning: 'secondary',
      info: 'default',
    };
    return <Badge variant={variants[level as keyof typeof variants] || 'default'}>{level}</Badge>;
  };

  return (
    <div className="space-y-6 w-full">
      <Breadcrumbs />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">System Observability</h1>
          <p className="text-slate-600 mt-2">Monitor system performance, errors, and resource usage</p>
        </div>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-slate-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
          <Button 
            onClick={refreshData} 
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCwIcon className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <CpuIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.cpu}%</div>
            <Progress value={systemMetrics.cpu} className="mt-2" />
            <p className={`text-xs mt-1 ${getStatusColor(systemMetrics.cpu, { warning: 70, critical: 90 })}`}>
              {systemMetrics.cpu < 70 ? 'Normal' : systemMetrics.cpu < 90 ? 'High' : 'Critical'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStickIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.memory}%</div>
            <Progress value={systemMetrics.memory} className="mt-2" />
            <p className={`text-xs mt-1 ${getStatusColor(systemMetrics.memory, { warning: 80, critical: 95 })}`}>
              {systemMetrics.memory < 80 ? 'Normal' : systemMetrics.memory < 95 ? 'High' : 'Critical'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDriveIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.storage}%</div>
            <Progress value={systemMetrics.storage} className="mt-2" />
            <p className="text-xs text-slate-500 mt-1">21.5 GB / 27.6 GB</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.activeUsers}</div>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <TrendingUpIcon className="w-3 h-3 mr-1" />
              +12% from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="errors">Errors & Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>CPU & Memory Usage</CardTitle>
                <CardDescription>24-hour performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="cpu" stroke="#3b82f6" name="CPU %" />
                    <Line type="monotone" dataKey="memory" stroke="#10b981" name="Memory %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system health indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ServerIcon className="w-4 h-4" />
                    <span>System Uptime</span>
                  </div>
                  <Badge variant="default">{systemMetrics.uptime}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DatabaseIcon className="w-4 h-4" />
                    <span>Database Status</span>
                  </div>
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <WifiIcon className="w-4 h-4" />
                    <span>Network Status</span>
                  </div>
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ActivityIcon className="w-4 h-4" />
                    <span>Service Health</span>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <AlertTriangleIcon className="w-3 h-3 mr-1" />
                    Warning
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Storage Breakdown</CardTitle>
                <CardDescription>Storage usage by file type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={storageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value} GB`} />
                    <Bar dataKey="size" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Details</CardTitle>
                <CardDescription>Detailed storage information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {storageData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.size} GB</p>
                      <p className="text-xs text-slate-500">
                        {((item.size / 21.5) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request Activity</CardTitle>
              <CardDescription>API requests over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="requests" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{systemMetrics.requests.toLocaleString()}</div>
                <p className="text-xs text-slate-500 mt-1">Today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">99.3%</div>
                <p className="text-xs text-slate-500 mt-1">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">245ms</div>
                <p className="text-xs text-slate-500 mt-1">Last hour</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{systemMetrics.errors}</div>
                <p className="text-xs text-slate-500 mt-1">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Critical Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-800">2</div>
                <p className="text-xs text-slate-500 mt-1">Requires attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">0.65%</div>
                <p className="text-xs text-slate-500 mt-1">Of total requests</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Error Logs</CardTitle>
              <CardDescription>Latest system errors and warnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {errorLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getLogLevelBadge(log.level)}
                        <span className="text-sm font-medium">{log.source}</span>
                      </div>
                      <span className="text-xs text-slate-500">{log.timestamp}</span>
                    </div>
                    <p className="text-sm text-slate-700 mb-1">{log.message}</p>
                    <p className="text-xs text-slate-500">User: {log.user}</p>
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
