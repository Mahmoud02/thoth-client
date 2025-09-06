
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SidebarProvider } from './components/ui/sidebar';
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Layout from './components/Layout/Layout';
import BucketList from './components/Buckets/BucketList';
import BucketDetails from './components/Buckets/BucketDetails';
import AIChat from './pages/AIChat';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';
import Analytics from './pages/Analytics';
import Observability from './pages/Observability';
import Upload from './pages/Upload';
import Namespaces from './pages/Namespaces';
import Functions from './components/Functions/Functions';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute>
      <Layout>
        {children}
      </Layout>
    </ProtectedRoute>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<Index />} />
      <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/namespaces" element={<ProtectedLayout><Namespaces /></ProtectedLayout>} />
      <Route path="/buckets" element={<ProtectedLayout><BucketList /></ProtectedLayout>} />
      <Route path="/buckets/:bucketId" element={<ProtectedLayout><BucketDetails /></ProtectedLayout>} />
      <Route path="/upload" element={<ProtectedLayout><Upload /></ProtectedLayout>} />
      <Route path="/functions" element={<ProtectedLayout><Functions /></ProtectedLayout>} />
      <Route path="/observability" element={<ProtectedLayout><Observability /></ProtectedLayout>} />
      <Route path="/ai-chat" element={<ProtectedLayout><AIChat /></ProtectedLayout>} />
      <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
      <Route path="/users" element={<ProtectedLayout><UserManagement /></ProtectedLayout>} />
      <Route path="/analytics" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <AppRoutes />
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
