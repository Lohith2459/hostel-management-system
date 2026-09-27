import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import {
  Building2,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  GraduationCap,
  ShieldAlert,
  KeyRound,
  Check,
  Copy,
  Info
} from 'lucide-react';
import { Role } from '../types/index.js';

interface LoginViewProps {
  onSwitchToSignup: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSwitchToSignup }) => {
  const { login, quickDemoLogin, isLoading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedRole, setCopiedRole] = useState<string | null>(null);

  // Pre-configured real demo accounts that work with either 1-click or credential typing
  const demoAccounts = [
    {
      role: 'ADMIN' as Role,
      title: 'Administrator',
      email: 'admin@hostelsphere.edu',
      password: 'Password@123',
      label: 'Institution Master',
      icon: ShieldAlert,
      color: 'text-indigo-500',
      badge: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
    },
    {
      role: 'WARDEN' as Role,
      title: 'Hostel Warden',
      email: 'warden.sharma@hostelsphere.edu',
      password: 'Password@123',
      label: 'Aryabhatta Hall',
      icon: Sparkles,
      color: 'text-cyan-500',
      badge: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800'
    },
    {
      role: 'STUDENT' as Role,
      title: 'Resident Student',
      email: 'rahul.verma@student.edu',
      password: 'Password@123',
      label: 'Room 101, Bed A',
      icon: GraduationCap,
      color: 'text-emerald-500',
      badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Please enter your email and password', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      toast('Signed in successfully!', 'success');
    } catch (err: any) {
      toast(err.message || 'Authentication failed. Please check your credentials.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInstantDemoLogin = async (role: Role) => {
    setSubmitting(true);
    try {
      await quickDemoLogin(role);
      toast(`Instant sign-in as ${role} successful!`, 'success');
    } catch (err: any) {
      toast(err.message || 'Demo login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (accEmail: string, accPass: string, roleName: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setCopiedRole(roleName);
    toast(`Populated ${roleName} credentials into the login form`, 'info');
    setTimeout(() => setCopiedRole(null), 3000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/25 mb-3">
              <Building2 className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">HOSTELSPHERE</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Collegiate Residence & Hall Management Portal
            </p>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Test / Demo Accounts
                </span>
              </div>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                1-Click or Auto-Fill
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <div
                    key={acc.role}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${acc.badge}`}>
                          {acc.title}
                        </span>
                        <Icon className={`w-3.5 h-3.5 ${acc.color}`} />
                      </div>
                      <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate mb-0.5" title={acc.email}>
                        {acc.email}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Password@123
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => fillCredentials(acc.email, acc.password, acc.title)}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-semibold flex items-center justify-center space-x-1 transition cursor-pointer"
                        title="Copy credentials into the form below"
                      >
                        {copiedRole === acc.title ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                        <span>Fill Form</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInstantDemoLogin(acc.role)}
                        disabled={submitting || isLoading}
                        className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold flex items-center justify-center space-x-1 transition shadow-xs cursor-pointer disabled:opacity-50"
                        title={`Instant log in as ${acc.title}`}
                      >
                        <span>1-Click</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
              Real User & Student Sign In
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@student.edu or registered email"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <span className="text-[10px] text-slate-400">Standard password for seed demo: Password@123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In with Real Credentials'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Student Signup Trigger */}
          <div className="mt-6 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-center text-xs">
            <span className="text-slate-600 dark:text-slate-300">Don't have an account yet? </span>
            <button
              onClick={onSwitchToSignup}
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer inline-flex items-center space-x-1 ml-1"
            >
              <span>Create Real Student Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 text-center flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Real Server Auth &bull; Hashed Passwords &bull; 7-Day Valid JWT Session</span>
          </div>
        </div>
      </div>
    </div>
  );
};
