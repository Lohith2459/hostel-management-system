import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Student, Warden, Role, AuthState } from '../types/index.js';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  quickDemoLogin: (role: Role) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  tokenHeader: () => HeadersInit;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    token: localStorage.getItem('hostelsphere_token'),
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const tokenHeader = (): HeadersInit => {
    const token = state.token || localStorage.getItem('hostelsphere_token');
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };

  const refreshMe = async () => {
    const token = localStorage.getItem('hostelsphere_token');
    if (!token) {
      setState((prev) => ({ ...prev, isLoading: false, isAuthenticated: false }));
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Session expired');
      }
      const json = await res.json();
      setState({
        token,
        user: json.data.user,
        profile: json.data.profile,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      localStorage.removeItem('hostelsphere_token');
      setState({
        token: null,
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw new Error(json.message || 'Authentication failed');
    }

    localStorage.setItem('hostelsphere_token', json.data.token);
    setState({
      token: json.data.token,
      user: json.data.user,
      profile: json.data.profile,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const quickDemoLogin = async (role: Role) => {
    let email = '';
    const password = 'Password@123';

    if (role === 'ADMIN') {
      email = 'admin@hostelsphere.edu';
    } else if (role === 'WARDEN') {
      email = 'warden.sharma@hostelsphere.edu';
    } else {
      email = 'rahul.verma@student.edu';
    }

    await login(email, password);
  };

  const signup = async (data: any) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw new Error(json.message || 'Signup failed');
    }

    localStorage.setItem('hostelsphere_token', json.data.token);
    setState({
      token: json.data.token,
      user: json.data.user,
      profile: json.data.profile,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('hostelsphere_token');
    setState({
      token: null,
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        quickDemoLogin,
        signup,
        logout,
        refreshMe,
        tokenHeader,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
