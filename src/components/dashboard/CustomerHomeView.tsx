import React, { useState, useEffect } from 'react';
import { Search, MapPin, Zap, Droplets, Hammer, Sprout, Wrench, Paintbrush, Sparkles, Truck, Phone, Star, ShieldCheck, ArrowRight, PlusCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { api } from '../../api/client.ts';
import { WorkerDetail, ServiceCategory } from '../../types/index.ts';

interface CustomerHomeViewProps {
  onSelectCategory: (slug: string) => void;
  onSearch: (skill: string, city: string) => void;
  onPostJob: () => void;
  onNavigateWorkers: () => void;
  onNavigateAgri: () => void;
}

export const CustomerHomeView: React.FC<CustomerHomeViewProps> = ({
  onSelectCategory,
  onSearch,
  onPostJob,
  onNavigateWorkers,
  onNavigateAgri,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(user?.city || 'Pune');
  const [topWorkers, setTopWorkers] = useState<WorkerDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);

  const popularCities = ['Pune', 'New Delhi', 'Mumbai', 'Ludhiana', 'Jaipur', 'Varanasi', 'Bengaluru'];

  const categories = [
    {
      id: 'cat-elec',
      slug: 'electrician',
      name: 'Electrician',
      name_hi: 'इलेक्ट्रीशियन',
      icon: Zap,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      description: 'Wiring, MCBs, inverter & fans',
    },
    {
      id: 'cat-plumb',
      slug: 'plumber',
      name: 'Plumber',
      name_hi: 'नलसाज़ (प्लंबर)',
      icon: Droplets,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      description: 'Pipe leaks, taps & water tanks',
    },
    {
      id: 'cat-carp',
      slug: 'carpenter',
      name: 'Carpenter',
      name_hi: 'बढ़ई (कारपेंटर)',
      icon: Hammer,
      color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      description: 'Furniture, doors & wood repairs',
    },
    {
      id: 'cat-agri',
      slug: 'agricultural-worker',
      name: 'Agricultural Worker',
      name_hi: 'कृषि व खेत मजदूर',
      icon: Sprout,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      description: 'Harvesting, tractor & sowing',
    },
    {
      id: 'cat-mason',
      slug: 'mason',
      name: 'Mason / Rajmistri',
      name_hi: 'राजमिस्त्री',
      icon: Wrench,
      color: 'bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-500/20',
      description: 'Brickwork, plaster & tiling',
    },
    {
      id: 'cat-paint',
      slug: 'painter',
      name: 'Painter',
      name_hi: 'पेंटर',
      icon: Paintbrush,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      description: 'Interior, exterior & waterproofing',
    },
    {
      id: 'cat-clean',
      slug: 'cleaner',
      name: 'Cleaning & Housekeeping',
      name_hi: 'सफाई कर्मचारी',
      icon: Sparkles,
      color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      description: 'Deep cleaning, floor & tanks',
    },
    {
      id: 'cat-mech',
      slug: 'mechanic',
      name: 'Mechanic & Driver',
      name_hi: 'मैकेनिक व चालक',
      icon: Truck,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      description: 'Two-wheelers, pumps & tractors',
    },
  ];

  useEffect(() => {
    const fetchTopWorkers = async () => {
      try {
        setLoading(true);
        const data = await api.get('/api/workers?sort=rating');
        if (Array.isArray(data)) {
          setTopWorkers(data.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to fetch top workers:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchMyEnquiries = async () => {
      if (user) {
        try {
          const res = await api.get('/api/enquiries/my');
          if (Array.isArray(res)) {
            setRecentEnquiries(res.slice(0, 2));
          }
        } catch {}
      }
    };

    fetchTopWorkers();
    fetchMyEnquiries();
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, selectedCity);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Welcome & Location Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {user ? `Namaste, ${user.full_name}` : 'Welcome to JobBond'}
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {t('customerHomeTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('customerHomeSubtitle')}
          </p>
        </div>

        {/* Location Dropdown Pill */}
        <div className="flex items-center gap-2 self-start sm:self-center bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            {popularCities.map((c) => (
              <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Instant Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="flex items-center rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-within:border-emerald-600 dark:focus-within:border-emerald-500 shadow-md shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all">
          <div className="pl-4 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search electrician, plumber, harvesting labor, carpenter..."
            className="w-full px-3.5 py-4 text-sm sm:text-base text-slate-900 dark:text-white bg-transparent focus:outline-none placeholder:text-slate-400 placeholder:text-xs sm:placeholder:text-sm"
          />
          <button
            type="submit"
            className="px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm tracking-wide shrink-0 transition-colors"
          >
            Find
          </button>
        </div>
      </form>

      {/* 8 Core Category Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Popular Services in {selectedCity}
          </h2>
          <button
            type="button"
            onClick={onNavigateWorkers}
            className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => onSelectCategory(cat.slug)}
                className="p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all text-left flex flex-col justify-between group"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ring-1 ${cat.color} group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {cat.name_hi}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {cat.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Post a Work Request Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-700/15 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div>
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Direct & Zero Middleman Cut
          </span>
          <h3 className="text-xl sm:text-2xl font-black">
            Need urgent repairs or farm workers?
          </h3>
          <p className="text-sm text-emerald-100 mt-1 max-w-xl">
            Post your work requirements with your preferred daily wage or fixed budget. Available local workers will contact you immediately.
          </p>
        </div>
        <button
          type="button"
          onClick={onPostJob}
          className="w-full sm:w-auto px-6 py-3.5 bg-white text-emerald-800 hover:bg-emerald-50 font-bold rounded-2xl shadow-md transition-all shrink-0 flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-5 h-5 text-emerald-600" />
          <span>Post Work Request</span>
        </button>
      </div>

      {/* Local Verified Workers Strip */}
      {topWorkers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Verified Available Workers Near You
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct phone and enquiry access. No broker fees.
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateWorkers}
              className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              See All Workers
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {topWorkers.map((worker) => (
              <div
                key={worker.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={
                        worker.avatar_url ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
                      }
                      alt={worker.full_name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/30 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {worker.full_name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{worker.city}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-xs font-bold">
                      <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                      <span>{worker.rating.toFixed(1)}</span>
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{worker.daily_rate || 800} / day
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onNavigateWorkers}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Contact Worker</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agriculture Special Callout */}
      <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Agricultural & Seasonal Farm Labor
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Find workers for wheat/paddy harvesting, tractor operators, irrigation, and orchard picking.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onNavigateAgri}
          className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-sm transition-colors shrink-0"
        >
          View Agriculture Hub
        </button>
      </div>
    </div>
  );
};
