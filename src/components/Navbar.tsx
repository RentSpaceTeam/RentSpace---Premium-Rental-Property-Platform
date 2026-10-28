import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  Heart,
  PlusCircle,
  User as UserIcon,
  LogOut,
  Shield,
  Home,
  Compass,
  Menu,
  X,
  ChevronDown,
  Database,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout, quickLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showDemoBar, setShowDemoBar] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleQuickSwitch = async (role: 'tenant' | 'owner' | 'admin') => {
    await quickLogin(role);
    setUserDropdownOpen(false);
    if (role === 'admin') navigate('/admin');
    else if (role === 'owner') navigate('/dashboard/owner');
    else navigate('/dashboard/tenant');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#F8F7F4]/90 backdrop-blur-md border-b border-[#EEF1F6]">
      {/* Platform & Role Evaluation Strip */}
      {showDemoBar && (
        <div className="bg-[#101A35] text-slate-200 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white tracking-wide">RentSpace</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-200 font-medium">Enterprise Rental Architecture & Preview</span>
              <span className="hidden md:inline text-slate-500">·</span>
              <span className="hidden md:inline-flex items-center gap-1.5 text-slate-300">
                <Database className="w-3.5 h-3.5 text-[#4169E1]" />
                Dual Engine: MongoDB Atlas & High-Fidelity In-Memory
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-300 hidden sm:inline text-[11px] uppercase tracking-wider font-bold">
                Quick Role Switch:
              </span>
              <button
                onClick={() => handleQuickSwitch('tenant')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  user?.role === 'tenant'
                    ? 'bg-[#4169E1] text-white shadow-xs'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                Tenant
              </button>
              <button
                onClick={() => handleQuickSwitch('owner')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  user?.role === 'owner'
                    ? 'bg-[#4169E1] text-white shadow-xs'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                Owner
              </button>
              <button
                onClick={() => handleQuickSwitch('admin')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  user?.role === 'admin'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => setShowDemoBar(false)}
                className="text-slate-500 hover:text-slate-300 ml-2 cursor-pointer"
                title="Dismiss demo bar"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Top Bar (Three-Zone Architectural Contract) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-18">
          {/* Zone 1: Bespoke Wordmark & Monogram */}
          <Link
            to="/"
            className="flex items-center gap-3 shrink-0 hover:opacity-95 transition-opacity group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#101A35] flex items-center justify-center text-white shadow-md shadow-slate-900/10 group-hover:bg-[#4169E1] transition-colors">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-[#101A35] leading-none">
                Rent<span className="text-[#4169E1]">Space</span>
              </div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase leading-none mt-1">
                Premium Living
              </div>
            </div>
          </Link>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <Link
              to="/"
              className={`hover:text-[#4169E1] transition-colors whitespace-nowrap shrink-0 py-1 ${
                isActive('/') ? 'text-[#4169E1] font-bold border-b-2 border-[#4169E1]' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/explore"
              className={`hover:text-[#4169E1] transition-colors whitespace-nowrap shrink-0 py-1 ${
                isActive('/explore') ? 'text-[#4169E1] font-bold border-b-2 border-[#4169E1]' : ''
              }`}
            >
              Explore Properties
            </Link>
            <Link
              to="/list-property"
              className={`hover:text-[#4169E1] transition-colors whitespace-nowrap shrink-0 py-1 ${
                isActive('/list-property') ? 'text-[#4169E1] font-bold border-b-2 border-[#4169E1]' : ''
              }`}
            >
              List Your Property
            </Link>
            <Link
              to="/saved"
              className={`hover:text-[#4169E1] transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                isActive('/saved') ? 'text-[#4169E1] font-bold border-b-2 border-[#4169E1]' : ''
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Saved</span>
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`hover:text-purple-600 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                  isActive('/admin') ? 'text-purple-600 font-bold border-b-2 border-purple-600' : ''
                }`}
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* Zone 3: Primary Action / User Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-[#EEF1F6] rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#101A35] text-white flex items-center justify-center text-xs font-extrabold uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left leading-tight">
                    <p className="max-w-[110px] truncate">{user.name}</p>
                    <p className="text-[10px] text-[#4169E1] font-bold uppercase tracking-wider">{user.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#EEF1F6] py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-[#EEF1F6]">
                      <p className="text-sm font-bold text-[#101A35] truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-[#4169E1] text-[10px] font-bold uppercase tracking-wider">
                        Role: {user.role}
                      </div>
                    </div>

                    {user.role === 'tenant' && (
                      <Link
                        to="/dashboard/tenant"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>Tenant Dashboard</span>
                      </Link>
                    )}

                    {user.role === 'owner' && (
                      <>
                        <Link
                          to="/dashboard/owner"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span>Owner Dashboard</span>
                        </Link>
                        <Link
                          to="/list-property"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <PlusCircle className="w-4 h-4 text-slate-400" />
                          <span>Add New Property</span>
                        </Link>
                      </>
                    )}

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-purple-600" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <Link
                      to="/saved"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-slate-400" />
                      <span>Saved Properties</span>
                    </Link>

                    <div className="border-t border-[#EEF1F6] mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-white border border-[#EEF1F6] px-2.5 py-1 rounded-lg">
                  Guest Browsing
                </span>
                <Link
                  to="/auth?mode=login"
                  className="px-3.5 py-2 text-xs font-bold text-[#101A35] hover:text-[#4169E1] transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#4169E1] hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all hover:shadow-lg active:scale-[0.98] whitespace-nowrap"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-[#101A35] rounded-xl hover:bg-white transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#EEF1F6] bg-white px-5 pt-3 pb-6 space-y-3 shadow-xl">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2 text-sm font-semibold text-slate-800 hover:text-[#4169E1]"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Home</span>
          </Link>
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2 text-sm font-semibold text-slate-800 hover:text-[#4169E1]"
          >
            <Compass className="w-4 h-4 text-slate-400" />
            <span>Explore Properties</span>
          </Link>
          <Link
            to="/list-property"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2 text-sm font-semibold text-slate-800 hover:text-[#4169E1]"
          >
            <PlusCircle className="w-4 h-4 text-slate-400" />
            <span>List Your Property</span>
          </Link>
          <Link
            to="/saved"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2 text-sm font-semibold text-slate-800 hover:text-[#4169E1]"
          >
            <Heart className="w-4 h-4 text-slate-400" />
            <span>Saved Properties</span>
          </Link>

          {user && (
            <div className="border-t border-[#EEF1F6] pt-3">
              <div className="mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Dashboard & Account
              </div>
              {user.role === 'tenant' && (
                <Link
                  to="/dashboard/tenant"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2 text-sm font-semibold text-slate-800"
                >
                  <UserIcon className="w-4 h-4 text-[#4169E1]" />
                  <span>Tenant Dashboard</span>
                </Link>
              )}
              {user.role === 'owner' && (
                <Link
                  to="/dashboard/owner"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2 text-sm font-semibold text-slate-800"
                >
                  <Building2 className="w-4 h-4 text-[#4169E1]" />
                  <span>Owner Dashboard</span>
                </Link>
              )}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2 text-sm font-semibold text-purple-700"
                >
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span>Admin Console</span>
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  navigate('/');
                }}
                className="w-full flex items-center gap-3 py-2 text-sm font-semibold text-rose-600 text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {!user && (
            <div className="border-t border-[#EEF1F6] pt-3 flex flex-col gap-2">
              <Link
                to="/auth?mode=login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-[#EEF1F6] text-xs font-bold text-[#101A35]"
              >
                Sign In
              </Link>
              <Link
                to="/auth?mode=register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-[#4169E1] text-white text-xs font-bold shadow-md shadow-blue-600/30"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
