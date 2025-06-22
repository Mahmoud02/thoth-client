
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  FolderIcon, 
  UploadIcon, 
  UsersIcon, 
  BarChart3Icon,
  SettingsIcon,
  LogOutIcon,
  DatabaseIcon
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const getNavItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: DatabaseIcon },
      { path: '/buckets', label: 'Buckets', icon: FolderIcon },
      { path: '/upload', label: 'Upload Files', icon: UploadIcon },
      { path: '/profile', label: 'Profile', icon: SettingsIcon },
    ];

    if (user?.role === 'admin' || user?.role === 'super_admin') {
      baseItems.splice(-1, 0, { path: '/users', label: 'User Management', icon: UsersIcon });
      baseItems.splice(-1, 0, { path: '/analytics', label: 'Analytics', icon: BarChart3Icon });
    }

    return baseItems;
  };

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-blue-400">CloudStore</h1>
        <p className="text-sm text-slate-400 mt-1">File Storage Platform</p>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {getNavItems().map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold">
              {user?.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role.replace('_', ' ')}</p>
          </div>
        </div>
        
        <Separator className="bg-slate-700 mb-4" />
        
        <Button
          onClick={logout}
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <LogOutIcon size={16} className="mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
