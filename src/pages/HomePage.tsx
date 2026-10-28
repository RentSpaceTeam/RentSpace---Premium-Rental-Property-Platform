import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Building,
  Home,
  Users,
  Compass,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Clock,
  Key,
  Shield,
  Star,
  MapPin,
  Bed,
  Bath,
  Check,
  Layers,
  Award,
  ArrowUpRight
} from 'lucide-react';
import { PropertyCard } from '../components/PropertyCard';
import { Property } from '../types';
import { api } from '../services/api';
import { AuthModal } from '../components/AuthModal';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Search panel state
  const [searchLocation, setSearchLocation] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    async function loadProperties() {
      try {
        const res = await api.getProperties();
        if (res.success && res.properties) {
          setAllProperties(res.properties);

          // Featured properties (either isFeatured === true or high-rated)
          const featured = res.properties.filter((p) => p.isFeatured);
          const fallbackFeatured = featured.length >= 4 ? featured : res.properties.slice(0, 4);
          setFeaturedProperties(fallbackFeatured);

          // Recently added properties (sorted newest first)
          const sorted = [...res.properties].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setRecentProperties(sorted.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load homepage properties:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProperties();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocation.trim()) params.append('search', searchLocation.trim());
    if (searchType !== 'all') params.append('propertyType', searchType);
    if (minRent) params.append('minRent', minRent);
    if (maxRent) params.append('maxRent', maxRent);
    navigate(`/explore?${params.toString()}`);
  };

  // 5 distinct categories as requested: PGs, shared rooms, private rooms, studios and flats
  const categories = [
    {
      type: 'pg',
      title: 'PG Accommodation',
      subtitle: 'Nutritious meals, housekeeping & high-speed WiFi',
      startingAt: '₹12,000',
      image: '/src/assets/images/property_pg_accommodation_1792498407710.jpg',
      badge: 'All-Inclusive Stays'
    },
    {
      type: 'shared_room',
      title: 'Shared Rooms',
      subtitle: 'Vibrant co-living with verified flatmates & split bills',
      startingAt: '₹8,500',
      image: '/src/assets/images/property_shared_room_1792498408810.jpg',
      badge: 'Affordable Living'
    },
    {
      type: 'private_room',
      title: 'Private Rooms',
      subtitle: 'Personal bedroom & attached washroom in luxury towers',
      startingAt: '₹15,000',
      image: '/src/assets/images/property_studio_apartment_1792498408044.jpg',
      badge: 'Personal Sanctuary'
    },
    {
      type: 'studio',
      title: 'Studio Apartments',
      subtitle: 'Sunlit designer studios with full independence & kitchens',
      startingAt: '₹22,000',
      image: '/src/assets/images/modern_luxury_penthouse_1792564120919.jpg',
      badge: 'Complete Privacy'
    },
    {
      type: 'flat',
      title: 'Flats & Residences',
      subtitle: 'Spacious 1, 2 & 3 BHK homes in gated communities',
      startingAt: '₹32,000',
      image: '/src/assets/images/modern_facade_building_1792564135075.jpg',
      badge: 'Gated Societies'
    }
  ];

  const filteredShowcase = activeCategoryFilter === 'all'
    ? featuredProperties
    : allProperties.filter((p) => p.propertyType === activeCategoryFilter).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#20283B]">
      {/* Hero Section */}
      <section className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden border-b border-[#EEF1F6]">
        {/* Subtle architectural background pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#101A35_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Editorial Eyebrow */}
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-[#4169E1] bg-white border border-[#EEF1F6] px-3.5 py-1.5 rounded-lg shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#4169E1] animate-pulse" />
                <span>Premium Living · Smarter Renting</span>
              </div>

              {/* Exact Requested Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#101A35] leading-[1.12]">
                Your next chapter <br />
                <span className="text-[#4169E1]">starts at home.</span>
              </h1>

              {/* Exact Requested Supporting Text */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Discover thoughtfully chosen rooms, apartments and homes that fit the way you live.
                Direct owner communication with verified zero-brokerage listings across Madhya Pradesh.
              </p>

              {/* Large, Beautiful Floating Search Panel */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xl shadow-slate-200/60 border border-[#EEF1F6] mt-4">
                <form onSubmit={handleSearchSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Location */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#101A35] uppercase tracking-wider mb-1.5">
                        City or Locality
                      </label>
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchLocation}
                          onChange={(e) => setSearchLocation(e.target.value)}
                          placeholder="e.g. Vijay Nagar, MP Nagar, Arera Colony, Indore"
                          className="w-full pl-10 pr-3 py-2.5 text-sm bg-[#F8F7F4] border border-[#EEF1F6] rounded-xl focus:outline-none focus:border-[#4169E1] focus:bg-white transition-colors placeholder:text-slate-400 font-medium"
                        />
                      </div>
                    </div>

                    {/* Property Type */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#101A35] uppercase tracking-wider mb-1.5">
                        Property Type
                      </label>
                      <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-[#EEF1F6] rounded-xl focus:outline-none focus:border-[#4169E1] focus:bg-white transition-colors text-slate-800 font-medium"
                      >
                        <option value="all">All Categories</option>
                        <option value="pg">PG Accommodation</option>
                        <option value="shared_room">Shared Room</option>
                        <option value="private_room">Private Room</option>
                        <option value="studio">Studio Apartment</option>
                        <option value="flat">Flats & Residences</option>
                      </select>
                    </div>
                  </div>

                  {/* Rent Range & Submit Button */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Min Rent (₹)
                      </label>
                      <input
                        type="number"
                        value={minRent}
                        onChange={(e) => setMinRent(e.target.value)}
                        placeholder="₹ 5,000"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-[#EEF1F6] rounded-xl focus:outline-none focus:border-[#4169E1] focus:bg-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Max Rent (₹)
                      </label>
                      <input
                        type="number"
                        value={maxRent}
                        onChange={(e) => setMaxRent(e.target.value)}
                        placeholder="₹ 60,000"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-[#EEF1F6] rounded-xl focus:outline-none focus:border-[#4169E1] focus:bg-white font-medium"
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#4169E1] hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/30 transition-all hover:shadow-lg active:scale-[0.99] cursor-pointer"
                      >
                        <Search className="w-4 h-4" />
                        <span>Find Spaces</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Quick Hub Filter Bar */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-500">
                <span className="font-bold text-[#101A35] uppercase tracking-wider text-[11px]">Popular MP Cities:</span>
                <button
                  type="button"
                  onClick={() => navigate('/explore?city=Indore')}
                  className="px-2.5 py-1 rounded-md bg-white border border-[#EEF1F6] hover:border-[#4169E1] hover:text-[#4169E1] transition-colors font-medium"
                >
                  Indore
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/explore?city=Bhopal')}
                  className="px-2.5 py-1 rounded-md bg-white border border-[#EEF1F6] hover:border-[#4169E1] hover:text-[#4169E1] transition-colors font-medium"
                >
                  Bhopal
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/explore?city=Gwalior')}
                  className="px-2.5 py-1 rounded-md bg-white border border-[#EEF1F6] hover:border-[#4169E1] hover:text-[#4169E1] transition-colors font-medium"
                >
                  Gwalior
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/explore?city=Jabalpur')}
                  className="px-2.5 py-1 rounded-md bg-white border border-[#EEF1F6] hover:border-[#4169E1] hover:text-[#4169E1] transition-colors font-medium"
                >
                  Jabalpur
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/explore?city=Ujjain')}
                  className="px-2.5 py-1 rounded-md bg-white border border-[#EEF1F6] hover:border-[#4169E1] hover:text-[#4169E1] transition-colors font-medium"
                >
                  Ujjain
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/explore?city=Sagar')}
                  className="px-2.5 py-1 rounded-md bg-white border border-[#EEF1F6] hover:border-[#4169E1] hover:text-[#4169E1] transition-colors font-medium"
                >
                  Sagar
                </button>
              </div>
            </div>

            {/* Right Media: Asymmetric Magazine Composition */}
            <div className="lg:col-span-5 relative">
              <div className="relative">
                {/* Main Architectural Showcase Card */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-900 group">
                  <img
                    src="/src/assets/images/modern_luxury_penthouse_1792564120919.jpg"
                    alt="Modern sunlit living space with skyline windows"
                    referrerPolicy="no-referrer"
                    className="w-full h-[480px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101A35] via-[#101A35]/30 to-transparent flex flex-col justify-end p-6 sm:p-7">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/20 backdrop-blur-md text-white text-xs font-bold w-fit mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#B7B8FF]" />
                      <span>Featured Curator Selection</span>
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      Skyline Heights Penthouse & Studio
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      Vijay Nagar, Indore, Madhya Pradesh · ₹24,000/mo
                    </p>
                  </div>
                </div>

                {/* Floating Architectural Badge Overlay */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-[#EEF1F6] hidden sm:flex items-center gap-3 max-w-xs">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#4169E1] flex items-center justify-center font-bold shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#101A35]">100% In-Person Verified</p>
                    <p className="text-[11px] text-slate-500">Every photo, amenity & title verified by RentSpace team.</p>
                  </div>
                </div>

                {/* Floating Star Rating Overlay */}
                <div className="absolute top-6 -right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-[#EEF1F6] hidden sm:flex items-center gap-2 text-xs font-bold text-[#101A35]">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>4.9 / 5.0 Tenant Rating</span>
                </div>
              </div>
            </div>
          </div>

          {/* Value Metric Bar */}
          <div className="mt-16 pt-8 border-t border-[#EEF1F6] grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#101A35]">0%</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Brokerage Commission</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#101A35]">100%</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Direct Landlords</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#101A35]">55 Districts</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Across Madhya Pradesh</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#101A35]">&lt; 1 hr</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Avg Enquiry Response</p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Category (All 5 Categories: PGs, shared rooms, private rooms, studios, flats) */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#EEF1F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[11px] font-bold text-[#4169E1] uppercase tracking-wider block mb-1">
                Property Categories
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#101A35] tracking-tight">
                Browse by Property Type
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                Tailored living spaces for every stage of your college journey, tech career, or family life.
              </p>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4169E1] hover:text-blue-700 transition-colors"
            >
              <span>Explore All Categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.type}
                to={`/explore?propertyType=${cat.type}`}
                className="group relative rounded-2xl overflow-hidden border border-[#EEF1F6] bg-white shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-[#101A35] rounded-md shadow-xs">
                      {cat.badge}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#101A35] group-hover:text-[#4169E1] transition-colors leading-snug">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {cat.subtitle}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#EEF1F6] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">From</span>
                      <span className="font-extrabold text-[#101A35] tabular-nums">{cat.startingAt}/mo</span>
                    </div>
                    <span className="w-7 h-7 rounded-full bg-[#F8F7F4] group-hover:bg-[#4169E1] group-hover:text-white text-slate-700 flex items-center justify-center transition-colors">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Editorial Collection with Interactive Category Switcher */}
      <section className="py-16 sm:py-20 bg-[#F8F7F4] border-b border-[#EEF1F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-[11px] font-bold text-[#4169E1] uppercase tracking-wider block mb-1">
                Editorial Showcase
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#101A35] tracking-tight">
                Featured Properties
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Handpicked listings with verified landlords, exceptional amenities, and high tenant ratings.
              </p>
            </div>

            {/* Filter Tabs for Quick Browsing */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-[#EEF1F6] rounded-xl overflow-x-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategoryFilter === 'all'
                    ? 'bg-[#101A35] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Featured
              </button>
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('studio')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategoryFilter === 'studio'
                    ? 'bg-[#101A35] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Studios
              </button>
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('flat')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategoryFilter === 'flat'
                    ? 'bg-[#101A35] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Flats
              </button>
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('pg')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategoryFilter === 'pg'
                    ? 'bg-[#101A35] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PGs
              </button>
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('shared_room')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategoryFilter === 'shared_room'
                    ? 'bg-[#101A35] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Shared
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-[#EEF1F6] p-4 animate-pulse h-80 space-y-4">
                  <div className="bg-slate-200 h-44 rounded-xl w-full" />
                  <div className="bg-slate-200 h-4 rounded w-3/4" />
                  <div className="bg-slate-200 h-4 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredShowcase.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredShowcase.map((prop) => (
                <PropertyCard
                  key={prop._id}
                  property={prop}
                  onRequireAuth={() => setAuthModalOpen(true)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#EEF1F6]">
              <p className="text-slate-500 text-sm">No properties found in this category.</p>
              <button
                onClick={() => setActiveCategoryFilter('all')}
                className="mt-3 px-4 py-2 text-xs font-bold text-white bg-[#4169E1] rounded-lg"
              >
                View All Featured
              </button>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-[#EEF1F6] text-sm font-bold text-[#101A35] hover:bg-slate-50 shadow-xs transition-all hover:shadow-md"
            >
              <span>Explore All {allProperties.length} Available Listings</span>
              <ArrowRight className="w-4 h-4 text-[#4169E1]" />
            </Link>
          </div>
        </div>
      </section>

      {/* Fresh / Recently Added Properties Section */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#EEF1F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Fresh Arrivals
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#101A35] tracking-tight mt-1">
                Recently Added Properties
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Newly approved verified properties fresh on the market. Be among the first to connect!
              </p>
            </div>
            <Link
              to="/explore?sortBy=newest"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4169E1] hover:text-blue-700 transition-colors"
            >
              <span>View Latest Listings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-[#EEF1F6] p-4 animate-pulse h-80 space-y-4">
                  <div className="bg-slate-200 h-44 rounded-xl w-full" />
                  <div className="bg-slate-200 h-4 rounded w-3/4" />
                  <div className="bg-slate-200 h-4 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : recentProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentProperties.map((prop) => (
                <PropertyCard
                  key={prop._id}
                  property={prop}
                  onRequireAuth={() => setAuthModalOpen(true)}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#EEF1F6]">
              <p className="text-slate-500 text-sm">No recent listings available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Why RentSpace / Core Platform Advantages */}
      <section className="py-16 sm:py-20 bg-[#F8F7F4] border-b border-[#EEF1F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-bold text-[#4169E1] uppercase tracking-wider">
              Zero Middlemen. Pure Transparency.
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#101A35] tracking-tight mt-1">
              Why Discerning Renters Choose RentSpace
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Engineered to resolve real pain points: fake broker photos, inflated commission fees, and zero landlord response.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-7 rounded-2xl border border-[#EEF1F6] bg-white shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#4169E1] flex items-center justify-center font-bold border border-blue-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#101A35]">Zero Brokerage Fees</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect directly with property owners and PG hosts. Save anywhere between ₹15,000 to ₹60,000 in arbitrary broker commissions on your move.
              </p>
              <div className="pt-2 text-[11px] font-bold text-[#4169E1] flex items-center gap-1">
                <span>100% Direct Landlord Deals</span>
              </div>
            </div>

            <div className="p-7 rounded-2xl border border-[#EEF1F6] bg-white shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#4169E1] flex items-center justify-center font-bold border border-blue-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#101A35]">Rigorous Listing Moderation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every newly listed flat or PG is audited by our administrative team before going live, preventing duplicate listings, stock photography, and scam attempts.
              </p>
              <div className="pt-2 text-[11px] font-bold text-[#4169E1] flex items-center gap-1">
                <span>Admin Checked Ownership</span>
              </div>
            </div>

            <div className="p-7 rounded-2xl border border-[#EEF1F6] bg-white shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#4169E1] flex items-center justify-center font-bold border border-blue-100">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#101A35]">Digital Move-In Enquiries</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Send structured move-in requests, choose duration of stay, schedule in-person walkthroughs, and track owner updates right inside your tenant portal.
              </p>
              <div className="pt-2 text-[11px] font-bold text-[#4169E1] flex items-center gap-1">
                <span>Integrated Message Tracker</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Madhya Pradesh City Showcase */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#EEF1F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[11px] font-bold text-[#4169E1] uppercase tracking-wider block mb-1">
                Madhya Pradesh Destinations
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#101A35] tracking-tight">
                Explore Top Rental Markets in MP
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Premium spaces across all 55 districts and major university & commercial centers of Madhya Pradesh.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { city: 'Indore', areas: 'Vijay Nagar, Palasia, Bhawarkua', count: '50+ Spaces', img: '/src/assets/images/hero_rental_home_1792498408215.jpg' },
              { city: 'Bhopal', areas: 'MP Nagar, Arera Colony, Kolar', count: '40+ Spaces', img: '/src/assets/images/modern_facade_building_1792564135075.jpg' },
              { city: 'Jabalpur', areas: 'Civil Lines, Wright Town, Napier Town', count: '25+ Spaces', img: '/src/assets/images/property_luxury_flat_1792498408260.jpg' },
              { city: 'Gwalior', areas: 'City Centre, Lashkar, Morar', count: '20+ Spaces', img: '/src/assets/images/property_studio_apartment_1792498408044.jpg' },
              { city: 'Ujjain', areas: 'Freeganj, Nanakheda, Rishi Nagar', count: '18+ Spaces', img: '/src/assets/images/modern_luxury_penthouse_1792564120919.jpg' },
            ].map((hub) => (
              <button
                key={hub.city}
                type="button"
                onClick={() => navigate(`/explore?city=${hub.city}`)}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] text-left border border-[#EEF1F6] shadow-xs hover:shadow-xl transition-all cursor-pointer"
              >
                <img
                  src={hub.img}
                  alt={hub.city}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101A35] via-[#101A35]/40 to-transparent p-5 flex flex-col justify-end text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                    {hub.count}
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-white group-hover:text-blue-200 transition-colors">
                    {hub.city}
                  </h3>
                  <p className="text-[11px] text-slate-300 truncate mt-0.5">
                    {hub.areas}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works (Simple 3 Steps) */}
      <section className="py-16 sm:py-20 bg-[#F8F7F4] border-b border-[#EEF1F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-bold text-[#4169E1] uppercase tracking-wider">
              Seamless Journey
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#101A35] tracking-tight mt-1">
              How RentSpace Works
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              From finding your ideal property to signing the rental agreement without stress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-2xl border border-[#EEF1F6] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#101A35] text-white font-bold text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="text-base font-bold text-[#101A35]">Discover & Shortlist Spaces</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter verified rooms, PGs, or flats by monthly budget, furnishing level, and amenities. Save your favorite homes to your shortlist.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-[#EEF1F6] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#4169E1] text-white font-bold text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="text-base font-bold text-[#101A35]">Send Direct Move-In Enquiry</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide your targeted move-in date and duration of stay. The landlord is notified and coordinates an in-person walkthrough directly.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-[#EEF1F6] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="text-base font-bold text-[#101A35]">Walkthrough & Agreement</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tour the residence, test the high-speed WiFi, inspect furnishings, and complete your rental agreement with zero hidden charges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Owner Call to Action: Editorial Luxury Banner */}
      <section className="py-16 sm:py-20 bg-[#101A35] text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none bg-[radial-gradient(#4169E1_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-r from-slate-900 to-[#101A35] p-8 sm:p-12 lg:p-14 rounded-3xl border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-3 py-1 rounded-md border border-blue-900">
                <Sparkles className="w-3.5 h-3.5" />
                <span>For Property Owners & PG Hosts</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Have a vacant room, flat, or PG? <br />
                <span className="text-[#4169E1]">List with complete confidence.</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                List your space on RentSpace to connect directly with working tech professionals, young graduates, and verified students. Manage inquiries, schedule visits, and track occupancy from a dedicated landlord console with zero listing fees.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 shrink-0 w-full lg:w-auto">
              <Link
                to="/list-property"
                className="px-6 py-3.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all text-center shadow-lg hover:shadow-xl active:scale-[0.99]"
              >
                List Your Property Free
              </Link>
              <Link
                to="/explore"
                className="px-6 py-3.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors text-center"
              >
                Browse All Stays
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal for guest actions */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Sign In to Save Property"
        subtitle="Sign in to save this property to your shortlist and manage favorites from your Tenant Dashboard."
      />
    </div>
  );
};
