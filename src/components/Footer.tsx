import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ShieldCheck, Mail, MapPin, Sparkles, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#101A35] text-slate-300 border-t border-slate-800 selection:bg-[#4169E1] selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white group">
              <div className="w-9 h-9 rounded-xl bg-[#4169E1] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-500 transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight font-black">RentSpace</span>
                <span className="text-[10px] tracking-widest text-[#B7B8FF] uppercase font-semibold">
                  Premium Living · Smarter Renting
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              RentSpace is an elite rental marketplace connecting students, tech workers, and urban professionals with hand-vetted residences, verified owners, and transparent pricing.
            </p>

            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#B7B8FF] font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#4169E1]" />
                <span>Verified Landlord Network</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Zero brokerage fees, direct owner communications, authentic photos from devices, and end-to-end security.
              </p>
            </div>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/explore?propertyType=studio" className="hover:text-white transition-colors">Studio Apartments</Link>
              </li>
              <li>
                <Link to="/explore?propertyType=flat" className="hover:text-white transition-colors">Flats & Residences</Link>
              </li>
              <li>
                <Link to="/explore?propertyType=pg" className="hover:text-white transition-colors">PG Accommodation</Link>
              </li>
              <li>
                <Link to="/explore?propertyType=shared_room" className="hover:text-white transition-colors">Shared Co-Living</Link>
              </li>
              <li>
                <Link to="/explore?propertyType=private_room" className="hover:text-white transition-colors">Private Rooms</Link>
              </li>
            </ul>
          </div>

          {/* Madhya Pradesh Locations */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Madhya Pradesh Hubs</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/explore?city=Indore" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Indore (Vijay Nagar, Palasia)</span>
                  <span className="text-[10px] text-blue-400 font-semibold">MP</span>
                </Link>
              </li>
              <li>
                <Link to="/explore?city=Bhopal" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Bhopal (MP Nagar, Arera Colony)</span>
                  <span className="text-[10px] text-blue-400 font-semibold">MP</span>
                </Link>
              </li>
              <li>
                <Link to="/explore?city=Ujjain" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Ujjain (Freeganj, Nanakheda)</span>
                  <span className="text-[10px] text-blue-400 font-semibold">MP</span>
                </Link>
              </li>
              <li>
                <Link to="/explore?city=Jabalpur" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Jabalpur (Civil Lines, Wright Town)</span>
                  <span className="text-[10px] text-blue-400 font-semibold">MP</span>
                </Link>
              </li>
              <li>
                <Link to="/explore?city=Gwalior" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Gwalior (City Centre, Lashkar)</span>
                  <span className="text-[10px] text-blue-400 font-semibold">MP</span>
                </Link>
              </li>
              <li>
                <Link to="/explore?city=Dewas" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Dewas (AB Road, Industrial Area)</span>
                  <span className="text-[10px] text-blue-400 font-semibold">MP</span>
                </Link>
              </li>
              <li>
                <Link to="/explore?city=Ratlam" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Ratlam (Station Road, Do Batti)</span>
                  <span className="text-[10px] text-blue-400 font-semibold">MP</span>
                </Link>
              </li>
              <li>
                <Link to="/explore?city=Sagar" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Sagar (Civil Lines, Makronia)</span>
                  <span className="text-[10px] text-blue-400 font-semibold">MP</span>
                </Link>
              </li>
              <li>
                <Link to="/explore?city=Rewa" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Rewa (Civil Lines, University Rd)</span>
                  <span className="text-[10px] text-blue-400 font-semibold">MP</span>
                </Link>
              </li>
              <li>
                <Link to="/explore?city=Satna" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Satna (Bharhut Nagar, Station Rd)</span>
                  <span className="text-[10px] text-blue-400 font-semibold">MP</span>
                </Link>
              </li>
              <li>
                <Link to="/explore?city=Khandwa" className="hover:text-white transition-colors flex items-center justify-between">
                  <span>Khandwa (Civil Lines, Anand Nagar)</span>
                  <span className="text-[10px] text-blue-400 font-semibold">MP</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links & Account */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Portals & Safety</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/list-property" className="hover:text-white transition-colors flex items-center gap-1 font-semibold text-[#B7B8FF]">
                  <span>List Your Property</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link to="/saved" className="hover:text-white transition-colors">Saved Shortlists</Link>
              </li>
              <li>
                <Link to="/dashboard/tenant" className="hover:text-white transition-colors">Tenant Dashboard</Link>
              </li>
              <li>
                <Link to="/dashboard/owner" className="hover:text-white transition-colors">Owner Desk</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-purple-300 transition-colors flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Trust & Safety Moderation</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} RentSpace Technologies Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Terms of Service</span>
            <span>·</span>
            <span>Landlord Verification Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
