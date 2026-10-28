import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { AuthPage } from './pages/AuthPage';
import { AddPropertyPage } from './pages/AddPropertyPage';
import { SavedPropertiesPage } from './pages/SavedPropertiesPage';
import { TenantDashboard } from './pages/TenantDashboard';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const NotificationToast: React.FC = () => {
  const { notification } = useAuth();
  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-emerald-200 bg-emerald-50/95 text-emerald-900';
      case 'error':
        return 'border-red-200 bg-red-50/95 text-red-900';
      default:
        return 'border-blue-200 bg-blue-50/95 text-blue-900';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm transition-all duration-300">
      <div
        className={`flex items-center gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-sm text-xs font-semibold ${getBorderColor()}`}
      >
        {getIcon()}
        <span className="flex-1">{notification.message}</span>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#20283B] selection:bg-[#4169E1] selection:text-white font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/properties/:id" element={<PropertyDetailPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/list-property" element={<AddPropertyPage />} />
              <Route path="/saved" element={<SavedPropertiesPage />} />
              <Route path="/dashboard/tenant" element={<TenantDashboard />} />
              <Route path="/dashboard/owner" element={<OwnerDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <NotificationToast />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
