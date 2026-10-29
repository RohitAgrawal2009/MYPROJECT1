import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { api } from '../api/client.ts';
import { Job, ServiceCategory, JobApplication } from '../types/index.ts';
import {
  Search,
  MapPin,
  Calendar,
  IndianRupee,
  Briefcase,
  Users,
  CheckCircle2,
  PlusCircle,
  Sprout,
} from 'lucide-react';
import { ApplyJobModal } from '../components/jobs/ApplyJobModal.tsx';
import { PostJobModal } from '../components/jobs/PostJobModal.tsx';

interface FindJobsPageProps {
  initialCategory?: string;
  initialCity?: string;
}

export const FindJobsPage: React.FC<FindJobsPageProps> = ({
  initialCategory = '',
  initialCity = '',
}) => {
  const { user, openAuthModal } = useAuth();
  const { t, language } = useLanguage();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [myApplications, setMyApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [city, setCity] = useState(initialCity || 'all');
  const [category, setCategory] = useState(initialCategory || 'all');
  const [workType, setWorkType] = useState('all');
  const [payType, setPayType] = useState('all');

  // Modals
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);

  useEffect(() => {
    api.get<ServiceCategory[]>('/api/categories').then(setCategories).catch(() => {});
  }, []);

  const loadJobs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (city !== 'all') params.set('city', city);
    if (category !== 'all') params.set('category', category);
    if (workType !== 'all') params.set('work_type', workType);
    if (payType !== 'all') params.set('pay_type', payType);

    api.get<Job[]>(`/api/jobs?${params.toString()}`)
      .then(setJobs)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const loadMyApplications = () => {
    if (user && user.role === 'worker') {
      api.get<JobApplication[]>('/api/my/applications')
        .then(setMyApplications)
        .catch(() => {});
    }
  };

  useEffect(() => {
    loadJobs();
    loadMyApplications();
  }, [city, category, workType, payType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs();
  };

  const appliedJobIds = new Set(myApplications.map((a) => a.job_id));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header with Post Job Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('jobsTitle')}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('jobsSubtitle')}
            </p>
          </div>

          <button
            onClick={() => {
              if (!user) {
                openAuthModal('login', 'customer');
              } else if (user.role === 'worker') {
                alert('Workers cannot post customer jobs. Please register or sign in as a customer/employer.');
              } else {
                setIsPostJobOpen(true);
              }
            }}
            className="self-start sm:self-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('navPostJob')}</span>
          </button>
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
                placeholder="Search job title, description, or requirements..."
                className="w-full text-xs sm:text-sm bg-transparent focus:outline-none placeholder:text-slate-400 font-medium text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="py-2.5 px-6 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 text-emerald-400 dark:text-white" />
              <span>Search</span>
            </button>
          </form>

          {/* Filters Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
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
                  <option key={c.id} value={c.id}>
                    {language === 'hi' ? c.name_hi : c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Work Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {t('filterWorkType')}
              </label>
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
              >
                <option value="all">{t('allWorkTypes')}</option>
                <option value="one_time">{t('typeOneTime')}</option>
                <option value="daily">{t('typeDaily')}</option>
                <option value="part_time">{t('typePartTime')}</option>
                <option value="full_time">{t('typeFullTime')}</option>
              </select>
            </div>

            {/* Pay Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {t('filterPayType')}
              </label>
              <select
                value={payType}
                onChange={(e) => setPayType(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
              >
                <option value="all">{t('allPayTypes')}</option>
                <option value="fixed">{t('payFixed')}</option>
                <option value="daily">{t('payDaily')}</option>
                <option value="hourly">{t('payHourly')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Job Listings Grid */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse"></div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
            <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Jobs Match Your Filters</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {t('noJobsFound')}
            </p>
            <button
              onClick={() => {
                setSearch('');
                setCity('all');
                setCategory('all');
                setWorkType('all');
                setPayType('all');
              }}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const isApplied = appliedJobIds.has(job.id);
              const isAgriJob = !!job.agri_activity;
              return (
                <div
                  key={job.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 hover:shadow-md transition-all p-5 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                          {language === 'hi' ? job.category_name_hi : job.category_name}
                        </span>
                        {isAgriJob && (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold">
                            <Sprout className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>{job.agri_activity}</span>
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                          {job.work_type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400">
                          Posted by {job.posted_by}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {job.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{job.location_city} • {job.service_area}</span>
                        </span>
                        {job.preferred_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{job.preferred_date}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.applications_count || 0} {t('applicants')}</span>
                        </span>
                      </div>
                    </div>

                    {/* Right column: Budget & Apply Action */}
                    <div className="sm:text-right shrink-0 flex flex-col justify-between items-start sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          Estimated {job.pay_type} Budget
                        </span>
                        <span className="text-lg sm:text-xl font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center sm:justify-end">
                          <IndianRupee className="w-4 h-4" />
                          <span>
                            {job.budget_min ? `${job.budget_min} - ${job.budget_max || job.budget_min}` : 'Negotiable'}
                          </span>
                        </span>
                      </div>

                      {isApplied ? (
                        <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold rounded-xl">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{t('btnAlreadyApplied')}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (!user) {
                              openAuthModal('login', 'worker');
                            } else if (user.role !== 'worker' && user.role !== 'admin') {
                              alert('Only workers can apply for jobs. Please log in with a worker account.');
                            } else {
                              setSelectedJobForApply(job);
                            }
                          }}
                          className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
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

      {/* Modals */}
      <ApplyJobModal
        job={selectedJobForApply}
        isOpen={!!selectedJobForApply}
        onClose={() => setSelectedJobForApply(null)}
        onSuccess={() => {
          loadMyApplications();
          loadJobs();
        }}
      />

      <PostJobModal
        isOpen={isPostJobOpen}
        onClose={() => setIsPostJobOpen(false)}
        onSuccess={() => {
          loadJobs();
        }}
      />
    </div>
  );
};
