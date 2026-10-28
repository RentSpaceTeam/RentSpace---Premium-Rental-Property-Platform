import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, ChevronDown, Check, Edit3, List, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MP_CITIES, isMPCity } from '../constants/mpCities';

interface CitySelectorProps {
  value: string;
  onChange: (city: string) => void;
  label?: string;
  placeholder?: string;
  allowAll?: boolean;
  allLabel?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  allowManualEntry?: boolean;
}

export const CitySelector: React.FC<CitySelectorProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Search & select city in Madhya Pradesh...',
  allowAll = false,
  allLabel = 'All Madhya Pradesh Cities',
  className = '',
  required = false,
  disabled = false,
  allowManualEntry = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [entryMode, setEntryMode] = useState<'dropdown' | 'manual'>('dropdown');
  const [manualCity, setManualCity] = useState(value === 'all' ? '' : value);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal manualCity when external value changes
  useEffect(() => {
    if (value && value !== 'all') {
      setManualCity(value);
    } else if (value === 'all') {
      setManualCity('');
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCities = MP_CITIES.filter((city) =>
    city.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const displayValue = () => {
    if (!value || (allowAll && value === 'all')) {
      return allowAll ? allLabel : '';
    }
    return value;
  };

  const handleSelect = (city: string) => {
    onChange(city);
    setManualCity(city === 'all' ? '' : city);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setManualCity(raw);
    onChange(raw.trim());
  };

  const isManualValidMP = manualCity.trim() ? isMPCity(manualCity.trim()) : true;

  return (
    <div className={`space-y-1.5 ${className}`} ref={wrapperRef}>
      {/* Label and mode toggle */}
      <div className="flex items-center justify-between">
        {label ? (
          <label className="block font-bold text-[#101A35] uppercase tracking-wider text-[11px]">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        ) : (
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            City in Madhya Pradesh {required && <span className="text-red-500">*</span>}
          </span>
        )}

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full hidden sm:inline">
            MP State Only
          </span>

          {allowManualEntry && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setEntryMode((prev) => (prev === 'dropdown' ? 'manual' : 'dropdown'));
                setIsOpen(false);
              }}
              className="text-[11px] font-semibold text-[#4169E1] hover:text-blue-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              {entryMode === 'dropdown' ? (
                <>
                  <Edit3 className="w-3 h-3" />
                  <span>Enter Manually</span>
                </>
              ) : (
                <>
                  <List className="w-3 h-3" />
                  <span>Choose from List</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {entryMode === 'manual' ? (
        /* Manual City Entry Control */
        <div className="space-y-1">
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              list="mp-city-datalist"
              disabled={disabled}
              value={manualCity}
              onChange={handleManualChange}
              placeholder="Type city or town in Madhya Pradesh (e.g. Indore, Bhopal, Satna)..."
              className={`w-full pl-9 pr-9 py-2.5 bg-[#F8F7F4] border rounded-xl text-xs transition-colors focus:outline-none focus:bg-white text-[#20283B] font-medium ${
                manualCity.trim() && !isManualValidMP
                  ? 'border-amber-400 focus:border-amber-500'
                  : 'border-[#EEF1F6] focus:border-[#4169E1]'
              }`}
            />
            {manualCity.trim() && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {isManualValidMP ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                )}
              </span>
            )}
            <datalist id="mp-city-datalist">
              {MP_CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {manualCity.trim() && (
            <div className="text-[11px]">
              {isManualValidMP ? (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> Verified city/town in Madhya Pradesh
                </span>
              ) : (
                <span className="text-amber-700 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  Please enter a valid city or district in Madhya Pradesh, India.
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Searchable MP Dropdown Control */
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (!disabled) {
                setIsOpen((prev) => !prev);
                setTimeout(() => inputRef.current?.focus(), 50);
              }
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-[#F8F7F4] border border-[#EEF1F6] rounded-xl text-xs transition-colors focus:outline-none focus:border-[#4169E1] focus:bg-white ${
              disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className={displayValue() ? 'text-[#20283B] font-medium' : 'text-slate-400'}>
                {displayValue() || placeholder}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Searchable Dropdown Popup */}
          {isOpen && (
            <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-72 flex flex-col">
              {/* Search box inside dropdown */}
              <div className="p-2 border-b border-slate-100 bg-slate-50/70">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type to filter 55+ MP cities..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#4169E1]"
                  />
                </div>
                <div className="mt-1 px-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Madhya Pradesh Districts & Towns</span>
                  <span>{filteredCities.length} available</span>
                </div>
              </div>

              {/* City options list */}
              <div className="overflow-y-auto max-h-56 divide-y divide-slate-50 text-xs">
                {allowAll && !searchTerm && (
                  <button
                    type="button"
                    onClick={() => handleSelect('all')}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-blue-50/60 transition-colors cursor-pointer ${
                      value === 'all' || !value ? 'bg-blue-50 text-[#4169E1] font-bold' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#4169E1]" />
                      <span>{allLabel}</span>
                    </div>
                    {(value === 'all' || !value) && <Check className="w-4 h-4 text-[#4169E1]" />}
                  </button>
                )}

                {filteredCities.length > 0 ? (
                  filteredCities.map((c) => {
                    const isSelected = value?.toLowerCase() === c.toLowerCase();
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleSelect(c)}
                        className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-50/70 text-[#4169E1] font-bold' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <span>{c}</span>
                          <span className="text-[10px] text-slate-400">, MP</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#4169E1]" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="p-3 text-center space-y-2">
                    <p className="text-slate-400 text-xs">
                      No matching MP city found for "{searchTerm}".
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEntryMode('manual');
                        setManualCity(searchTerm);
                        onChange(searchTerm.trim());
                        setIsOpen(false);
                      }}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      Enter "{searchTerm}" manually
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
