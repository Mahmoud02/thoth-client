
import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  FolderIcon, 
  UsersIcon, 
  BarChart3Icon,
  SettingsIcon,
  LogOutIcon,
  DatabaseIcon,
  MessageSquareIcon,
  FunctionSquareIcon,
  ActivityIcon,
  UploadIcon,
  LayersIcon
} from 'lucide-react';

const AppSidebar = () => {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = state === 'collapsed';

  const handleSignOut = async () => {
    try {
      logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getNavItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: DatabaseIcon },
      { path: '/namespaces', label: 'Namespaces', icon: LayersIcon },
      { path: '/buckets', label: 'Buckets', icon: FolderIcon },
      { path: '/upload', label: 'Upload Files', icon: UploadIcon },
      { path: '/functions', label: 'Functions', icon: FunctionSquareIcon },
      { path: '/observability', label: 'Observability', icon: ActivityIcon },
      { path: '/ai-chat', label: 'AI Chat', icon: MessageSquareIcon },
      { path: '/profile', label: 'Profile', icon: SettingsIcon },
    ];

    if (user?.role === 'admin' || user?.role === 'super_admin') {
      baseItems.splice(-1, 0, { path: '/users', label: 'User Management', icon: UsersIcon });
      baseItems.splice(-1, 0, { path: '/analytics', label: 'Analytics', icon: BarChart3Icon });
    }

    return baseItems;
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CS</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-slate-900">CloudStore</h1>
              <p className="text-xs text-slate-500">File Storage Platform</p>
            </div>
          )}
        </div>
        <SidebarTrigger className="ml-auto" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {getNavItems().map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)}>
                    <NavLink to={item.path} className="flex items-center space-x-3">
                      <item.icon size={20} />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-200">
        {!collapsed && user && (
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-white">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        )}
        
        <SidebarSeparator className="mb-4" />
        
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        >
          <LogOutIcon size={16} className="mr-2" />
          {!collapsed && "Sign Out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
