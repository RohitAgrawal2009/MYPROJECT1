import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { api } from '../api/client.ts';
import { WorkerDetail, Job, JobApplication } from '../types/index.ts';
import {
  Wheat,
  Search,
  MapPin,
  Calendar,
  IndianRupee,
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  PlusCircle,
  AlertCircle,
  Filter,
  Send,
  Star,
  Check,
  X,
  Home,
  SlidersHorizontal,
} from 'lucide-react';
import { SendEnquiryModal } from '../components/workers/SendEnquiryModal.tsx';
import { ApplyJobModal } from '../components/jobs/ApplyJobModal.tsx';
import { PostAgriJobModal } from '../components/agriculture/PostAgriJobModal.tsx';
import { WorkerDetailModal } from '../components/workers/WorkerDetailModal.tsx';

export const AgriculturePage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'workers' | 'work'>('workers');

  // Workers Tab State
  const [agriWorkers, setAgriWorkers] = useState<WorkerDetail[]>([]);
  const [workerSearch, setWorkerSearch] = useState('');
  const [workerActivity, setWorkerActivity] = useState('all');
  const [workerLocation, setWorkerLocation] = useState('all');
  const [loadingWorkers, setLoadingWorkers] = useState(true);

  // Work Tab State
  const [agriJobs, setAgriJobs] = useState<Job[]>([]);
  const [jobSearch, setJobSearch] = useState('');
  const [jobActivity, setJobActivity] = useState('all');
  const [jobLocation, setJobLocation] = useState('all');
  const [jobStatus, setJobStatus] = useState('open');
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [myApplications, setMyApplications] = useState<JobApplication[]>([]);

  // Modals
  const [enquiryWorker, setEnquiryWorker] = useState<WorkerDetail | null>(null);
  const [detailWorker, setDetailWorker] = useState<WorkerDetail | null>(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);

  const activities = [
    { id: 'Sowing and Planting', label: t('actSowing') },
    { id: 'Harvesting and Crop Cutting', label: t('actHarvesting') },
    { id: 'Irrigation and Water Management', label: t('actIrrigation') },
    { id: 'Weeding and Field Maintenance', label: t('actWeeding') },
    { id: 'Tractor Driving & Farm Machinery', label: t('actTractor') },
    { id: 'Spraying and Crop Care', label: t('actSpraying') },
    { id: 'Fruit and Vegetable Picking', label: t('actFruitPicking') },
    { id: 'General Farm Labour', label: t('actFarmLabour') },
    { id: 'Other Agricultural Activities', label: t('actOther') },
  ];

  const loadWorkers = () => {
    setLoadingWorkers(true);
    api.get<WorkerDetail[]>('/api/workers')
      .then((data) => {
        // Filter workers who belong to agricultural category or have agricultural activities/skills
        const filtered = data.filter((w) => {
          const hasAgriSkill = w.skills.some(
            (s) =>
              s.category_id === 'cat-agri' ||
              s.category_name?.toLowerCase().includes('agri') ||
              s.skill_name?.toLowerCase().includes('harvest') ||
              s.skill_name?.toLowerCase().includes('crop') ||
              s.skill_name?.toLowerCase().includes('tractor')
          );
          const hasAgriFlag = w.agri_available !== undefined || (w.agri_activities && w.agri_activities.length > 0);
          return hasAgriSkill || hasAgriFlag;
        });
        setAgriWorkers(filtered);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingWorkers(false));
  };

  const loadJobs = () => {
    setLoadingJobs(true);
    const params = new URLSearchParams();
    params.set('status', jobStatus);
    params.set('category', 'cat-agri');
    if (jobActivity !== 'all') params.set('agri_activity', jobActivity);
    if (jobLocation !== 'all') params.set('city', jobLocation);

    api.get<Job[]>(`/api/jobs?${params.toString()}`)
      .then((data) => {
        // Sort newest first
        const sorted = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setAgriJobs(sorted);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingJobs(false));
  };

  const loadMyApplications = () => {
    if (user && user.role === 'worker') {
      api.get<JobApplication[]>('/api/my/applications')
        .then(setMyApplications)
        .catch(() => {});
    }
  };

  useEffect(() => {
    loadWorkers();
    loadJobs();
    loadMyApplications();
  }, []);

  useEffect(() => {
    loadJobs();
  }, [jobActivity, jobLocation, jobStatus]);

  // Filtered workers on client side for responsive instant search
  const filteredWorkers = agriWorkers.filter((w) => {
    const matchesSearch =
      !workerSearch.trim() ||
      w.full_name.toLowerCase().includes(workerSearch.toLowerCase()) ||
      w.city.toLowerCase().includes(workerSearch.toLowerCase()) ||
      w.service_area.toLowerCase().includes(workerSearch.toLowerCase()) ||
      w.skills.some((s) => s.skill_name.toLowerCase().includes(workerSearch.toLowerCase()));

    const matchesLocation = workerLocation === 'all' || w.city.toLowerCase() === workerLocation.toLowerCase();

    const matchesActivity =
      workerActivity === 'all' ||
      (w.agri_activities && w.agri_activities.includes(workerActivity)) ||
      w.skills.some((s) => s.skill_name.toLowerCase().includes(workerActivity.toLowerCase()));

    return matchesSearch && matchesLocation && matchesActivity;
  });

  const appliedJobIds = new Set(myApplications.map((a) => a.job_id));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Module Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white p-8 sm:p-10 shadow-xl border border-emerald-800/40">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Wheat className="w-4 h-4 text-emerald-400" />
              <span>JobBond Kisan & Khet Mazdoor Network</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              {t('agriHeading')}
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              {t('agriSubtitle')}
            </p>
          </div>

          {/* Action on right of header */}
          <div className="mt-6 sm:mt-0 sm:absolute sm:top-10 sm:right-10 flex flex-wrap gap-3">
            <button
              onClick={() => {
                if (!user) {
                  openAuthModal('login', 'customer');
                } else if (user.role === 'worker') {
                  alert('Workers cannot post jobs. Please sign in as a customer/farmer.');
                } else {
                  setIsPostJobOpen(true);
                }
              }}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('btnPostAgriJob')}</span>
            </button>
          </div>
        </div>

        {/* Main Tab Controls */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('workers')}
            className={`py-3.5 px-6 text-sm sm:text-base font-extrabold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'workers'
                ? 'border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('tabFindAgriWorkers')}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
              {filteredWorkers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('work')}
            className={`py-3.5 px-6 text-sm sm:text-base font-extrabold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'work'
                ? 'border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('tabFindAgriWork')}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
              {agriJobs.length}
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: FIND AGRICULTURAL WORKERS */}
        {/* ========================================================================= */}
        {activeTab === 'workers' && (
          <div className="space-y-6">
            {/* Search & Filters */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-emerald-500">
                  <Search className="w-5 h-5 text-slate-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    value={workerSearch}
                    onChange={(e) => setWorkerSearch(e.target.value)}
                    placeholder="Search worker by name, village, or skill (e.g. Tractor, Harvesting)..."
                    className="w-full text-xs sm:text-sm bg-transparent focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                  />
                </div>

                <div className="sm:w-56 flex items-center px-3 gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <select
                    value={workerLocation}
                    onChange={(e) => setWorkerLocation(e.target.value)}
                    className="w-full py-2.5 text-xs sm:text-sm bg-transparent focus:outline-none font-medium"
                  >
                    <option value="all">{t('allCities')}</option>
                    <option value="Jaipur">Jaipur / Rural</option>
                    <option value="New Delhi">New Delhi / Najafgarh</option>
                    <option value="Lucknow">Lucknow / Malihabad</option>
                    <option value="Bengaluru">Bengaluru Rural</option>
                    <option value="Mumbai">Mumbai Suburban</option>
                  </select>
                </div>
              </div>

              {/* Activity Filter Badges */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  {t('filterActivity')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setWorkerActivity('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      workerActivity === 'all'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {t('allActivities')}
                  </button>
                  {activities.map((act) => (
                    <button
                      key={act.id}
                      onClick={() => setWorkerActivity(act.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        workerActivity === act.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Workers Grid */}
            {loadingWorkers ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse"></div>
                ))}
              </div>
            ) : filteredWorkers.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
                <Wheat className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Agricultural Workers Found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  No workers match your selected filters. Try broadening your location or activity search.
                </p>
                <button
                  onClick={() => {
                    setWorkerSearch('');
                    setWorkerActivity('all');
                    setWorkerLocation('all');
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorkers.map((worker) => {
                  const hasAgriData = worker.agri_available !== undefined;
                  const isAvailable = worker.agri_available === true || worker.availability_status === 'available';

                  return (
                    <div
                      key={worker.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:shadow-lg transition-all p-5 flex flex-col justify-between"
                    >
                      <div className="space-y-3.5">
                        {/* Top: Avatar + Name + Status */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-emerald-950 dark:bg-emerald-900 border border-emerald-500/40 text-emerald-400 font-extrabold text-base flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                              {worker.avatar_url ? (
                                <img src={worker.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                worker.full_name.charAt(0)
                              )}
                            </div>
                            <div>
                              <h3
                                onClick={() => setDetailWorker(worker)}
                                className="text-sm font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                              >
                                {worker.full_name}
                              </h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span
                                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                    isAvailable
                                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                  }`}
                                >
                                  {isAvailable ? t('statusAvailable') : t('statusBusy')}
                                </span>
                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                  {worker.experience_years} {t('experienceYears')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 font-bold text-amber-500 text-xs shrink-0">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{worker.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{worker.city} • {worker.service_area}</span>
                        </div>

                        {/* Real Work Availability Section */}
                        <div className="p-3 bg-emerald-50/50 dark:bg-slate-800/50 rounded-xl border border-emerald-100 dark:border-slate-700/60 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-emerald-900 dark:text-emerald-400 tracking-wider">
                              {t('tabAgriAvailability')}
                            </span>
                            {hasAgriData ? (
                              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span>{worker.agri_available ? t('availableForWork') : t('statusUnavailable')}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-slate-400 italic">
                                {t('availabilityNotProvided')}
                              </span>
                            )}
                          </div>

                          {hasAgriData && worker.agri_available && (
                            <>
                              {worker.agri_service_radius && (
                                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">Radius: </span>
                                  {worker.agri_service_radius}
                                </p>
                              )}
                              {worker.agri_schedule && (
                                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">Schedule: </span>
                                  {worker.agri_schedule}
                                </p>
                              )}
                              {worker.agri_available_from && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  From: {worker.agri_available_from} {worker.agri_available_until ? `to ${worker.agri_available_until}` : ''}
                                </p>
                              )}
                            </>
                          )}
                        </div>

                        {/* Preferred Agricultural Activities */}
                        {worker.agri_activities && worker.agri_activities.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                              {t('preferredActivities')}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {worker.agri_activities.map((act, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200 dark:border-emerald-800"
                                >
                                  {act}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Daily Rate & Work Types */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">{t('dailyRate')}</span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center">
                              <IndianRupee className="w-3.5 h-3.5" />
                              <span>{worker.agri_expected_wage || worker.daily_rate || 750} / day</span>
                            </span>
                          </div>
                          {worker.agri_work_types && worker.agri_work_types.length > 0 && (
                            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                              {worker.agri_work_types[0]}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <button
                          onClick={() => setDetailWorker(worker)}
                          className="flex-1 py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-center"
                        >
                          {t('btnViewProfile')}
                        </button>
                        <button
                          onClick={() => setEnquiryWorker(worker)}
                          className="py-2 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
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
        )}

        {/* ========================================================================= */}
        {/* TAB 2: FIND AGRICULTURAL WORK */}
        {/* ========================================================================= */}
        {activeTab === 'work' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-emerald-500">
                  <Search className="w-5 h-5 text-slate-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    placeholder="Search agricultural jobs by title, crop, or village..."
                    className="w-full text-xs sm:text-sm bg-transparent focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                  />
                </div>

                <div className="sm:w-56 flex items-center px-3 gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <select
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    className="w-full py-2.5 text-xs sm:text-sm bg-transparent focus:outline-none font-medium"
                  >
                    <option value="all">{t('allCities')}</option>
                    <option value="Jaipur">Jaipur / Rural</option>
                    <option value="New Delhi">New Delhi / Najafgarh</option>
                    <option value="Lucknow">Lucknow / Malihabad</option>
                    <option value="Bengaluru">Bengaluru Rural</option>
                    <option value="Mumbai">Mumbai Suburban</option>
                  </select>
                </div>
              </div>

              {/* Filters bar: Activity + Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {t('filterActivity')}
                  </label>
                  <select
                    value={jobActivity}
                    onChange={(e) => setJobActivity(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  >
                    <option value="all">{t('allActivities')}</option>
                    {activities.map((a) => (
                      <option key={a.id} value={a.id}>{a.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Job Status
                  </label>
                  <select
                    value={jobStatus}
                    onChange={(e) => setJobStatus(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  >
                    <option value="open">{t('statusOpen')}</option>
                    <option value="filled">{t('statusFilled')}</option>
                    <option value="closed">{t('statusClosed')}</option>
                    <option value="all">All Statuses</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Jobs List */}
            {loadingJobs ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-44 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse"></div>
                ))}
              </div>
            ) : agriJobs.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
                <Wheat className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Agricultural Jobs Found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {t('noJobsFound')} Are you a farmer or employer needing helpers? Post a job listing now.
                </p>
                <button
                  onClick={() => setIsPostJobOpen(true)}
                  className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700"
                >
                  {t('btnPostAgriJob')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {agriJobs.map((job) => {
                  const isApplied = appliedJobIds.has(job.id);
                  return (
                    <div
                      key={job.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:shadow-md transition-all p-5 sm:p-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                              {job.agri_activity || 'Agricultural Work'}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                              Status: {job.status.toUpperCase()}
                            </span>
                            {job.meals_accommodation && (
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-semibold flex items-center gap-1">
                                <Home className="w-3 h-3" />
                                <span>{t('mealsOffered')}</span>
                              </span>
                            )}
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            {job.title}
                          </h3>

                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                            {job.description}
                          </p>

                          {job.accommodation_details && (
                            <p className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50/60 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                              <span className="font-semibold">Perks / Facilities: </span>
                              {job.accommodation_details}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                            <span className="flex items-center gap-1 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{job.location_city} • {job.service_area}</span>
                            </span>
                            {job.workers_needed && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                <span>{job.workers_needed} {t('workersNeeded')}</span>
                              </span>
                            )}
                            {job.start_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>Start: {job.start_date}</span>
                              </span>
                            )}
                            {job.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>{t('duration')}: {job.duration}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right: Wage & Apply Button */}
                        <div className="sm:text-right shrink-0 flex flex-col justify-between items-start sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                              Wage ({job.payment_basis || job.pay_type})
                            </span>
                            <span className="text-lg sm:text-xl font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center sm:justify-end">
                              <IndianRupee className="w-4 h-4" />
                              <span>{job.budget_min ? `${job.budget_min} - ${job.budget_max || job.budget_min}` : 'Negotiable'}</span>
                            </span>
                          </div>

                          {isApplied ? (
                            <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold rounded-xl">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{t('btnAlreadyApplied')}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                if (!user) {
                                  openAuthModal('login', 'worker');
                                } else if (user.role !== 'worker' && user.role !== 'admin') {
                                  alert('Only workers can apply for jobs.');
                                } else {
                                  setSelectedJobForApply(job);
                                }
                              }}
                              className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Briefcase className="w-3.5 h-3.5 text-emerald-400 dark:text-white" />
                              <span>{t('btnApplyJob')}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {enquiryWorker && (
        <SendEnquiryModal
          worker={enquiryWorker}
          isOpen={!!enquiryWorker}
          onClose={() => setEnquiryWorker(null)}
        />
      )}

      {detailWorker && (
        <WorkerDetailModal
          worker={detailWorker}
          isOpen={!!detailWorker}
          onClose={() => setDetailWorker(null)}
        />
      )}

      {selectedJobForApply && (
        <ApplyJobModal
          job={selectedJobForApply}
          isOpen={!!selectedJobForApply}
          onClose={() => setSelectedJobForApply(null)}
          onSuccess={() => {
            loadJobs();
            loadMyApplications();
          }}
        />
      )}

      <PostAgriJobModal
        isOpen={isPostJobOpen}
        onClose={() => setIsPostJobOpen(false)}
        onSuccess={() => {
          loadJobs();
        }}
      />
    </div>
  );
};
