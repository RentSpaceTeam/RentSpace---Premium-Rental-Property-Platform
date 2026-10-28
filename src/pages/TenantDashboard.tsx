import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Send,
  User as UserIcon,
  Clock,
  CheckCircle2,
  Phone,
  Calendar,
  Building,
  ArrowRight,
  ShieldAlert,
  Edit2,
  Lock,
  XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Property, Enquiry } from '../types';
import { api } from '../services/api';
import { PropertyCard } from '../components/PropertyCard';

export const TenantDashboard: React.FC = () => {
  const { user, showNotification, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'enquiries' | 'saved' | 'profile'>('enquiries');
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Profile form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth?mode=login&redirect=/dashboard/tenant');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [enqRes, savedRes] = await Promise.all([
        api.getTenantEnquiries(),
        api.getSavedProperties()
      ]);

      if (enqRes.success && enqRes.enquiries) {
        setEnquiries(enqRes.enquiries);
      }
      if (savedRes.success && savedRes.properties) {
        setSavedProperties(savedRes.properties);
      }
    } catch (err: any) {
      showNotification(err.message || 'Error loading dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      const res = await api.updateProfile({ name: profileName, phone: profilePhone });
      if (res.success) {
        await refreshUser();
        showNotification('Profile updated successfully.', 'success');
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const getStatusBadge = (status: Enquiry['status']) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Accepted · Landlord Phone Unlocked</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 inline-flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Declined · Phone Protected</span>
          </span>
        );
      case 'pending':
      case 'new':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Review · Phone Protected</span>
          </span>
        );
      case 'contacted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Contacted</span>;
      case 'in_progress':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">Walkthrough Scheduled</span>;
      case 'closed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Closed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header / Welcome */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Tenant Portal</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Welcome, {user?.name}
            </h1>
            <p className="text-xs text-slate-500">
              Manage your move-in enquiries, shortlisted properties, and account profile.
            </p>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
          >
            <span>Browse More Properties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 block">Total Enquiries</span>
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{enquiries.length}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 block">Saved Favorites</span>
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{savedProperties.length}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 block">Pending Responses</span>
            <span className="text-2xl font-bold text-blue-600 tabular-nums">
              {enquiries.filter((e) => e.status === 'new').length}
            </span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 block">Active Walkthroughs</span>
            <span className="text-2xl font-bold text-purple-600 tabular-nums">
              {enquiries.filter((e) => e.status === 'in_progress').length}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'enquiries'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>My Enquiries ({enquiries.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'saved'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Saved Properties ({savedProperties.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Profile Settings</span>
          </button>
        </div>

        {/* Tab Content: Enquiries */}
        {activeTab === 'enquiries' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading your enquiries...</div>
            ) : enquiries.length > 0 ? (
              <div className="space-y-4">
                {enquiries.map((enq) => (
                  <div
                    key={enq._id}
                    className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <Link
                          to={`/properties/${enq.property}`}
                          className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors"
                        >
                          {enq.propertyTitle}
                        </Link>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {enq.propertyCity} · Rent: {formatPrice(enq.propertyRent)}/mo
                        </div>
                      </div>
                      <div>{getStatusBadge(enq.status)}</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-800 block mb-1">Your Message:</span>
                        <p className="bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                          "{enq.message}"
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>Move-In Date: <strong>{enq.moveInDate || 'Not specified'}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>Stay Duration: <strong>{enq.preferredDuration || 'Flexible'}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>Your Contact: <strong>{enq.tenantPhone}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Owner Contact Privacy & Unlocked State */}
                    {enq.status === 'accepted' ? (
                      <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-xs">
                        <div className="flex items-start sm:items-center gap-3 text-emerald-950">
                          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Phone className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-extrabold text-sm block text-emerald-900">
                              Landlord Contact Phone Unlocked!
                            </span>
                            <span className="text-xs text-emerald-800">
                              The property owner accepted your enquiry. You are authorized to contact them directly.
                            </span>
                            {enq.ownerPhone && (
                              <p className="text-base font-black text-emerald-950 mt-1 tabular-nums">
                                {enq.ownerPhone}
                              </p>
                            )}
                          </div>
                        </div>

                        {enq.ownerPhone ? (
                          <a
                            href={`tel:${enq.ownerPhone}`}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/30 whitespace-nowrap self-stretch sm:self-auto cursor-pointer active:scale-95"
                          >
                            <Phone className="w-4 h-4" />
                            <span>Call Landlord Now</span>
                          </a>
                        ) : (
                          <span className="text-emerald-800 font-semibold italic text-xs">Phone verified</span>
                        )}
                      </div>
                    ) : enq.status === 'rejected' ? (
                      <div className="p-3 bg-red-50/70 border border-red-200/80 rounded-xl flex items-center gap-2.5 text-xs text-red-900">
                        <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>This enquiry was declined by the property owner. Contact details remain private.</span>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
                        <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>The owner has received your request. Landlord contact number will be unlocked once accepted.</span>
                      </div>
                    )}

                    {/* Owner Notes (if any) */}
                    {enq.ownerNotes && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                        <span className="font-bold text-blue-900 block mb-0.5">Note from Property Owner:</span>
                        <p className="text-blue-800">{enq.ownerNotes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                      <span>Submitted on {new Date(enq.createdAt).toLocaleDateString()}</span>
                      <Link
                        to={`/properties/${enq.property}`}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        View Property Listing →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
                <Send className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No Enquiries Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When you find a room or flat you like, click "Send Direct Enquiry" to request a visit or ask questions.
                </p>
                <Link
                  to="/explore"
                  className="inline-block mt-2 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg"
                >
                  Explore Available Properties
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Saved Properties */}
        {activeTab === 'saved' && (
          <div>
            {savedProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedProperties.map((prop) => (
                  <PropertyCard
                    key={prop._id}
                    property={prop}
                    initialSaved={true}
                    onSaveToggle={(id, saved) => {
                      if (!saved) {
                        setSavedProperties((prev) => prev.filter((p) => p._id !== id));
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
                <Heart className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No Saved Properties</h3>
                <p className="text-xs text-slate-500">
                  Tap the heart icon on any property card to save it to your personal shortlist.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Profile Settings */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-xl">
            <h2 className="text-base font-bold text-slate-900 mb-4">Manage Profile Information</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Account ID)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">Email cannot be modified for security.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
