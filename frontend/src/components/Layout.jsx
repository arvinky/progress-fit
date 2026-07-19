import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import Sidebar from './Sidebar';
import { Menu, User } from 'lucide-react';

export default function Layout() {
  const { isAuthenticated, fetchMe, user, loading } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMe();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-vh h-screen bg-background">
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-indigo-650/20 border-t-indigo-600 rounded-full animate-spin"></div>
          <span className="text-sm font-semibold tracking-wide text-text-muted">Loading ProgressFit...</span>
        </div>
      </div>
    );
  }

  // Route protection
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isClientRoute = location.pathname.startsWith('/client');

  if (user) {
    if (isAdminRoute && user.role !== 'ADMIN') {
      return <Navigate to="/client" replace />;
    }
    if (isClientRoute && user.role !== 'CLIENT') {
      return <Navigate to="/admin" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row text-text">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Top Header Bar for Mobile Devices */}
      <header className="lg:hidden w-full h-16 bg-white border-b border-card-border px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-900 focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-950 flex items-center justify-center font-black text-[10px] text-white shadow-sm">
              P
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-950">
              Progress<span className="text-slate-650 font-medium">Fit</span>
            </span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-xs text-indigo-700 border border-indigo-150">
          {user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-h-screen bg-background relative overflow-y-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
