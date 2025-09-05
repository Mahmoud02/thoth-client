
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderIcon, FileIcon, UsersIcon, HardDriveIcon } from 'lucide-react';
import Breadcrumbs from '@/components/Layout/Breadcrumbs';
import APIStatus from '@/components/Debug/APIStatus';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'My Buckets', value: '12', icon: FolderIcon, color: 'text-blue-600' },
    { label: 'Total Files', value: '1,234', icon: FileIcon, color: 'text-green-600' },
    { label: 'Storage Used', value: '2.4 GB', icon: HardDriveIcon, color: 'text-purple-600' },
    ...(user?.role !== 'user' ? [{ label: 'Total Users', value: '45', icon: UsersIcon, color: 'text-orange-600' }] : []),
  ];

  const recentActivity = [
    { action: 'Uploaded file', item: 'document.pdf', time: '2 minutes ago' },
    { action: 'Created bucket', item: 'project-files', time: '1 hour ago' },
    { action: 'AI Analysis', item: 'report.docx', time: '3 hours ago' },
    { action: 'Shared bucket', item: 'media-assets', time: '1 day ago' },
  ];

  return (
    <div className="space-y-6 w-full">
      <Breadcrumbs />
      
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {user?.name}
        </h1>
        <p className="text-slate-600 mt-2">
          Here's what's happening with your files and storage
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and file operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-slate-500">
                      {activity.item} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                <h3 className="font-medium text-blue-900">Create New Bucket</h3>
                <p className="text-sm text-blue-700">Organize your files in a new container</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                <h3 className="font-medium text-green-900">Upload Files</h3>
                <p className="text-sm text-green-700">Add new files to your buckets</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
                <h3 className="font-medium text-purple-900">AI File Analysis</h3>
                <p className="text-sm text-purple-700">Ask questions about your documents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <APIStatus />
      </div>
    </div>
  );
};

export default Dashboard;
