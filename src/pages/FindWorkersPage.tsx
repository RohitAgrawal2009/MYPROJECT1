import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { api } from '../api/client.ts';
import { WorkerDetail, ServiceCategory } from '../types/index.ts';
import {
  Search,
  MapPin,
  Star,
  IndianRupee,
  Briefcase,
  Heart,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import { WorkerDetailModal } from '../components/workers/WorkerDetailModal.tsx';
import { SendEnquiryModal } from '../components/workers/SendEnquiryModal.tsx';

interface FindWorkersPageProps {
  initialSearch?: string;
  initialCity?: string;
  initialCategory?: string;
}

export const FindWorkersPage: React.FC<FindWorkersPageProps> = ({
  initialSearch = '',
  initialCity = '',
  initialCategory = '',
}) => {
  const { user, openAuthModal } = useAuth();
  const { t, language } = useLanguage();

  const [workers, setWorkers] = useState<WorkerDetail[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [savedWorkerIds, setSavedWorkerIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(initialSearch);
  const [city, setCity] = useState(initialCity || 'all');
  const [category, setCategory] = useState(initialCategory || 'all');
  const [minExp, setMinExp] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');

  // Modal States
  const [selectedWorker, setSelectedWorker] = useState<WorkerDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [enquiryWorker, setEnquiryWorker] = useState<WorkerDetail | null>(null);

  useEffect(() => {
    // Load categories
    api.get<ServiceCategory[]>('/api/categories').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    // Load saved workers if customer
    if (user && user.role === 'customer') {
      api.get<any[]>('/api/saved-workers').then((data) => {
        setSavedWorkerIds(data.map((item) => item.id));
      }).catch(() => {});
    }
  }, [user]);

  const loadWorkers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (city !== 'all') params.set('city', city);
    if (category !== 'all') params.set('category', category);
    if (minExp !== 'all') params.set('minExp', minExp);
    if (availability !== 'all') params.set('availability', availability);
    if (sortBy) params.set('sort', sortBy);

    api.get<WorkerDetail[]>(`/api/workers?${params.toString()}`)
      .then(setWorkers)
      .catch((err) => console.error('Failed to load workers', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWorkers();
  }, [city, category, minExp, availability, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadWorkers();
  };

  const handleToggleSave = async (workerId: string) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    const isSaved = savedWorkerIds.includes(workerId);
    if (isSaved) {
      try {
        await api.delete(`/api/saved-workers/${workerId}`);
        setSavedWorkerIds((prev) => prev.filter((id) => id !== workerId));
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        await api.post('/api/saved-workers', { worker_id: workerId });
        setSavedWorkerIds((prev) => [...prev, workerId]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('workersTitle')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('workersSubtitle')}
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-emerald-500">
              <Search className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by worker name, skill, area, or task..."
                className="w-full text-xs sm:text-sm bg-transparent focus:outline-none placeholder:text-slate-400 font-medium text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="py-2.5 px-6 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 text-emerald-400 dark:text-white" />
              <span>Search</span>
            </button>
          </form>

          {/* Filters Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {/* City */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {t('filterCity')}
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
              >
                <option value="all">{t('allCities')}</option>
                <option value="New Delhi">New Delhi</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Lucknow">Lucknow</option>
                <option value="Chandigarh">Chandigarh / Punjab</option>
                <option value="Jaipur">Jaipur</option>
                <option value="Pune">Pune</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Patna">Patna</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {t('filterCategory')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
              >
                <option value="all">{t('allCategories')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {language === 'hi' ? c.name_hi : c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {t('filterExperience')}
              </label>
              <select
                value={minExp}
                onChange={(e) => setMinExp(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
              >
                <option value="all">{t('anyExperience')}</option>
                <option value="1">{t('exp1Plus')}</option>
                <option value="3">{t('exp3Plus')}</option>
                <option value="5">{t('exp5Plus')}</option>
                <option value="8">{t('exp8Plus')}</option>
              </select>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {t('filterAvailability')}
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
              >
                <option value="all">{t('availAll')}</option>
                <option value="available">{t('availNow')}</option>
                <option value="busy">{t('availBusy')}</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {t('sortBy')}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
              >
                <option value="recommended">{t('sortRecommended')}</option>
                <option value="exp_desc">{t('sortExpDesc')}</option>
                <option value="rate_asc">{t('sortRateAsc')}</option>
                <option value="rating_desc">{t('sortRatingDesc')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Worker Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse"></div>
            ))}
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
            <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Workers Match Your Search</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {t('noWorkersFound')}
            </p>
            <button
              onClick={() => {
                setSearch('');
                setCity('all');
                setCategory('all');
                setMinExp('all');
                setAvailability('all');
              }}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => {
              const isSaved = savedWorkerIds.includes(worker.id);
              return (
                <div
                  key={worker.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 hover:shadow-lg transition-all p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Avatar + Name + Save Heart */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-emerald-400 font-extrabold text-base flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                          {worker.avatar_url ? (
                            <img src={worker.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            worker.full_name.charAt(0)
                          )}
                        </div>
                        <div>
                          <h3
                            className="text-sm font-bold text-slate-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer"
                            onClick={() => {
                              setSelectedWorker(worker);
                              setIsDetailOpen(true);
                            }}
                          >
                            {worker.full_name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                worker.availability_status === 'available'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              {worker.availability_status === 'available' ? t('statusAvailable') : t('statusBusy')}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              {worker.experience_years} {t('experienceYears')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleSave(worker.id)}
                        className={`p-2 rounded-xl border transition-colors ${
                          isSaved
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600'
                        }`}
                        title={isSaved ? 'Remove from saved' : 'Save worker'}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500' : ''}`} />
                      </button>
                    </div>

                    {/* Location & Rating */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{worker.city} • {worker.service_area}</span>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-amber-500 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{worker.rating.toFixed(1)}</span>
                        <span className="text-slate-400 font-normal">({worker.reviews_count})</span>
                      </div>
                    </div>

                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {worker.skills.slice(0, 3).map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium border border-slate-200/80 dark:border-slate-700"
                        >
                          {language === 'hi' ? s.category_name_hi || s.skill_name : s.category_name || s.skill_name}
                        </span>
                      ))}
                    </div>

                    {/* Bio snippet */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {language === 'hi' && worker.bio_hi ? worker.bio_hi : worker.bio}
                    </p>

                    {/* Rates */}
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">{t('dailyRate')}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                          <IndianRupee className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{worker.daily_rate || 800}</span>
                        </span>
                      </div>
                      <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
                        <span className="text-[10px] text-slate-400 block font-medium">{t('hourlyRate')}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                          <IndianRupee className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{worker.hourly_rate || 200}</span>
                        </span>
                      </div>
                      <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
                        <span className="text-[10px] text-slate-400 block font-medium">Completed</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          {worker.completed_jobs} jobs
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedWorker(worker);
                        setIsDetailOpen(true);
                      }}
                      className="flex-1 py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-center"
                    >
                      {t('btnViewProfile')}
                    </button>
                    <button
                      onClick={() => setEnquiryWorker(worker)}
                      className="py-2 px-3.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>{t('btnSendEnquiry')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <WorkerDetailModal
        worker={selectedWorker}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedWorker(null);
        }}
        isSaved={selectedWorker ? savedWorkerIds.includes(selectedWorker.id) : false}
        onToggleSave={handleToggleSave}
      />

      {enquiryWorker && (
        <SendEnquiryModal
          worker={enquiryWorker}
          isOpen={!!enquiryWorker}
          onClose={() => setEnquiryWorker(null)}
        />
      )}
    </div>
  );
};
