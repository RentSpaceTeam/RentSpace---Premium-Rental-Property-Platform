import React, { useState } from 'react';
import { X, Lock, Building2, User, Key, Mail, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  title = 'Sign in to RentSpace',
  subtitle = 'Sign in to view full property addresses, contact owner details, and submit direct enquiries.',
  onSuccess
}) => {
  const { login, register, quickLogin, showNotification } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'tenant' | 'owner'>('tenant');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, role, phone);
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole: 'tenant' | 'owner' | 'admin') => {
    try {
      setIsLoading(true);
      await quickLogin(demoRole);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#101A35]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 border border-blue-100">
            <Lock className="w-5 h-5 text-[#4169E1]" />
          </div>
          <h3 className="text-lg font-bold text-[#101A35] tracking-tight">{title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            {subtitle}
          </p>
        </div>

        {/* 1-Click Fast Role Evaluator Strip */}
        <div className="bg-slate-900 text-white p-3 rounded-xl mb-4 space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-blue-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Quick Role Login:
            </span>
            <span className="text-slate-400">1-Click Test</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoLogin('tenant')}
              className="py-1 px-2 bg-slate-800 hover:bg-blue-600 rounded text-[11px] font-medium text-slate-200 hover:text-white transition-colors"
            >
              Tenant
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('owner')}
              className="py-1 px-2 bg-slate-800 hover:bg-blue-600 rounded text-[11px] font-medium text-slate-200 hover:text-white transition-colors"
            >
              Owner
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="py-1 px-2 bg-slate-800 hover:bg-purple-600 rounded text-[11px] font-medium text-slate-200 hover:text-white transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 py-1.5 rounded-md transition-all ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-2.5 mb-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {mode === 'register' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">I am registering as:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('tenant')}
                    className={`py-1.5 px-3 rounded-lg border text-center transition-all ${
                      role === 'tenant'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Tenant / Flatmate
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('owner')}
                    className={`py-1.5 px-3 rounded-lg border text-center transition-all ${
                      role === 'owner'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Property Owner
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 font-bold text-white bg-[#4169E1] hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/30 transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <span>{isLoading ? 'Authenticating...' : mode === 'login' ? 'Sign In & Unlock Details' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="text-[11px] text-slate-400 text-center mt-3">
          By signing in, you agree to RentSpace tenant privacy and zero-brokerage rules.
        </p>
      </div>
    </div>
  );
};
