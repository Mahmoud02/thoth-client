
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUpIcon, UsersIcon, FolderIcon, HardDriveIcon, ActivityIcon } from 'lucide-react';

const Analytics = () => {
  // Mock data for charts
  const storageData = [
    { month: 'Jan', storage: 120 },
    { month: 'Feb', storage: 180 },
    { month: 'Mar', storage: 250 },
    { month: 'Apr', storage: 320 },
    { month: 'May', storage: 390 },
    { month: 'Jun', storage: 480 },
  ];

  const userActivityData = [
    { day: 'Mon', uploads: 45, downloads: 120 },
    { day: 'Tue', uploads: 52, downloads: 98 },
    { day: 'Wed', uploads: 48, downloads: 140 },
    { day: 'Thu', uploads: 61, downloads: 180 },
    { day: 'Fri', uploads: 55, downloads: 165 },
    { day: 'Sat', uploads: 35, downloads: 95 },
    { day: 'Sun', uploads: 28, downloads: 78 },
  ];

  const fileTypeData = [
    { name: 'Documents', value: 35, color: '#3B82F6' },
    { name: 'Images', value: 25, color: '#10B981' },
    { name: 'Videos', value: 20, color: '#F59E0B' },
    { name: 'Archives', value: 12, color: '#EF4444' },
    { name: 'Other', value: 8, color: '#8B5CF6' },
  ];

  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Buckets',
      value: '456',
      change: '+8%',
      icon: FolderIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Storage Used',
      value: '2.4 TB',
      change: '+15%',
      icon: HardDriveIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Files',
      value: '89,234',
      change: '+22%',
      icon: ActivityIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
        <p className="text-slate-600 mt-2">System statistics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUpIcon className="h-3 w-3 mr-1" />
                {stat.change} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Storage Usage Over Time</CardTitle>
            <CardDescription>Monthly storage consumption in GB</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={storageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="storage" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>File Types Distribution</CardTitle>
            <CardDescription>Breakdown of files by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fileTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {fileTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
          <CardDescription>Daily uploads and downloads activity</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="uploads" fill="#3B82F6" name="Uploads" />
              <Bar dataKey="downloads" fill="#10B981" name="Downloads" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
