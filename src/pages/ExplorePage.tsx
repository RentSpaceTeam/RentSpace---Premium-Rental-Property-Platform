import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Building,
  Filter,
  Check
} from 'lucide-react';
import { PropertyCard } from '../components/PropertyCard';
import { Property } from '../types';
import { api } from '../services/api';
import { AuthModal } from '../components/AuthModal';
import { CitySelector } from '../components/CitySelector';
import { POPULAR_MP_CITIES } from '../constants/mpCities';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states initialized from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || 'all');
  const [locality, setLocality] = useState(searchParams.get('locality') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || 'all');
  const [furnishing, setFurnishing] = useState(searchParams.get('furnishing') || 'all');
  const [minRent, setMinRent] = useState(searchParams.get('minRent') || '');
  const [maxRent, setMaxRent] = useState(searchParams.get('maxRent') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    searchParams.get('amenities') ? searchParams.get('amenities')!.split(',') : []
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const availableAmenities = [
    'High-Speed WiFi',
    'Air Conditioning',
    'Power Backup',
    'Lift',
    '24/7 Security',
    'Nutritious Meals Included',
    'Housekeeping',
    'Covered Parking',
    'Washing Machine'
  ];

  const popularCities = ['All MP Cities', ...POPULAR_MP_CITIES];

  // Fetch properties from backend
  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const filters: Record<string, any> = {
        sortBy
      };

      if (search.trim()) filters.search = search.trim();
      if (city !== 'all') filters.city = city;
      if (locality.trim()) filters.locality = locality.trim();
      if (propertyType !== 'all') filters.propertyType = propertyType;
      if (furnishing !== 'all') filters.furnishing = furnishing;
      if (minRent) filters.minRent = Number(minRent);
      if (maxRent) filters.maxRent = Number(maxRent);
      if (bedrooms) filters.bedrooms = Number(bedrooms);
      if (selectedAmenities.length > 0) filters.amenities = selectedAmenities.join(',');

      const res = await api.getProperties(filters);
      if (res.success && res.properties) {
        setProperties(res.properties);
      }
    } catch (err) {
      console.error('Failed to query properties:', err);
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [city, propertyType, furnishing, bedrooms, sortBy, selectedAmenities]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleResetFilters = () => {
    setSearch('');
    setCity('all');
    setLocality('');
    setPropertyType('all');
    setFurnishing('all');
    setMinRent('');
    setMaxRent('');
    setBedrooms('');
    setSelectedAmenities([]);
    setSortBy('newest');
    setSearchParams({});
  };

  const categoryTabs = [
    { id: 'all', label: 'All Properties' },
    { id: 'pg', label: 'PG Accommodation' },
    { id: 'studio', label: 'Studio Apartments' },
    { id: 'flat', label: 'Flats & Apartments' },
    { id: 'shared_room', label: 'Shared Rooms' },
    { id: 'private_room', label: 'Private Rooms' }
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F4] py-8 text-[#20283B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title & Category Segmented Tabs */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#4169E1] mb-1">
                Verified Residences & PGs
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#101A35] tracking-tight">
                Explore Rental Properties
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {properties.length} {properties.length === 1 ? 'property' : 'properties'} available matching your search criteria
              </p>
            </div>

            {/* Mobile Filter Trigger Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#EEF1F6] rounded-xl text-xs font-bold text-[#101A35] shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#4169E1]" />
              <span>Filters ({[city !== 'all', propertyType !== 'all', minRent, maxRent, furnishing !== 'all', selectedAmenities.length > 0].filter(Boolean).length})</span>
            </button>
          </div>

          {/* Interactive Category Segmented Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPropertyType(tab.id)}
                className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  propertyType === tab.id
                    ? 'bg-[#101A35] text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-[#101A35] border border-[#EEF1F6]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Madhya Pradesh City Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              MP Cities:
            </span>
            <button
              type="button"
              onClick={() => setCity('all')}
              className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-semibold transition-all cursor-pointer ${
                city === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              All Madhya Pradesh
            </button>
            {POPULAR_MP_CITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCity(c)}
                className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-semibold transition-all cursor-pointer ${
                  city.toLowerCase() === c.toLowerCase()
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Sidebar Filters + Property Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block bg-white p-6 rounded-2xl border border-[#EEF1F6] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEF1F6]">
              <span className="text-sm font-bold text-[#101A35] flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#4169E1]" />
                Filter Options
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#4169E1] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-[11px] font-bold text-[#101A35] uppercase tracking-wider mb-1.5">
                Keyword or Title
              </label>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. WiFi, Room, Arera Colony..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[#F8F7F4] border border-[#EEF1F6] rounded-xl focus:outline-none focus:border-[#4169E1] focus:bg-white transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </form>
            </div>

            {/* City (All 55+ Madhya Pradesh Cities Allowed) */}
            <div>
              <CitySelector
                value={city}
                onChange={setCity}
                label="City / District"
                allowAll
                allLabel="All Madhya Pradesh Cities"
                placeholder="Search across 55+ MP cities..."
              />
            </div>

            {/* Rent Range */}
            <div>
              <label className="block text-[11px] font-bold text-[#101A35] uppercase tracking-wider mb-1.5">
                Monthly Rent (₹)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={minRent}
                  onChange={(e) => setMinRent(e.target.value)}
                  placeholder="Min ₹"
                  className="px-2.5 py-1.5 text-xs bg-[#F8F7F4] border border-[#EEF1F6] rounded-xl text-[#20283B] focus:outline-none focus:border-[#4169E1] transition-colors"
                />
                <input
                  type="number"
                  value={maxRent}
                  onChange={(e) => setMaxRent(e.target.value)}
                  placeholder="Max ₹"
                  className="px-2.5 py-1.5 text-xs bg-[#F8F7F4] border border-[#EEF1F6] rounded-xl text-[#20283B] focus:outline-none focus:border-[#4169E1] transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={fetchProperties}
                className="w-full mt-2.5 py-2 text-xs font-semibold bg-[#101A35] hover:bg-[#4169E1] text-white rounded-xl transition-all cursor-pointer shadow-xs active:scale-[0.99]"
              >
                Apply Rent Filter
              </button>
            </div>

            {/* Furnishing Status */}
            <div>
              <label className="block text-[11px] font-bold text-[#101A35] uppercase tracking-wider mb-1.5">
                Furnishing Status
              </label>
              <select
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8F7F4] border border-[#EEF1F6] rounded-xl text-[#20283B] focus:outline-none focus:border-[#4169E1] transition-colors"
              >
                <option value="all">Any Furnishing</option>
                <option value="fully-furnished">Fully Furnished</option>
                <option value="semi-furnished">Semi-Furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>

            {/* Minimum Bedrooms */}
            <div>
              <label className="block text-[11px] font-bold text-[#101A35] uppercase tracking-wider mb-1.5">
                Bedrooms / Capacity
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['', '1', '2', '3'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setBedrooms(num)}
                    className={`py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      bedrooms === num
                        ? 'bg-[#4169E1] text-white border-[#4169E1] shadow-xs'
                        : 'bg-[#F8F7F4] text-[#20283B] border-[#EEF1F6] hover:border-slate-300'
                    }`}
                  >
                    {num === '' ? 'Any' : `${num}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities Checkboxes */}
            <div>
              <label className="block text-[11px] font-bold text-[#101A35] uppercase tracking-wider mb-2">
                Amenities
              </label>
              <div className="space-y-2">
                {availableAmenities.map((amenity) => {
                  const checked = selectedAmenities.includes(amenity);
                  return (
                    <label
                      key={amenity}
                      className="flex items-center gap-2 text-xs text-[#20283B] cursor-pointer hover:text-[#4169E1] select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAmenity(amenity)}
                        className="rounded border-[#EEF1F6] text-[#4169E1] focus:ring-[#4169E1] h-3.5 w-3.5"
                      />
                      <span className="font-medium">{amenity}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Properties Grid Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Sorting bar */}
            <div className="bg-white px-5 py-3 rounded-2xl border border-[#EEF1F6] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-500">
                Displaying <strong className="text-[#101A35] font-bold">{properties.length}</strong> matching verified homes
              </span>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 bg-[#F8F7F4] border border-[#EEF1F6] rounded-xl text-[#20283B] font-semibold focus:outline-none focus:border-[#4169E1]"
                >
                  <option value="newest">Newest First</option>
                  <option value="rent_low">Rent: Low to High</option>
                  <option value="rent_high">Rent: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Results Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse space-y-3">
                    <div className="bg-slate-200 h-44 rounded-lg w-full" />
                    <div className="bg-slate-200 h-4 rounded w-3/4" />
                    <div className="bg-slate-200 h-4 rounded w-1/2" />
                    <div className="bg-slate-200 h-8 rounded w-full mt-4" />
                  </div>
                ))}
              </div>
            ) : properties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    onRequireAuth={() => setAuthModalOpen(true)}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">No properties found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    We could not find any properties matching all your filter criteria. Try expanding your search or clearing specific filters.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-base font-bold text-slate-900">Filter Properties</span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-md text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Keyword
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            {/* City */}
            <div>
              <CitySelector
                value={city}
                onChange={setCity}
                label="City / District"
                allowAll
                allLabel="All Madhya Pradesh Cities"
                placeholder="Search across 55+ MP cities..."
              />
            </div>

            {/* Rent Range */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Monthly Rent (₹)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={minRent}
                  onChange={(e) => setMinRent(e.target.value)}
                  placeholder="Min ₹"
                  className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
                <input
                  type="number"
                  value={maxRent}
                  onChange={(e) => setMaxRent(e.target.value)}
                  placeholder="Max ₹"
                  className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handleResetFilters();
                  setMobileFilterOpen(false);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => {
                  fetchProperties();
                  setMobileFilterOpen(false);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal for guest interactions */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Sign In to Save Property"
        subtitle="Sign in to save this property and manage your shortlist anytime from your Tenant Dashboard."
      />
    </div>
  );
};
