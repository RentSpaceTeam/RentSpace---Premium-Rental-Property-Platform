import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Building,
  RotateCcw,
  Sparkles,
  Search,
  ExternalLink,
  Database,
  Cpu,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Property, User, Report, AdminStats } from '../types';
import { api } from '../services/api';

export const AdminDashboard: React.FC = () => {
  const { user, showNotification } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'moderation' | 'reports' | 'users' | 'system'>('moderation');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [moderationFilter, setModerationFilter] = useState('all');
  const [reports, setReports] = useState<Report[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Moderation action modal
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [moderationFeedback, setModerationFeedback] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Requirement 3: Admin Property Deletion states
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [isDeletingProperty, setIsDeletingProperty] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth?mode=login&redirect=/admin');
      return;
    }
    if (user.role !== 'admin') {
      showNotification('Access denied: Administrator privileges required.', 'error');
      navigate('/');
      return;
    }
    loadAllAdminData();
  }, [user, moderationFilter]);

  const loadAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, propsRes, repsRes, usersRes, healthRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminProperties(moderationFilter !== 'all' ? moderationFilter : undefined),
        api.getAdminReports(),
        api.getAdminUsers(),
        api.getHealth()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (propsRes.success) setProperties(propsRes.properties);
      if (repsRes.success) setReports(repsRes.reports);
      if (usersRes.success) setUsersList(usersRes.users);
      if (healthRes.success) setSystemHealth(healthRes);
    } catch (err: any) {
      showNotification(err.message || 'Failed to load admin data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerate = async (propId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await api.moderateProperty(propId, {
        status,
        feedback: moderationFeedback || (status === 'approved' ? 'Listing approved.' : 'Listing declined due to policy violation.'),
        isFeatured,
        isVerified
      });

      if (res.success) {
        showNotification(res.message, 'success');
        setSelectedProperty(null);
        setModerationFeedback('');
        loadAllAdminData();
      }
    } catch (err: any) {
      showNotification(err.message || 'Moderation action failed', 'error');
    }
  };

  const handleConfirmDeleteProperty = async () => {
    if (!propertyToDelete) return;
    try {
      setIsDeletingProperty(true);
      const res = await api.deleteProperty(propertyToDelete._id);
      showNotification(res.message || 'Property deleted successfully.', 'success');
      setProperties((prev) => prev.filter((p) => p._id !== propertyToDelete._id));
      setStats((prev) =>
        prev
          ? {
              ...prev,
              totalProperties: Math.max(0, prev.totalProperties - 1),
              approvedProperties:
                propertyToDelete.moderationStatus === 'approved'
                  ? Math.max(0, prev.approvedProperties - 1)
                  : prev.approvedProperties,
              pendingProperties:
                propertyToDelete.moderationStatus === 'pending'
                  ? Math.max(0, prev.pendingProperties - 1)
                  : prev.pendingProperties
            }
          : prev
      );
      setPropertyToDelete(null);
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete property listing.', 'error');
    } finally {
      setIsDeletingProperty(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus?: string) => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      const res = await api.updateUserStatus(userId, nextStatus);
      if (res.success) {
        showNotification(res.message, 'success');
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, status: nextStatus } : u))
        );
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to update user status', 'error');
    }
  };

  const handleUpdateReport = async (reportId: string, status: 'reviewed' | 'resolved') => {
    try {
      const res = await api.updateReportStatus(reportId, status, 'Actioned by admin');
      if (res.success) {
        showNotification(res.message, 'success');
        loadAllAdminData();
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to update report', 'error');
    }
  };

  const handleResetDemoData = async () => {
    if (!window.confirm('Reset sample properties, enquiries, and demo accounts to clean initial seed data?')) {
      return;
    }
    try {
      const res = await api.resetDemoData();
      showNotification(res.message, 'success');
      loadAllAdminData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to reset demo data', 'error');
    }
  };

  const filteredUsers = usersList.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.includes(q);
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-900/60 text-purple-300 rounded text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>RentSpace Administrative Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Platform Administration
            </h1>
            <p className="text-xs text-slate-400">
              Moderate listings, enforce platform trust and safety, and inspect full-stack server state.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDemoData}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Seed</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 block">Total Users</span>
              <span className="text-xl font-bold text-slate-900 tabular-nums">{stats.totalUsers}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 block">Tenants</span>
              <span className="text-xl font-bold text-blue-600 tabular-nums">{stats.tenants}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 block">Owners</span>
              <span className="text-xl font-bold text-slate-900 tabular-nums">{stats.owners}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 block">Total Properties</span>
              <span className="text-xl font-bold text-slate-900 tabular-nums">{stats.totalProperties}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 block">Pending Review</span>
              <span className="text-xl font-bold text-amber-600 tabular-nums">{stats.pendingProperties}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 block">Reports Flagged</span>
              <span className="text-xl font-bold text-red-600 tabular-nums">{stats.pendingReports}</span>
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'moderation'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            Property Management & Moderation ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            Reported Listings ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            User Accounts ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'system'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            System Diagnostics
          </button>
        </div>

        {/* Tab 1: Moderation */}
        {activeTab === 'moderation' && (
          <div className="space-y-4">
            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Filter Properties:</span>
              {[
                { id: 'all', label: 'All Listed Properties' },
                { id: 'pending', label: 'Pending Review' },
                { id: 'approved', label: 'Approved & Active' },
                { id: 'rejected', label: 'Declined' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setModerationFilter(filter.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    moderationFilter === filter.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* List */}
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading properties...</div>
            ) : properties.length > 0 ? (
              <div className="space-y-4">
                {properties.map((prop) => {
                  const image = prop.images && prop.images[0] ? prop.images[0] : '/src/assets/images/hero_rental_home_1792498408215.jpg';
                  return (
                    <div
                      key={prop._id}
                      className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        <img
                          src={image}
                          alt={prop.title}
                          referrerPolicy="no-referrer"
                          className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-semibold text-blue-600 uppercase">{prop.propertyType}</span>
                            <span>·</span>
                            <span className="text-slate-500 font-medium">{prop.locality}, {prop.city} (MP)</span>
                            <span>·</span>
                            <span className="font-bold text-slate-800">₹{prop.rent.toLocaleString('en-IN')}/mo</span>
                            <span>·</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                prop.moderationStatus === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : prop.moderationStatus === 'pending'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-red-50 text-red-700'
                              }`}
                            >
                              Status: {prop.moderationStatus}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900">{prop.title}</h3>
                          <p className="text-xs text-slate-500 line-clamp-1">
                            Owner: <strong>{prop.ownerName || prop.owner}</strong> ({prop.ownerPhone || 'No phone recorded'})
                          </p>
                          {prop.moderationFeedback && (
                            <p className="text-[11px] text-slate-500 italic">
                              Feedback: {prop.moderationFeedback}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Moderation & Delete Actions */}
                      <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-center shrink-0">
                        <Link
                          to={`/properties/${prop._id}`}
                          target="_blank"
                          className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                          title="Preview Listing in New Tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => {
                            setSelectedProperty(prop);
                            setIsFeatured(prop.isFeatured);
                            setIsVerified(prop.isVerified);
                            setModerationFeedback(prop.moderationFeedback || '');
                          }}
                          className="px-3.5 py-2 text-xs font-bold bg-[#101A35] hover:bg-blue-600 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
                        >
                          Review & Moderate
                        </button>

                        <button
                          type="button"
                          onClick={() => setPropertyToDelete(prop)}
                          className="px-3.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl flex items-center gap-1.5 transition-all shadow-sm shadow-red-600/30 cursor-pointer active:scale-95"
                          title="Permanently Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete Property</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
                No properties in this moderation category.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Reports */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((rep) => (
                  <div
                    key={rep._id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-xs text-red-600 font-semibold uppercase tracking-wider block">
                          Violation: {rep.reason.replace('_', ' ')}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{rep.propertyTitle}</h4>
                      </div>
                      <span className="text-xs text-slate-400">
                        Submitted: {new Date(rep.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                      "{rep.details}"
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                      <span>Reporter: {rep.reporterEmail}</span>
                      <div className="flex items-center gap-2">
                        {rep.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleUpdateReport(rep._id, 'reviewed')}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium"
                            >
                              Mark Reviewed
                            </button>
                            <button
                              onClick={() => handleUpdateReport(rep._id, 'resolved')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium"
                            >
                              Resolve Report
                            </button>
                          </>
                        ) : (
                          <span className="text-emerald-700 font-medium">Status: {rep.status}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
                No user reports recorded. The platform is currently clean.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Users */}
        {activeTab === 'users' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-base font-bold text-slate-900">Registered Accounts</h3>
              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name, email, or role..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">User Name</th>
                    <th className="py-2.5 px-3">Email Address</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{u.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{u.email}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'owner' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`font-medium ${u.status === 'suspended' ? 'text-red-600' : 'text-emerald-600'}`}>
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleUserStatus(u._id, u.status)}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                              u.status === 'suspended'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                            }`}
                          >
                            {u.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: System Diagnostics */}
        {activeTab === 'system' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Backend Server & Storage Engine Architecture</h3>
              <p className="text-xs text-slate-500">
                Full-stack environment inspection and college project technical details.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-blue-600" />
                  Database Engine Status
                </span>
                <p className="text-slate-600">
                  Storage Mode: <strong className="text-slate-900">{systemHealth?.storageMode || 'In-Memory / Mongoose Dual Engine'}</strong>
                </p>
                <p className="text-slate-600">
                  MongoDB Direct Connection: <strong className="text-slate-900">{systemHealth?.mongoConnected ? 'Connected' : 'Dual-Engine In-Memory Fallback Active'}</strong>
                </p>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  When deployed locally with <code>npm run dev</code> and a valid <code>MONGODB_URI</code>, RentSpace connects directly to MongoDB. In browser live previews, the high-fidelity in-memory engine runs all endpoints with zero downtime.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  Security Specifications
                </span>
                <p className="text-slate-600">Password Hashing: <strong className="text-slate-900">bcryptjs (10 salt rounds)</strong></p>
                <p className="text-slate-600">Session Security: <strong className="text-slate-900">Signed HMAC-SHA256 Bearer Tokens</strong></p>
                <p className="text-slate-600">Role-Based Access: <strong className="text-slate-900">Tenant / Owner / Admin guards</strong></p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Moderation Review Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Moderate Listing: {selectedProperty.title}</h3>

            <div className="space-y-2">
              <label className="block font-semibold text-slate-700">Moderator Feedback / Notes:</label>
              <textarea
                value={moderationFeedback}
                onChange={(e) => setModerationFeedback(e.target.value)}
                placeholder="Specify reasons for approval or any corrections requested from the owner..."
                rows={3}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="rounded text-blue-600 h-4 w-4"
                />
                <span className="font-semibold text-slate-800">Grant "Verified" Badge (Checked address & title)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-blue-600 h-4 w-4"
                />
                <span className="font-semibold text-slate-800">Promote to "Featured" on Homepage</span>
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const prop = selectedProperty;
                  setSelectedProperty(null);
                  setPropertyToDelete(prop);
                }}
                className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Listing</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProperty(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleModerate(selectedProperty._id, 'rejected')}
                  className="px-3 py-1.5 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700"
                >
                  Reject Listing
                </button>
                <button
                  type="button"
                  onClick={() => handleModerate(selectedProperty._id, 'approved')}
                  className="px-4 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
                >
                  Approve & Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Delete Confirmation Modal */}
      {propertyToDelete && (
        <div className="fixed inset-0 z-50 bg-[#101A35]/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-red-100 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded">
                  Admin Authorization Confirmed
                </span>
                <h3 className="text-base font-extrabold text-[#101A35] mt-0.5">
                  Permanently Delete Property Listing?
                </h3>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 text-xs">
              <p className="font-bold text-slate-900">{propertyToDelete.title}</p>
              <p className="text-slate-500">Location: {propertyToDelete.locality}, {propertyToDelete.city}</p>
              <p className="text-slate-500">Owner: {propertyToDelete.ownerName || propertyToDelete.owner}</p>
              <p className="text-slate-500">Rent: ₹{propertyToDelete.rent.toLocaleString('en-IN')}/month</p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this property? This will remove the listing from all search results, and automatically clean up associated enquiries, reviews, reports, and tenant shortlists. This action is irreversible.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingProperty}
                onClick={() => setPropertyToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingProperty}
                onClick={handleConfirmDeleteProperty}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm shadow-red-600/30"
              >
                {isDeletingProperty ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting Property...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Permanent Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
