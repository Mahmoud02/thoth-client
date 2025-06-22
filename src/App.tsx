
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/components/Auth/LoginForm";
import Sidebar from "@/components/Layout/Sidebar";
import Dashboard from "@/components/Dashboard/Dashboard";
import BucketList from "@/components/Buckets/BucketList";
import FileUpload from "@/components/Upload/FileUpload";
import AIChat from "@/components/AI/AIChat";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <LoginForm />;
  }
  
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-slate-50 min-h-screen">
        {children}
      </main>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/buckets" element={
        <ProtectedRoute>
          <BucketList />
        </ProtectedRoute>
      } />
      <Route path="/upload" element={
        <ProtectedRoute>
          <FileUpload />
        </ProtectedRoute>
      } />
      <Route path="/ai-chat" element={
        <ProtectedRoute>
          <AIChat />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold">Profile Management</h1>
            <p className="text-slate-600 mt-2">Update your profile information</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute>
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-slate-600 mt-2">Manage system users</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-slate-600 mt-2">View system statistics and insights</p>
          </div>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
