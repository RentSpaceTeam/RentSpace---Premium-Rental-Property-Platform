import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Building2, User, Key, Mail, Phone, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, quickLogin, showNotification } = useAuth();

  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'tenant' | 'owner'>('tenant');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const redirectTarget = searchParams.get('redirect');

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate(redirectTarget || '/');
      } else {
        await register(name, email, password, role, phone);
        if (redirectTarget) {
          navigate(redirectTarget);
        } else if (role === 'owner') {
          navigate('/dashboard/owner');
        } else {
          navigate('/dashboard/tenant');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole: 'tenant' | 'owner' | 'admin') => {
    const redirectTarget = searchParams.get('redirect');
    try {
      setIsLoading(true);
      await quickLogin(demoRole);
      if (redirectTarget && demoRole !== 'admin') {
        navigate(redirectTarget);
      } else if (demoRole === 'admin') {
        navigate('/admin');
      } else if (demoRole === 'owner') {
        navigate('/dashboard/owner');
      } else {
        navigate('/dashboard/tenant');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-[#20283B]">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 text-2xl font-extrabold text-[#101A35]">
            <div className="w-10 h-10 rounded-xl bg-[#101A35] flex items-center justify-center text-white shadow-md shadow-slate-900/10">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span>Rent<span className="text-[#4169E1]">Space</span></span>
          </Link>
          <h2 className="text-xl font-bold text-[#101A35]">
            {mode === 'login' ? 'Sign in to your account' : 'Create your RentSpace account'}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'login'
              ? 'Access your saved properties, track active enquiries, and manage listings.'
              : 'Join as a tenant searching for a room, or an owner listing properties.'}
          </p>
        </div>

        {/* Demo Fast Login Ribbon */}
        <div className="bg-[#101A35] text-white p-4 rounded-2xl shadow-md border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#B7B8FF]">Architecture Role Quick-Access</span>
            <span className="text-[11px] text-slate-400 font-semibold">Instant Access</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Switch to any account role immediately to inspect permissions:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('tenant')}
              className="py-1.5 px-2 bg-slate-800/90 hover:bg-[#4169E1] border border-slate-700 hover:border-[#4169E1] rounded-xl text-xs font-semibold text-slate-100 hover:text-white transition-all cursor-pointer text-center"
            >
              Tenant
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('owner')}
              className="py-1.5 px-2 bg-slate-800/90 hover:bg-[#4169E1] border border-slate-700 hover:border-[#4169E1] rounded-xl text-xs font-semibold text-slate-100 hover:text-white transition-all cursor-pointer text-center"
            >
              Owner
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="py-1.5 px-2 bg-slate-800/90 hover:bg-purple-600 border border-slate-700 hover:border-purple-600 rounded-xl text-xs font-semibold text-slate-100 hover:text-white transition-all cursor-pointer text-center"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          {/* Mode Switch Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                {/* Role selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    I want to join as:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('tenant')}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                        role === 'tenant'
                          ? 'bg-blue-50 border-blue-600 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Tenant / Flatmate
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('owner')}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                        role === 'owner'
                          ? 'bg-blue-50 border-blue-600 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Property Owner / Host
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#4169E1] hover:bg-blue-700 disabled:bg-slate-300 rounded-xl shadow-sm shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Processing...' : mode === 'login' ? 'Sign In to Account' : 'Create My Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-slate-500 font-medium">
          RentSpace Technologies · Premium Living. Smarter Renting.
        </div>
      </div>
    </div>
  );
};
