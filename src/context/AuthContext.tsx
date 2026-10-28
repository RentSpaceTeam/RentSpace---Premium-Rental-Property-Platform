import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, role: 'tenant' | 'owner', phone?: string) => Promise<void>;
  logout: () => void;
  quickLogin: (role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('rentspace_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('rentspace_token');
    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        logout();
      }
    } catch {
      // If token expired or invalid
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    if (res.token && res.user) {
      localStorage.setItem('rentspace_token', res.token);
      setToken(res.token);
      setUser(res.user);
      showNotification(`Welcome back, ${res.user.name}!`, 'success');
    }
  };

  const register = async (name: string, email: string, pass: string, role: 'tenant' | 'owner', phone?: string) => {
    const res = await api.register({ name, email, password: pass, role, phone });
    if (res.token && res.user) {
      localStorage.setItem('rentspace_token', res.token);
      setToken(res.token);
      setUser(res.user);
      showNotification(`Registration successful! Welcome to RentSpace.`, 'success');
    }
  };

  const quickLogin = async (role: UserRole) => {
    const accounts: Record<UserRole, { email: string; pass: string }> = {
      tenant: { email: 'tenant@rentspace.com', pass: 'Password@123' },
      owner: { email: 'owner@rentspace.com', pass: 'Password@123' },
      admin: { email: 'admin@rentspace.com', pass: 'Password@123' }
    };
    const acc = accounts[role];
    await login(acc.email, acc.pass);
  };

  const logout = () => {
    localStorage.removeItem('rentspace_token');
    setToken(null);
    setUser(null);
    showNotification('Logged out successfully.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        quickLogin,
        refreshUser,
        notification,
        showNotification
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
