import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  LogIn,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PropertyType, FurnishingStatus } from '../types';
import { ImageUpload } from '../components/ImageUpload';
import { CitySelector } from '../components/CitySelector';

export const AddPropertyPage: React.FC = () => {
  const { user, showNotification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('studio');
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [city, setCity] = useState('Indore');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [furnishing, setFurnishing] = useState<FurnishingStatus>('semi-furnished');
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');

  // Amenities
  const availableAmenities = [
    'High-Speed WiFi',
    'Air Conditioning',
    'Power Backup',
    'Lift',
    '24/7 Security',
    'Nutritious Meals Included',
    'Housekeeping',
    'Covered Parking',
    'Washing Machine',
    'RO Water Purifier',
    'Balcony'
  ];
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'High-Speed WiFi',
    '24/7 Security'
  ]);

  // Real Device Uploaded Images
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!user) {
      showNotification('Sign in or create an owner account to list your property.', 'info');
      navigate('/auth?mode=login&role=owner&redirect=/list-property');
      return;
    }

    if (user.role === 'tenant') {
      const msg = 'Only verified Property Owners can publish listings. Please switch to or register an Owner account.';
      setFormError(msg);
      showNotification(msg, 'error');
      return;
    }

    // Mandatory Requirement: Images must come from device and at least one is required
    if (images.length === 0) {
      const msg = 'Please choose and upload at least one photograph from your device before publishing.';
      setFormError(msg);
      showNotification(msg, 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createProperty({
        title: title.trim(),
        description: description.trim(),
        propertyType,
        rent: Number(rent),
        deposit: Number(deposit || 0),
        city: city.trim(),
        locality: locality.trim(),
        address: address.trim(),
        furnishing,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        amenities: selectedAmenities,
        images: images,
        availability: 'available'
      });

      if (res.success) {
        showNotification('Property submitted successfully for moderation review!', 'success');
        navigate('/dashboard/owner');
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to submit property listing';
      setFormError(msg);
      showNotification(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is guest, show clear sign-in or create account banner with preserved destination
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] py-16 text-[#20283B]">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white p-8 rounded-3xl border border-[#EEF1F6] shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-[#101A35] text-white flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-8 h-8 text-[#4169E1]" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#4169E1] bg-blue-50 px-3 py-1 rounded-full">
                Owner Access Only
              </span>
              <h1 className="text-2xl font-black text-[#101A35]">
                List Your Rental Property
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Sign in or create an owner account to list your property. Verified owners can connect with thousands of active tech professionals and students.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                to="/auth?mode=login&role=owner&redirect=/list-property"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#101A35] hover:bg-[#4169E1] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In as Property Owner</span>
              </Link>

              <Link
                to="/auth?mode=register&role=owner&redirect=/list-property"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#F8F7F4] hover:bg-[#EEF1F6] text-[#101A35] text-xs font-bold rounded-xl border border-[#EEF1F6] transition-all"
              >
                <span>Register New Owner Account</span>
              </Link>
            </div>

            <div className="pt-4 border-t border-[#EEF1F6] flex items-center justify-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4169E1]" /> Direct tenant enquiries
              </span>
              <span>·</span>
              <span>Zero brokerage fees</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is a tenant, show prompt to switch role
  if (user.role === 'tenant') {
    return (
      <div className="min-h-screen bg-[#F8F7F4] py-16 text-[#20283B]">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white p-8 rounded-3xl border border-[#EEF1F6] shadow-sm text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-[#101A35]">Owner Account Required</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                You are currently signed in as a <strong>Tenant</strong> ({user.email}). Only property owners and landlords can list apartments and co-living rooms.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                to="/auth?mode=register&role=owner&redirect=/list-property"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#101A35] hover:bg-[#4169E1] text-white text-xs font-bold rounded-xl transition-colors"
              >
                <span>Register an Owner Account</span>
              </Link>

              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#F8F7F4] text-slate-700 text-xs font-semibold rounded-xl border border-[#EEF1F6] hover:bg-slate-100"
              >
                <span>Explore Rental Listings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] py-10 text-[#20283B]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#4169E1] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#EEF1F6] shadow-xs space-y-8">
          <div className="space-y-1.5 border-b border-[#EEF1F6] pb-5">
            <span className="text-[11px] font-bold text-[#4169E1] uppercase tracking-wider">
              Landlord & Host Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101A35] tracking-tight">
              Publish Your Rental Listing
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload genuine photographs from your device and enter exact property specifications. Approved listings appear instantly across all major tech hubs.
            </p>
          </div>

          {formError && (
            <div className="flex items-start gap-2.5 p-4 bg-red-50 border border-red-200/80 rounded-2xl text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span className="font-semibold">{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 text-xs">
            {/* 1. Property Images Section (Native Device Upload Only) */}
            <div className="space-y-3 p-5 sm:p-6 bg-[#F8F7F4]/60 rounded-2xl border border-[#EEF1F6]">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#101A35] uppercase tracking-wider block">
                  1. Property Photographs (From Device Only) *
                </span>
                <p className="text-xs text-slate-500">
                  Select genuine photos of the room, balcony, kitchen, or building facade. Preset images and stock photos have been disabled.
                </p>
              </div>

              <ImageUpload
                images={images}
                onChange={(updatedImages) => {
                  setImages(updatedImages);
                  setFormError(null);
                }}
                maxImages={8}
                maxSizeMB={5}
                onError={(err) => setFormError(err)}
              />
            </div>

            {/* 2. Core Listing Info */}
            <div className="space-y-5">
              <span className="text-xs font-bold text-[#101A35] uppercase tracking-wider block border-b border-[#EEF1F6] pb-2">
                2. Basic Details & Pricing
              </span>

              {/* Title */}
              <div>
                <label className="block font-bold text-[#101A35] uppercase tracking-wider text-[11px] mb-1.5">
                  Listing Headline / Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Skyline Heights Sunlit 1BHK Apartment in Vijay Nagar, Indore"
                  className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#EEF1F6] rounded-xl text-[#20283B] focus:outline-none focus:border-[#4169E1] focus:bg-white text-xs transition-colors"
                  required
                />
              </div>

              {/* Type & Furnishing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#101A35] uppercase tracking-wider text-[11px] mb-1.5">
                    Property Category *
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#EEF1F6] rounded-xl text-[#20283B] focus:outline-none focus:border-[#4169E1] text-xs"
                  >
                    <option value="pg">PG Accommodation</option>
                    <option value="studio">Studio Apartment</option>
                    <option value="flat">Flats & Apartments</option>
                    <option value="shared_room">Shared Room</option>
                    <option value="private_room">Private Room</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#101A35] uppercase tracking-wider text-[11px] mb-1.5">
                    Furnishing Status *
                  </label>
                  <select
                    value={furnishing}
                    onChange={(e) => setFurnishing(e.target.value as FurnishingStatus)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#EEF1F6] rounded-xl text-[#20283B] focus:outline-none focus:border-[#4169E1] text-xs"
                  >
                    <option value="fully-furnished">Fully Furnished</option>
                    <option value="semi-furnished">Semi-Furnished</option>
                    <option value="unfurnished">Unfurnished</option>
                  </select>
                </div>
              </div>

              {/* Rent & Deposit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#101A35] uppercase tracking-wider text-[11px] mb-1.5">
                    Monthly Rent (₹) *
                  </label>
                  <input
                    type="number"
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                    placeholder="e.g. 24000"
                    className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#EEF1F6] rounded-xl text-[#20283B] focus:outline-none focus:border-[#4169E1] focus:bg-white text-xs transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#101A35] uppercase tracking-wider text-[11px] mb-1.5">
                    Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#EEF1F6] rounded-xl text-[#20283B] focus:outline-none focus:border-[#4169E1] focus:bg-white text-xs transition-colors"
                  />
                </div>
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#101A35] uppercase tracking-wider text-[11px] mb-1.5">
                    Bedrooms / Capacity
                  </label>
                  <input
                    type="number"
                    value={bedrooms}
                    min={1}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#EEF1F6] rounded-xl text-[#20283B] focus:outline-none focus:border-[#4169E1] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#101A35] uppercase tracking-wider text-[11px] mb-1.5">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    value={bathrooms}
                    min={1}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#EEF1F6] rounded-xl text-[#20283B] focus:outline-none focus:border-[#4169E1] text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 3. Location Details */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#101A35] uppercase tracking-wider block border-b border-[#EEF1F6] pb-2">
                3. Location & Public vs Private Privacy
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <CitySelector
                    value={city}
                    onChange={(selectedCity) => setCity(selectedCity)}
                    label="City / District in Madhya Pradesh"
                    placeholder="Search any of 55+ MP cities..."
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#101A35] uppercase tracking-wider text-[11px] mb-1.5">
                    Locality / Sector (Publicly Visible) *
                  </label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Vijay Nagar, MP Nagar, Arera Colony, Civil Lines"
                    className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#EEF1F6] rounded-xl text-[#20283B] focus:outline-none focus:border-[#4169E1] focus:bg-white text-xs transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-[#101A35] uppercase tracking-wider text-[11px]">
                    Exact Street Address (Protected for Signed-In Users Only) *
                  </label>
                  <span className="text-[10px] text-[#4169E1] font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Hidden from Guests
                  </span>
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Flat 302, Royal Residency, AB Road"
                  className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-[#EEF1F6] rounded-xl text-[#20283B] focus:outline-none focus:border-[#4169E1] focus:bg-white text-xs transition-colors"
                  required
                />
              </div>
            </div>

            {/* 4. Description & Amenities */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#101A35] uppercase tracking-wider block border-b border-[#EEF1F6] pb-2">
                4. Description & Living Amenities
              </span>

              <div>
                <label className="block font-bold text-[#101A35] uppercase tracking-wider text-[11px] mb-1.5">
                  Residence Overview & Highlights *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe natural daylight, cross ventilation, proximity to tech parks/metro stations, housekeeping policies, and cooking facilities..."
                  className="w-full p-3 bg-[#F8F7F4] border border-[#EEF1F6] rounded-xl text-[#20283B] focus:outline-none focus:border-[#4169E1] focus:bg-white text-xs leading-relaxed transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#101A35] uppercase tracking-wider text-[11px] mb-2">
                  Select Included Amenities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {availableAmenities.map((amenity) => {
                    const checked = selectedAmenities.includes(amenity);
                    return (
                      <label
                        key={amenity}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer select-none text-xs ${
                          checked
                            ? 'bg-blue-50 border-blue-200 text-[#101A35] font-semibold'
                            : 'bg-[#F8F7F4] border-[#EEF1F6] text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAmenity(amenity)}
                          className="rounded border-[#EEF1F6] text-[#4169E1] focus:ring-[#4169E1] h-3.5 w-3.5"
                        />
                        <span>{amenity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-6 border-t border-[#EEF1F6] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                {images.length > 0 ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {images.length} photo{images.length > 1 ? 's' : ''} ready to publish
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    At least 1 photo required from device
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 sm:flex-none px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || images.length === 0}
                  className="flex-1 sm:flex-none px-7 py-3 font-bold text-white bg-[#101A35] hover:bg-[#4169E1] disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  {isSubmitting ? 'Publishing Listing...' : 'Publish Rental Listing'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
