import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { ToastProvider } from './context/ToastContext.js';
import { Navbar } from './components/Navbar.js';
import { LoginView } from './views/LoginView.js';
import { SignupView } from './views/SignupView.js';
import { AdminDashboard } from './views/AdminDashboard.js';
import { WardenDashboard } from './views/WardenDashboard.js';
import { StudentDashboard } from './views/StudentDashboard.js';

const MainContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Loading HostelSphere...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isAuthenticated || !user ? (
          authView === 'login' ? (
            <LoginView onSwitchToSignup={() => setAuthView('signup')} />
          ) : (
            <SignupView onBackToLogin={() => setAuthView('login')} />
          )
        ) : user.role === 'ADMIN' ? (
          <AdminDashboard />
        ) : user.role === 'WARDEN' ? (
          <WardenDashboard />
        ) : (
          <StudentDashboard />
        )}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 bg-white/50 dark:bg-slate-950/50 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>HOSTELSPHERE &bull; Collegiate Residence & Hall Management SaaS</span>
          <span className="text-[11px] text-slate-400">
            Strict Multi-Role Access Control &bull; Transactional Allocations &bull; Verified Receipts
          </span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MainContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
