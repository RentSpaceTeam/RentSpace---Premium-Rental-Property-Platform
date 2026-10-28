import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Sparkles, CheckCircle2, ArrowUpRight, Building2 } from 'lucide-react';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface PropertyCardProps {
  property: Property;
  initialSaved?: boolean;
  onSaveToggle?: (propertyId: string, isSaved: boolean) => void;
  onRequireAuth?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  initialSaved = false,
  onSaveToggle,
  onRequireAuth
}) => {
  const { user, showNotification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isSaving, setIsSaving] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryLabel = (type: string) => {
    switch (type) {
      case 'pg':
        return 'PG Accommodation';
      case 'studio':
        return 'Studio Apartment';
      case 'flat':
        return 'Apartment / Flat';
      case 'shared_room':
        return 'Shared Room';
      case 'private_room':
        return 'Private Room';
      default:
        return type;
    }
  };

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      if (onRequireAuth) {
        onRequireAuth();
        return;
      }
      showNotification('Sign in to save properties to your shortlist.', 'info');
      navigate(`/auth?mode=login&redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }

    try {
      setIsSaving(true);
      const nextSaved = !isSaved;
      setIsSaved(nextSaved);
      const res = await api.toggleSaveProperty(property._id);
      setIsSaved(res.saved);
      showNotification(res.message, 'success');
      if (onSaveToggle) {
        onSaveToggle(property._id, res.saved);
      }
    } catch (err: any) {
      setIsSaved(isSaved);
      showNotification(err.message || 'Could not update favorites', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const hasImage = property.images && property.images.length > 0 && !imageError;
  const mainImage = hasImage ? property.images[0] : null;

  return (
    <div className="group bg-white rounded-2xl border border-[#EEF1F6] shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full hover:-translate-y-1">
      {/* Property Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {hasImage && mainImage ? (
          <img
            src={mainImage}
            alt={property.title}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
          />
        ) : (
          /* Neutral Architectural Placeholder */
          <div className="w-full h-full bg-[#F8F7F4] flex flex-col items-center justify-center p-6 text-center border-b border-[#EEF1F6]">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#EEF1F6] flex items-center justify-center text-[#4169E1] shadow-2xs mb-2">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-[#101A35]">RentSpace Verified</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Photography pending upload</span>
          </div>
        )}

        {/* Unboxed / Refined Trust Overlay Tags */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {property.isVerified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-white/95 text-[#101A35] rounded-md backdrop-blur-sm shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4169E1]" />
              Verified
            </span>
          )}
          {property.isFeatured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-[#101A35] text-white rounded-md shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#B7B8FF]" />
              Featured
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={handleToggleSave}
          disabled={isSaving}
          aria-label={isSaved ? 'Remove from saved' : 'Save property'}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 active:scale-90 shadow-sm cursor-pointer ${
            isSaved
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Availability Badge */}
        {property.availability === 'rented' && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3.5 py-1.5 bg-white text-slate-900 text-xs font-bold rounded-lg uppercase tracking-wider shadow-md">
              Currently Rented
            </span>
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Unboxed Metadata Header: Clean anti-slop typography */}
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            <span className="text-[#4169E1]">{getCategoryLabel(property.propertyType)}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-600">{property.furnishing.replace('-', ' ')}</span>
          </div>

          {/* Title */}
          <Link to={`/properties/${property._id}`}>
            <h3 className="text-base font-bold text-[#101A35] group-hover:text-[#4169E1] transition-colors line-clamp-1 leading-snug">
              {property.title}
            </h3>
          </Link>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 mb-3 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{property.locality}, {property.city}</span>
          </div>

          {/* Specs: Bed & Bath */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 py-2.5 border-y border-[#EEF1F6]">
            <div className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.bedrooms} {property.propertyType === 'pg' || property.propertyType === 'shared_room' ? 'Occupancy' : 'Beds'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-3.5 h-3.5 text-slate-400" />
              <span>{property.bathrooms} Bath</span>
            </div>
            {property.averageRating > 0 && (
              <div className="flex items-center gap-1 ml-auto text-amber-600 font-bold">
                <span>★ {property.averageRating}</span>
                <span className="text-slate-400 text-[11px] font-normal">({property.reviewCount})</span>
              </div>
            )}
          </div>

          {/* Clean amenities text preview */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="mt-2.5 text-[11px] font-medium text-slate-500 line-clamp-1">
              {property.amenities.slice(0, 3).join(' · ')}
              {property.amenities.length > 3 && ` +${property.amenities.length - 3} more`}
            </div>
          )}
        </div>

        {/* Pricing & Action */}
        <div className="mt-4 pt-3.5 border-t border-[#EEF1F6] flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider leading-none mb-1">
              Monthly Rent
            </span>
            <div className="text-lg font-extrabold text-[#101A35] tabular-nums leading-none">
              {formatPrice(property.rent)}
              <span className="text-xs font-normal text-slate-500">/mo</span>
            </div>
          </div>

          <Link
            to={`/properties/${property._id}`}
            className="flex items-center gap-1 px-3.5 py-2 text-xs font-bold text-[#101A35] bg-[#F8F7F4] hover:bg-[#4169E1] hover:text-white rounded-xl transition-all shadow-2xs whitespace-nowrap"
          >
            <span>View Space</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
