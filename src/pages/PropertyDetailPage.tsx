import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  Bed,
  Bath,
  CheckCircle2,
  Heart,
  Share2,
  Flag,
  Calendar,
  Clock,
  ShieldCheck,
  Send,
  Star,
  User,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Lock,
  Phone,
  Mail,
  Shield,
  Eye,
  LogIn,
  Building2,
  Trash2
} from 'lucide-react';
import { Property, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PropertyCard } from '../components/PropertyCard';
import { AuthModal } from '../components/AuthModal';

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, showNotification } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Auth modal state for guest interactions
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState({
    title: 'Sign in to RentSpace',
    subtitle: 'Sign in to view full property details, verified addresses, and contact the owner directly.'
  });

  // Enquiry form state (for logged-in users)
  const [enquiryMessage, setEnquiryMessage] = useState(
    'Hi, I am interested in renting this property. Please let me know when we can schedule an in-person walkthrough.'
  );
  const [moveInDate, setMoveInDate] = useState('');
  const [preferredDuration, setPreferredDuration] = useState('11 months');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('inaccurate_info');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Admin Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingProperty, setIsDeletingProperty] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setIsLoading(true);
      try {
        const propRes = await api.getPropertyById(id);
        if (propRes.success && propRes.property) {
          setProperty(propRes.property);

          // Check if saved
          if (user) {
            try {
              const savedRes = await api.checkIsSaved(id);
              setIsSaved(savedRes.saved);
            } catch {
              // Ignore
            }
          }

          // Fetch reviews
          const revRes = await api.getPropertyReviews(id);
          if (revRes.success && revRes.reviews) {
            setReviews(revRes.reviews);
          }

          // Fetch related properties in same city or category
          const relRes = await api.getProperties({
            city: propRes.property.city,
            propertyType: propRes.property.propertyType
          });
          if (relRes.success && relRes.properties) {
            setRelatedProperties(relRes.properties.filter((p) => p._id !== id).slice(0, 3));
          }
        }
      } catch (err: any) {
        showNotification(err.message || 'Property not found', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
    window.scrollTo(0, 0);
  }, [id, user]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleOpenAuthModal = (title: string, subtitle: string) => {
    setAuthModalConfig({ title, subtitle });
    setAuthModalOpen(true);
  };

  const handleToggleSave = async () => {
    if (!user) {
      handleOpenAuthModal(
        'Save to Your Shortlist',
        'Sign in to save this property and manage your favorites anytime from your Tenant Dashboard.'
      );
      return;
    }
    if (!property) return;
    try {
      const res = await api.toggleSaveProperty(property._id);
      setIsSaved(res.saved);
      showNotification(res.message, 'success');
    } catch (err: any) {
      showNotification(err.message || 'Could not update favorites', 'error');
    }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      handleOpenAuthModal(
        'Sign in to Send Enquiry',
        'Connect directly with the verified property owner and schedule an in-person visit.'
      );
      return;
    }
    if (!property) return;

    try {
      setIsSubmittingEnquiry(true);
      await api.createEnquiry({
        propertyId: property._id,
        message: enquiryMessage,
        moveInDate,
        preferredDuration,
        contactPhone
      });
      setEnquirySuccess(true);
      showNotification('Enquiry sent directly to the property owner!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to submit enquiry', 'error');
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      handleOpenAuthModal(
        'Sign in to Leave a Review',
        'Verified reviews help maintain a trusted, safe community for students and tenants.'
      );
      return;
    }
    if (!property || !reviewComment.trim()) return;

    try {
      setIsSubmittingReview(true);
      const res = await api.addReview(property._id, reviewRating, reviewComment);
      if (res.success && res.review) {
        setReviews([res.review, ...reviews]);
        setReviewComment('');
        showNotification('Thank you! Your review has been published.', 'success');
        const refreshed = await api.getPropertyById(property._id);
        if (refreshed.property) setProperty(refreshed.property);
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      handleOpenAuthModal(
        'Sign in to Report Listing',
        'Help our moderation team keep RentSpace secure by reporting violations.'
      );
      return;
    }
    if (!property || !reportDetails.trim()) return;

    try {
      setIsSubmittingReport(true);
      await api.createReport(property._id, reportReason as any, reportDetails);
      setShowReportModal(false);
      setReportDetails('');
      showNotification('Report submitted for administrative review.', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to submit report', 'error');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleAdminDeleteProperty = async () => {
    if (!property) return;
    try {
      setIsDeletingProperty(true);
      const res = await api.deleteProperty(property._id);
      showNotification(res.message || 'Property deleted successfully.', 'success');
      setShowDeleteModal(false);
      navigate('/admin');
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete property.', 'error');
    } finally {
      setIsDeletingProperty(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#4169E1] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-16 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md mx-auto space-y-4 shadow-sm">
          <h2 className="text-xl font-bold text-[#101A35]">Property Not Found</h2>
          <p className="text-xs text-slate-500">
            The listing you are searching for might have been unlisted, moderated, or rented out.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#4169E1] hover:bg-blue-700 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Explorer</span>
          </Link>
        </div>
      </div>
    );
  }

  const hasImages = property.images && property.images.length > 0;
  const images = hasImages ? property.images : [];

  const isGuest = !user;

  return (
    <div className="min-h-screen bg-[#F8F7F4] py-8 text-[#20283B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#4169E1] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Properties</span>
          </Link>

          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-sm shadow-red-600/30 transition-all cursor-pointer active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Property (Admin)</span>
              </button>
            )}

            <button
              onClick={handleToggleSave}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isSaved
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{isSaved ? 'Saved to Shortlist' : 'Save Property'}</span>
            </button>

            <button
              onClick={() => {
                if (isGuest) {
                  handleOpenAuthModal('Report Listing', 'Sign in to file a verified safety report with our team.');
                } else {
                  setShowReportModal(true);
                }
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:text-red-600 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report Listing</span>
            </button>
          </div>
        </div>

        {/* Guest Preview Notice Banner (Anti-Slop, tasteful notification) */}
        {isGuest && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#101A35]">Guest Browsing Preview Active</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                    Protected
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  You are viewing public listing photos, rent, and verified locality. Sign in to view full street address and contact the owner directly.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenAuthModal('Sign In to Unlock Full Details', 'Access full address, landlord direct contacts, and send move-in enquiries.')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#4169E1] hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-600/30 whitespace-nowrap self-start sm:self-auto transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In to Unlock Full Details</span>
            </button>
          </div>
        )}

        {/* Title & Location Header */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="text-[#4169E1] font-semibold uppercase">{property.propertyType.replace('_', ' ')}</span>
            <span>·</span>
            <span>{property.locality}, {property.city}</span>
            <span>·</span>
            <span className="capitalize">{property.furnishing.replace('-', ' ')}</span>
            {property.isVerified && (
              <>
                <span>·</span>
                <span className="text-blue-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  Verified Address
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101A35] tracking-tight">
            {property.title}
          </h1>

          {/* Location Line: Full Street Address (Authenticated) vs Approximate Locality (Guest) */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            {isGuest ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{property.locality}, {property.city}</span>
                <span className="text-slate-300">·</span>
                <button
                  onClick={() => handleOpenAuthModal('Sign in to view full street address', 'Exact street, house number, and landmark are reserved for registered users.')}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4169E1] hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-0.5 rounded-md transition-colors"
                >
                  <Lock className="w-3 h-3 text-[#4169E1]" />
                  <span>Full Street Address Locked (Sign In to View)</span>
                </button>
              </div>
            ) : (
              <span className="font-medium text-slate-800">
                {property.address || property.locality}, {property.locality}, {property.city}
              </span>
            )}
          </div>
        </div>

        {/* Image Gallery */}
        <div className="space-y-3">
          {hasImages ? (
            <>
              <div className="aspect-[16/9] sm:aspect-[21/9] w-full max-h-[500px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md">
                <img
                  src={images[selectedImageIndex] || images[0]}
                  alt={property.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-24 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        selectedImageIndex === idx ? 'border-[#4169E1] ring-2 ring-blue-600/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-[16/9] sm:aspect-[21/9] w-full max-h-[400px] rounded-2xl overflow-hidden border border-[#EEF1F6] bg-white flex flex-col items-center justify-center p-8 text-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-[#F8F7F4] border border-[#EEF1F6] flex items-center justify-center text-[#4169E1] mb-3">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#101A35]">RentSpace Architectural Listing</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                The owner has not uploaded photographs for this space yet. Verified locality and specifications are listed below.
              </p>
            </div>
          )}
        </div>

        {/* Main Content Layout: Details + Sticky Enquiry Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Specifications, Amenities, Description, Reviews */}
          <div className="lg:col-span-8 space-y-8">
            {/* Quick Specs Grid */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-slate-500 block">Monthly Rent</span>
                <span className="text-lg font-bold text-slate-900 tabular-nums">{formatPrice(property.rent)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Security Deposit</span>
                <span className="text-lg font-bold text-slate-900 tabular-nums">{formatPrice(property.deposit)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Bedrooms / Occupancy</span>
                <span className="text-lg font-bold text-slate-900">{property.bedrooms} Bed</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Bathrooms</span>
                <span className="text-lg font-bold text-slate-900">{property.bathrooms} Bath</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">About This Residence</h2>
                {isGuest && (
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    Public Preview
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
              {isGuest && (
                <div className="pt-2">
                  <button
                    onClick={() => handleOpenAuthModal('Sign in to view full description', 'Read full house rules, lease terms, and landlord policies.')}
                    className="text-xs font-semibold text-[#4169E1] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Read full owner notes & lease agreement rules</span>
                    <ArrowLeft className="w-3 h-3 rotate-180" />
                  </button>
                </div>
              )}
            </div>

            {/* Amenities Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900">Furnishing & Included Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#4169E1] shrink-0" />
                    <span className="truncate">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Owner Public Card vs Privacy Protected Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-[#4169E1] flex items-center justify-center font-bold text-lg border border-blue-100">
                    {property.ownerName ? property.ownerName.charAt(0) : 'O'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{property.ownerName || 'Verified Property Owner'}</h3>
                    <p className="text-xs text-slate-500">Property Landlord / Co-Living Host</p>
                    <p className="text-[11px] text-[#4169E1] font-medium mt-0.5">Average Response: Under 2 hours</p>
                  </div>
                </div>

                {!isGuest && property.ownerPhone && (
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider block">
                      ✓ Direct Contact Unlocked
                    </span>
                    <a
                      href={`tel:${property.ownerPhone}`}
                      className="text-sm font-black text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1.5"
                    >
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>{property.ownerPhone}</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Requirement 1: Owner contact privacy notice states */}
              {isGuest ? (
                <div className="p-3.5 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Private landlord phone number is protected. Sign in to submit an enquiry and request contact details.</span>
                  </div>
                  <button
                    onClick={() => handleOpenAuthModal('Sign In to Contact Owner', 'Connect directly with verified landlords and schedule an in-person walkthrough.')}
                    className="font-bold text-[#4169E1] hover:underline whitespace-nowrap self-start sm:self-auto cursor-pointer"
                  >
                    Sign in to contact owner →
                  </button>
                </div>
              ) : property.ownerPhone ? (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                  <div className="flex items-center gap-3 text-emerald-950">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm block text-emerald-900">
                        {user?.role === 'admin'
                          ? 'Administrator Access Unlocked'
                          : user?._id === property.owner
                          ? 'Your Verified Listing'
                          : 'Enquiry Accepted: Direct Contact Unlocked!'}
                      </span>
                      <p className="text-xs text-emerald-800 font-bold mt-0.5">
                        Landlord Phone: <span className="text-emerald-950 text-sm font-black">{property.ownerPhone}</span>
                      </p>
                    </div>
                  </div>
                  <a
                    href={`tel:${property.ownerPhone}`}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition-all whitespace-nowrap inline-flex items-center justify-center gap-1.5 text-xs shadow-sm shadow-emerald-600/30"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Landlord Now</span>
                  </a>
                </div>
              ) : property.userEnquiryStatus === 'pending' || property.userEnquiryStatus === 'new' || enquirySuccess ? (
                <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center gap-3 text-xs">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-amber-900 block">Enquiry Submitted · Pending Owner Review</span>
                    <p className="text-amber-800 text-[11px]">
                      The owner has received your request. To protect owner privacy, the contact phone number will be revealed once the owner reviews and accepts your enquiry.
                    </p>
                  </div>
                </div>
              ) : property.userEnquiryStatus === 'rejected' ? (
                <div className="p-3.5 bg-red-50 border border-red-200/80 rounded-xl flex items-center gap-3 text-xs">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-red-900 block">Enquiry Declined by Owner</span>
                    <p className="text-red-700 text-[11px]">
                      The landlord declined this enquiry. The contact number remains hidden.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl flex items-center gap-3 text-xs">
                  <Lock className="w-4 h-4 text-[#4169E1] shrink-0" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#101A35] block">Owner Contact Number Protected</span>
                    <p className="text-slate-600 text-[11px]">
                      Landlord contact numbers are protected against spam. Submit your move-in enquiry below. Once the owner accepts, their phone number will be unlocked for you.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Reviews & Ratings */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Tenant Ratings & Reviews</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authentic feedback from verified residents and tenants
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-lg">
                    <Star className="w-5 h-5 fill-amber-400" />
                    <span>{property.averageRating || '4.5'}</span>
                  </div>
                  <span className="text-xs text-slate-400">({reviews.length} total reviews)</span>
                </div>
              </div>

              {/* Review submission: Form for authenticated users, prompt for guests */}
              {isGuest ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800">Lived here or visited recently?</p>
                    <p className="text-slate-500">Sign in as a tenant to write a verified review.</p>
                  </div>
                  <button
                    onClick={() => handleOpenAuthModal('Sign in to leave a review', 'Share your honest feedback to help future flatmates and tenants.')}
                    className="px-3.5 py-1.5 font-bold text-[#4169E1] bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Leave a Review</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">Your Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-4 h-4 ${reviewRating >= star ? 'fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 ml-2">{reviewRating} Stars</span>
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience regarding room cleanliness, ventilation, owner cooperation, WiFi stability..."
                    rows={2}
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#4169E1] hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div key={rev._id} className="border-b border-slate-100 pb-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">
                            {rev.tenantName.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{rev.tenantName}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center text-amber-500 text-xs">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pl-9">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No reviews yet for this property. Be the first to review!</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Enquiry Panel (Authenticated form vs Guest Invitation Card) */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-5">
              <div>
                <span className="text-xs text-slate-500 block">Monthly Rent</span>
                <div className="text-2xl font-black text-[#101A35] tabular-nums">
                  {formatPrice(property.rent)}
                  <span className="text-xs font-normal text-slate-500"> / month</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Security Deposit: {formatPrice(property.deposit)} · Zero Brokerage
                </div>
              </div>

              {isGuest ? (
                /* Guest Restricted State with Lock Icon & Call to Action */
                <div className="p-5 bg-gradient-to-b from-blue-50/70 to-indigo-50/40 border border-blue-200/90 rounded-2xl text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-white text-[#4169E1] flex items-center justify-center mx-auto shadow-sm border border-blue-100">
                    <Lock className="w-6 h-6" />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-[#101A35]">
                      Sign in to view full details and contact the owner.
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Send direct move-in requests, communicate move-in dates, and unlock complete address with direct landlord phone access.
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenAuthModal('Sign In to Contact Landlord', 'Login or create a free tenant account to send your enquiry instantly.')}
                      className="w-full py-2.5 px-4 font-bold text-white bg-[#4169E1] hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-600/30 transition-colors flex items-center justify-center gap-2 text-xs"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In to Send Enquiry</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleOpenAuthModal('Create Tenant Account', 'Sign up in seconds to save properties, message owners, and find your next home.');
                      }}
                      className="w-full py-2 px-4 font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors text-xs"
                    >
                      New to RentSpace? Create Account
                    </button>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Free for tenants · Zero hidden brokerage</span>
                  </div>
                </div>
              ) : property.ownerPhone ? (
                /* Unlocked Contact Card for Accepted Tenant / Owner / Admin */
                <div className="p-5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl space-y-4 shadow-sm">
                  <div className="flex items-center gap-2.5 text-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-sm font-extrabold text-emerald-950">
                        {user?._id === property.owner
                          ? 'Your Listed Property'
                          : user?.role === 'admin'
                          ? 'Admin Management'
                          : 'Enquiry Accepted · Contact Unlocked!'}
                      </h4>
                      <p className="text-[11px] text-emerald-800">
                        {user?._id === property.owner
                          ? 'You are managing this property.'
                          : 'The landlord accepted your move-in request. Direct contact is unlocked.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-emerald-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Landlord Contact Phone
                    </span>
                    <p className="text-base font-black text-slate-900 tracking-wide tabular-nums">
                      {property.ownerPhone}
                    </p>
                    <a
                      href={`tel:${property.ownerPhone}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call Landlord Now</span>
                    </a>
                  </div>

                  <div className="text-center pt-1">
                    <Link
                      to={user?.role === 'owner' ? '/dashboard/owner' : '/dashboard/tenant'}
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline"
                    >
                      {user?.role === 'owner' ? 'Go to Owner Dashboard →' : 'View in Tenant Dashboard →'}
                    </Link>
                  </div>
                </div>
              ) : (property.userEnquiryStatus === 'pending' || property.userEnquiryStatus === 'new') && !enquirySuccess ? (
                /* Pending Enquiry Banner */
                <div className="p-5 bg-amber-50 border border-amber-300 rounded-2xl space-y-3">
                  <div className="flex items-start gap-2.5 text-amber-900">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">Enquiry Under Review</h4>
                      <p className="text-xs text-amber-800 leading-relaxed mt-1">
                        You have already submitted a move-in request for this property. The owner will review your dates and either accept or decline.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Owner Contact Number Protected</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      The phone number will be displayed right here as soon as the owner accepts your enquiry.
                    </p>
                  </div>

                  <div className="text-center pt-1">
                    <Link
                      to="/dashboard/tenant"
                      className="text-xs font-bold text-[#4169E1] hover:underline"
                    >
                      Track Request in Tenant Dashboard →
                    </Link>
                  </div>
                </div>
              ) : enquirySuccess ? (
                /* Authenticated Success */
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-900">Enquiry Submitted!</h4>
                  <p className="text-xs text-emerald-700">
                    The owner has been notified with your contact details. To protect privacy, their phone number will be unlocked here once accepted.
                  </p>
                  <Link
                    to="/dashboard/tenant"
                    className="inline-block mt-2 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg"
                  >
                    View My Enquiries
                  </Link>
                </div>
              ) : (
                /* Authenticated Interactive Enquiry Form */
                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Expected Move-In Date
                    </label>
                    <input
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preferred Stay Duration
                    </label>
                    <select
                      value={preferredDuration}
                      onChange={(e) => setPreferredDuration(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 text-slate-700"
                    >
                      <option value="3 months">3 Months</option>
                      <option value="6 months">6 Months</option>
                      <option value="11 months">11 Months (Standard Agreement)</option>
                      <option value="1+ year">1+ Year Long-Term</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Message to Landlord
                    </label>
                    <textarea
                      value={enquiryMessage}
                      onChange={(e) => setEnquiryMessage(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingEnquiry}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#4169E1] hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-blue-600/30 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingEnquiry ? 'Sending Enquiry...' : 'Send Direct Enquiry'}</span>
                  </button>

                  <p className="text-[11px] text-slate-400 text-center leading-tight">
                    Your contact information is shared only with this property owner. No spam.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Related Properties */}
        {relatedProperties.length > 0 && (
          <div className="pt-8 border-t border-slate-200 space-y-4">
            <h3 className="text-xl font-bold text-[#101A35]">Similar Properties in {property.city}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProperties.map((rel) => (
                <PropertyCard
                  key={rel._id}
                  property={rel}
                  onRequireAuth={() => handleOpenAuthModal('Sign In to Save Property', 'Save properties to your shortlist to review later.')}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal for guest actions */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={authModalConfig.title}
        subtitle={authModalConfig.subtitle}
        onSuccess={() => {
          showNotification('Logged in successfully! Full listing details unlocked.', 'success');
        }}
      />

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-[#101A35]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Report This Listing</h3>
            </div>
            <p className="text-xs text-slate-500">
              Help our moderation team keep RentSpace secure and reliable. Please select a reason:
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                >
                  <option value="inaccurate_info">Inaccurate Rent or Location Details</option>
                  <option value="fake_photos">Fake or Stock Photos</option>
                  <option value="fraud_scam">Suspected Fraud or Scam</option>
                  <option value="already_rented">Property is Already Rented</option>
                  <option value="offensive_content">Offensive Content</option>
                  <option value="other">Other Violation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Details</label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={3}
                  placeholder="Explain why this listing violates guidelines..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-[#101A35]/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-red-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded">
                  Admin Action Required
                </span>
                <h3 className="text-base font-extrabold text-[#101A35] mt-0.5">
                  Permanently Delete Property?
                </h3>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 text-xs">
              <p className="font-bold text-slate-900">{property.title}</p>
              <p className="text-slate-500">{property.locality}, {property.city}</p>
              <p className="text-slate-500">Owner: {property.ownerName || 'Verified Host'}</p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This action cannot be undone. Permanently deleting this listing will remove it from all public searches, delete all associated tenant enquiries, and clear bookmarked shortlists.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingProperty}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingProperty}
                onClick={handleAdminDeleteProperty}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm shadow-red-600/30"
              >
                {isDeletingProperty ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Delete</span>
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
