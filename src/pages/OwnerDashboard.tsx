import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  PlusCircle,
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit,
  Phone,
  Mail,
  Calendar,
  ExternalLink,
  X,
  Plus,
  Save,
  Check,
  XCircle,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Property, Enquiry } from '../types';
import { api } from '../services/api';
import { ImageUpload } from '../components/ImageUpload';
import { CitySelector } from '../components/CitySelector';

export const OwnerDashboard: React.FC = () => {
  const { user, showNotification } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'properties' | 'enquiries'>('properties');
  const [properties, setProperties] = useState<Property[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit property modal state
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editRent, setEditRent] = useState<number>(0);
  const [editDeposit, setEditDeposit] = useState<number>(0);
  const [editDescription, setEditDescription] = useState('');
  const [editAvailability, setEditAvailability] = useState<'available' | 'rented' | 'under_maintenance'>('available');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editCity, setEditCity] = useState('');
  const [editLocality, setEditLocality] = useState('');
  const [isUpdatingProperty, setIsUpdatingProperty] = useState(false);

  // Enquiry response notes
  const [statusUpdateMap, setStatusUpdateMap] = useState<Record<string, { status: string; notes: string }>>({});

  useEffect(() => {
    if (!user) {
      navigate('/auth?mode=login&redirect=/dashboard/owner');
      return;
    }
    if (user.role === 'tenant') {
      showNotification('Your account is registered as a Tenant. Switch to Owner role to access this dashboard.', 'info');
      navigate('/dashboard/tenant');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [propsRes, enqRes] = await Promise.all([
        api.getOwnerProperties(),
        api.getOwnerEnquiries()
      ]);

      if (propsRes.success && propsRes.properties) {
        setProperties(propsRes.properties);
      }
      if (enqRes.success && enqRes.enquiries) {
        setEnquiries(enqRes.enquiries);
        // Initialize status map
        const initialMap: Record<string, { status: string; notes: string }> = {};
        enqRes.enquiries.forEach((e) => {
          initialMap[e._id] = { status: e.status, notes: e.ownerNotes || '' };
        });
        setStatusUpdateMap(initialMap);
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to load owner data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (prop: Property) => {
    setEditingProperty(prop);
    setEditTitle(prop.title);
    setEditRent(prop.rent);
    setEditDeposit(prop.deposit);
    setEditDescription(prop.description);
    setEditAvailability(prop.availability);
    setEditImages(prop.images || []);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;

    if (editImages.length === 0) {
      showNotification('A property listing must have at least one photograph.', 'error');
      return;
    }

    try {
      setIsUpdatingProperty(true);
      const res = await api.updateProperty(editingProperty._id, {
        title: editTitle,
        rent: editRent,
        deposit: editDeposit,
        description: editDescription,
        availability: editAvailability,
        images: editImages
      });

      if (res.success && res.property) {
        setProperties((prev) =>
          prev.map((p) => (p._id === editingProperty._id ? res.property : p))
        );
        showNotification('Property updated successfully.', 'success');
        setEditingProperty(null);
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to update property', 'error');
    } finally {
      setIsUpdatingProperty(false);
    }
  };

  const handleDeleteProperty = async (propId: string) => {
    if (!window.confirm('Are you sure you want to delete this property listing? This cannot be undone.')) {
      return;
    }

    try {
      await api.deleteProperty(propId);
      setProperties((prev) => prev.filter((p) => p._id !== propId));
      showNotification('Property listing deleted successfully.', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete property', 'error');
    }
  };

  const handleUpdateEnquiryStatus = async (enquiryId: string) => {
    const item = statusUpdateMap[enquiryId];
    if (!item) return;

    try {
      await api.updateEnquiryStatus(enquiryId, item.status, item.notes);
      showNotification('Enquiry status updated and saved.', 'success');
      loadData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDirectEnquiryDecision = async (enquiryId: string, status: 'accepted' | 'rejected') => {
    try {
      const existingNotes = statusUpdateMap[enquiryId]?.notes;
      const res = await api.updateEnquiryStatus(enquiryId, status, existingNotes);
      showNotification(res.message, 'success');
      loadData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to update enquiry status', 'error');
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
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Property Owner Portal</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {user?.name}'s Management Desk
            </h1>
            <p className="text-xs text-slate-500">
              Manage listings, monitor moderation approvals, and respond to interested tenant enquiries.
            </p>
          </div>

          <Link
            to="/list-property"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/30 transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Property</span>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 block">Total Listings</span>
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{properties.length}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 block">Active / Approved</span>
            <span className="text-2xl font-bold text-emerald-600 tabular-nums">
              {properties.filter((p) => p.moderationStatus === 'approved').length}
            </span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 block">Under Review</span>
            <span className="text-2xl font-bold text-amber-600 tabular-nums">
              {properties.filter((p) => p.moderationStatus === 'pending').length}
            </span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 block">Enquiries Received</span>
            <span className="text-2xl font-bold text-blue-600 tabular-nums">{enquiries.length}</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'properties'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>My Listings ({properties.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'enquiries'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Received Enquiries ({enquiries.length})</span>
          </button>
        </div>

        {/* Tab 1: Properties List */}
        {activeTab === 'properties' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading your properties...</div>
            ) : properties.length > 0 ? (
              <div className="space-y-4">
                {properties.map((prop) => {
                  const image = prop.images && prop.images[0] ? prop.images[0] : '/src/assets/images/hero_rental_home_1792498408215.jpg';
                  return (
                    <div
                      key={prop._id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
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
                            <span className="text-slate-500">{prop.locality}, {prop.city}</span>
                            <span>·</span>
                            {prop.moderationStatus === 'approved' && (
                              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                                Approved & Live
                              </span>
                            )}
                            {prop.moderationStatus === 'pending' && (
                              <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                                Under Moderation Review
                              </span>
                            )}
                            {prop.moderationStatus === 'rejected' && (
                              <span className="text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded text-[11px]">
                                Changes Requested
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-slate-900">{prop.title}</h3>

                          <div className="text-xs text-slate-500 flex items-center gap-3">
                            <span className="font-semibold text-slate-800">{formatPrice(prop.rent)}/mo</span>
                            <span>·</span>
                            <span>Status: <strong className="capitalize">{prop.availability}</strong></span>
                            {prop.moderationFeedback && (
                              <>
                                <span>·</span>
                                <span className="italic text-slate-500">Note: {prop.moderationFeedback}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <Link
                          to={`/properties/${prop._id}`}
                          className="p-2 text-slate-500 hover:text-blue-600 border border-slate-200 rounded-lg"
                          title="View Live Listing"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(prop)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(prop._id)}
                          className="p-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
                <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No properties listed yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  List your PG accommodation, apartment, or shared room to start receiving direct tenant inquiries.
                </p>
                <Link
                  to="/list-property"
                  className="inline-block mt-2 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg"
                >
                  Create Your First Listing
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Enquiries List */}
        {activeTab === 'enquiries' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading enquiries...</div>
            ) : enquiries.length > 0 ? (
              <div className="space-y-4">
                {enquiries.map((enq) => {
                  const currentStatus = statusUpdateMap[enq._id]?.status || enq.status;
                  const currentNotes = statusUpdateMap[enq._id]?.notes ?? (enq.ownerNotes || '');

                  return (
                    <div
                      key={enq._id}
                      className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-xs text-slate-500 block">Enquiry for:</span>
                          <span className="text-sm font-bold text-slate-900">{enq.propertyTitle}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {enq.status === 'accepted' ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Accepted · Phone Unlocked</span>
                            </span>
                          ) : enq.status === 'rejected' ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 inline-flex items-center gap-1.5">
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span>Declined · Phone Kept Private</span>
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 inline-flex items-center gap-1.5 animate-pulse">
                              <Clock className="w-4 h-4 text-amber-600" />
                              <span>Pending Owner Action</span>
                            </span>
                          )}

                          {/* Instant Decision Buttons in Header */}
                          <div className="flex items-center gap-2 ml-2">
                            <button
                              type="button"
                              onClick={() => handleDirectEnquiryDecision(enq._id, 'accepted')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm ${
                                enq.status === 'accepted'
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Accept</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDirectEnquiryDecision(enq._id, 'rejected')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm ${
                                enq.status === 'rejected'
                                  ? 'bg-red-700 text-white'
                                  : 'bg-red-600 hover:bg-red-700 text-white active:scale-95'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>

                          <span className="text-xs text-slate-400 ml-auto">
                            {new Date(enq.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Prominent Pending Callout Banner */}
                      {(enq.status === 'pending' || enq.status === 'new' || !enq.status) && (
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 text-amber-900">
                            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                            <div>
                              <span className="font-bold block">Action Required on Move-In Request</span>
                              <span className="text-[11px] text-amber-800">
                                Click <strong>Accept</strong> to approve this tenant and reveal your contact number to them, or <strong>Reject</strong> to decline.
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleDirectEnquiryDecision(enq._id, 'accepted')}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm text-xs cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Accept Enquiry</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDirectEnquiryDecision(enq._id, 'rejected')}
                              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm text-xs cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject Enquiry</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Tenant Message & Contact */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-2">
                          <span className="font-semibold text-slate-800 block">Tenant Message:</span>
                          <p className="p-3 bg-slate-50 rounded-lg border border-slate-100 italic text-slate-700">
                            "{enq.message}"
                          </p>
                          <div className="flex items-center gap-4 text-slate-500">
                            <span>Move-In: <strong>{enq.moveInDate || 'Flexible'}</strong></span>
                            <span>·</span>
                            <span>Duration: <strong>{enq.preferredDuration || 'Flexible'}</strong></span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="font-semibold text-slate-800 block">Tenant Information:</span>
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5 text-slate-700">
                            <p className="font-bold text-slate-900">{enq.tenantName}</p>
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <a href={`mailto:${enq.tenantEmail}`} className="text-blue-600 hover:underline">
                                {enq.tenantEmail}
                              </a>
                            </div>
                            {enq.tenantPhone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <a href={`tel:${enq.tenantPhone}`} className="text-slate-900 font-medium hover:underline">
                                  {enq.tenantPhone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Owner Status Management Workflow & Privacy Control */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700">Quick Decision:</span>
                            <button
                              type="button"
                              onClick={() => handleDirectEnquiryDecision(enq._id, 'accepted')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs ${
                                enq.status === 'accepted'
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{enq.status === 'accepted' ? 'Enquiry Accepted' : 'Accept Enquiry'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDirectEnquiryDecision(enq._id, 'rejected')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                                enq.status === 'rejected'
                                  ? 'bg-red-700 text-white'
                                  : 'bg-white hover:bg-red-50 text-red-600 border border-red-200'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>{enq.status === 'rejected' ? 'Declined' : 'Decline'}</span>
                            </button>
                          </div>

                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>
                              {enq.status === 'accepted'
                                ? 'Your phone is now unlocked for this tenant.'
                                : 'Your contact number is protected until accepted.'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-slate-700">Detailed Status:</label>
                            <select
                              value={currentStatus}
                              onChange={(e) => {
                                setStatusUpdateMap((prev) => ({
                                  ...prev,
                                  [enq._id]: { ...prev[enq._id], status: e.target.value }
                                }));
                              }}
                              className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-800 font-medium"
                            >
                              <option value="pending">Pending Review (Phone Hidden)</option>
                              <option value="accepted">Accepted (Phone Revealed to Tenant)</option>
                              <option value="rejected">Declined (Phone Hidden)</option>
                              <option value="new">New (Unread)</option>
                              <option value="contacted">Contacted (Called / Emailed)</option>
                              <option value="in_progress">In Progress (Walkthrough Scheduled)</option>
                              <option value="closed">Closed (Rented or Finished)</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleUpdateEnquiryStatus(enq._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors self-end sm:self-auto cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Custom Status & Note</span>
                          </button>
                        </div>

                        <div>
                          <input
                            type="text"
                            value={currentNotes}
                            onChange={(e) => {
                              setStatusUpdateMap((prev) => ({
                                ...prev,
                                [enq._id]: { ...prev[enq._id], notes: e.target.value }
                              }));
                            }}
                            placeholder="Add private note or feedback visible to tenant (e.g. 'Walkthrough fixed for Saturday 11am')"
                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
                <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No enquiries received yet</h3>
                <p className="text-xs text-slate-500">
                  When prospective tenants enquire about your listings, their messages will appear here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Property Modal */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Property Details</h3>
              <button
                onClick={() => setEditingProperty(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    value={editRent}
                    onChange={(e) => setEditRent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deposit (₹)</label>
                  <input
                    type="number"
                    value={editDeposit}
                    onChange={(e) => setEditDeposit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Listing Availability</label>
                <select
                  value={editAvailability}
                  onChange={(e) => setEditAvailability(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                >
                  <option value="available">Available for Rent</option>
                  <option value="rented">Currently Rented</option>
                  <option value="under_maintenance">Under Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#101A35] uppercase tracking-wider text-[11px] mb-1.5">
                  Property Photographs (From Device)
                </label>
                <ImageUpload
                  images={editImages}
                  onChange={setEditImages}
                  maxImages={8}
                  maxSizeMB={5}
                />
              </div>

              <div>
                <label className="block font-bold text-[#101A35] uppercase tracking-wider text-[11px] mb-1">
                  Listing Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#EEF1F6] rounded-xl text-[#20283B] focus:outline-none focus:border-[#4169E1]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EEF1F6]">
                <button
                  type="button"
                  onClick={() => setEditingProperty(null)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProperty || editImages.length === 0}
                  className="px-5 py-2.5 font-bold text-white bg-[#101A35] hover:bg-[#4169E1] disabled:bg-slate-300 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isUpdatingProperty ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
