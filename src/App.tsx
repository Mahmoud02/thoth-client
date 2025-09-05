
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<Index />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/buckets" element={<ProtectedRoute><Layout><BucketList /></Layout></ProtectedRoute>} />
      <Route path="/buckets/:bucketId" element={<ProtectedRoute><Layout><BucketDetails /></Layout></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/functions" element={<ProtectedRoute><Layout><Functions /></Layout></ProtectedRoute>} />
      <Route path="/observability" element={<ProtectedRoute><Layout><Observability /></Layout></ProtectedRoute>} />
      <Route path="/ai-chat" element={<ProtectedRoute><Layout><AIChat /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><Layout><UserManagement /></Layout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
