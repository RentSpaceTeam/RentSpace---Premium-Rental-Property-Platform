import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Compass, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Property } from '../types';
import { api } from '../services/api';
import { PropertyCard } from '../components/PropertyCard';

export const SavedPropertiesPage: React.FC = () => {
  const { user, showNotification } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      showNotification('Please log in to view your saved properties.', 'info');
      navigate('/auth?mode=login&redirect=/saved');
      return;
    }
    loadSaved();
  }, [user]);

  const loadSaved = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSavedProperties();
      if (res.success && res.properties) {
        setProperties(res.properties);
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to load saved properties', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] py-8 text-[#20283B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EEF1F6] pb-5">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#4169E1] mb-1">
              Personal Shortlist
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101A35] tracking-tight">
              Saved Properties
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Your curated shortlist of bookmarked rooms, flats, and PG accommodations.
            </p>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4169E1] hover:text-blue-700"
          >
            <span>Browse More Listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse h-80 space-y-4">
                <div className="bg-slate-200 h-44 rounded-lg w-full" />
                <div className="bg-slate-200 h-4 rounded w-3/4" />
                <div className="bg-slate-200 h-4 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <PropertyCard
                key={prop._id}
                property={prop}
                initialSaved={true}
                onSaveToggle={(id, saved) => {
                  if (!saved) {
                    setProperties((prev) => prev.filter((p) => p._id !== id));
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Your shortlist is currently empty</h3>
              <p className="text-xs text-slate-500">
                Tap the heart icon on any property card while exploring to keep track of the listings you want to revisit.
              </p>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Properties Now</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
