
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Index from './pages/Index';
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
import Functions from './components/Functions/Functions';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/buckets" element={<Layout><BucketList /></Layout>} />
          <Route path="/buckets/:bucketId" element={<Layout><BucketDetails /></Layout>} />
          <Route path="/functions" element={<Layout><Functions /></Layout>} />
          <Route path="/observability" element={<Layout><Observability /></Layout>} />
          <Route path="/ai-chat" element={<Layout><AIChat /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/users" element={<Layout><UserManagement /></Layout>} />
          <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
