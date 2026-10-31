import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, IndianRupee, Clock, CheckCircle2, AlertCircle, Phone, ArrowRight, Zap, Sprout, Send, Sparkles, Filter, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { api } from '../../api/client.ts';
import { Job, JobApplication } from '../../types/index.ts';

interface WorkerHomeViewProps {
  onNavigateJobs: () => void;
  onNavigateAgri: () => void;
  onNavigateProfile: () => void;
}

export const WorkerHomeView: React.FC<WorkerHomeViewProps> = ({
  onNavigateJobs,
  onNavigateAgri,
  onNavigateProfile,
}) => {
  const { user, workerProfile, updateAvailability } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'all' | 'agri' | 'daily' | 'part_time'>('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myApplications, setMyApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(workerProfile?.availability_status === 'available');
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [applyRate, setApplyRate] = useState<number>(workerProfile?.daily_rate || 800);
  const [applyNote, setApplyNote] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync availability when workerProfile updates
  useEffect(() => {
    if (workerProfile) {
      setIsAvailable(workerProfile.availability_status === 'available');
    }
  }, [workerProfile]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/jobs?status=open');
      if (Array.isArray(data)) {
        setJobs(data);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    if (user) {
      try {
        const apps = await api.get('/api/applications/my');
        if (Array.isArray(apps)) {
          setMyApplications(apps);
        }
      } catch {}
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, [user]);

  const handleToggleAvailability = async () => {
    const newStatus = isAvailable ? 'busy' : 'available';
    setIsAvailable(!isAvailable);
    try {
      await updateAvailability(newStatus);
    } catch {
      setIsAvailable(isAvailable);
    }
  };

  const handleOpenApplyModal = (job: Job) => {
    setApplyingJobId(job.id);
    setApplyRate(job.budget_max || workerProfile?.daily_rate || 800);
    setApplyNote(`Namaste, I am interested in this work. I have ${workerProfile?.experience_years || 2} years of practical experience.`);
    setActionMsg(null);
  };

  const handleConfirmApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJobId) return;

    setSubmittingApp(true);
    setActionMsg(null);

    try {
      await api.post(`/api/jobs/${applyingJobId}/apply`, {
        proposed_rate: applyRate,
        cover_message: applyNote,
      });

      setActionMsg({ type: 'success', text: 'Application submitted directly to customer!' });
      setApplyingJobId(null);
      await fetchMyApplications();
    } catch (err: any) {
      setActionMsg({
        type: 'error',
        text: err.response?.data?.error || err.message || 'Failed to submit application.',
      });
    } finally {
      setSubmittingApp(false);
    }
  };

  // Filter jobs based on active tab
  const filteredJobs = jobs.filter((job) => {
    if (activeTab === 'agri') {
      return job.category_id === 'cat-agri' || Boolean(job.agri_activity);
    }
    if (activeTab === 'daily') {
      return job.pay_type === 'daily' || job.work_type === 'daily';
    }
    if (activeTab === 'part_time') {
      return job.work_type === 'part_time' || job.work_type === 'one_time';
    }
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Worker Live Status & Daily Availability Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {t('todayStatusLabel')}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {isAvailable ? '🟢 ' + t('iAmAvailableToday') : '⚪ ' + t('iAmBusyToday')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAvailable
              ? 'Customers in your area can view your profile and contact you directly for today\'s jobs.'
              : 'Toggle ON when you are looking for work so customers know you are available today.'}
          </p>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          onClick={handleToggleAvailability}
          className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${
            isAvailable
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
          }`}
        >
          <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
          <span>{isAvailable ? 'Online / Available' : 'Go Online'}</span>
        </button>
      </div>

      {/* Quick Summary Cards Row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Daily Rate</span>
          <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            ₹{workerProfile?.daily_rate || 800}
          </p>
          <span className="text-[10px] text-slate-400">per day</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">My Applications</span>
          <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
            {myApplications.length}
          </p>
          <span className="text-[10px] text-slate-400">submitted</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rating</span>
          <p className="text-lg sm:text-xl font-black text-amber-500 mt-0.5">
            ★ {(workerProfile?.rating || 4.9).toFixed(1)}
          </p>
          <span className="text-[10px] text-slate-400">Verified</span>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`p-4 rounded-2xl text-sm font-semibold flex items-center gap-2.5 ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/30 border border-red-200 text-red-800 dark:text-red-300'
          }`}
        >
          {actionMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Nearby Jobs Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t('workerHomeTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('workerHomeSubtitle')}
            </p>
          </div>

          <button
            type="button"
            onClick={fetchJobs}
            className="self-start sm:self-center inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Jobs</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {t('filterAllJobs')} ({jobs.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('agri')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'agri'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>{t('filterAgriJobs')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === 'daily'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {t('filterDailyWage')}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('part_time')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === 'part_time'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {t('filterPartTime')}
          </button>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading nearby jobs...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <Briefcase className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No jobs currently in this tab.</p>
            <p className="text-xs text-slate-500 mt-1">Check back soon or view all jobs across your region.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job) => {
              const hasApplied = myApplications.some((a) => a.job_id === job.id);
              return (
                <div
                  key={job.id}
                  className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition-all"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                        {job.category_id === 'cat-agri' ? '🌾 Agricultural' : '⚡ Local Work'}
                      </span>

                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        ₹{job.budget_max || job.budget_min || 800}
                        <span className="text-[10px] font-semibold text-slate-500 ml-0.5">
                          {job.pay_type === 'hourly' ? '/ hr' : '/ day'}
                        </span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-1">
                      {job.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{job.location_city} ({job.service_area})</span>
                      </span>
                      {job.preferred_date && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{job.preferred_date}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div>
                    {hasApplied ? (
                      <div className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-900/40">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{t('appliedSuccess')}</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenApplyModal(job)}
                        className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{t('applyNowBtn')}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {applyingJobId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Apply for this Job
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Send your rate and a brief message directly to the employer.
            </p>

            <form onSubmit={handleConfirmApply} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Proposed Daily Rate (₹)
                </label>
                <input
                  type="number"
                  min={200}
                  value={applyRate}
                  onChange={(e) => setApplyRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Message to Customer
                </label>
                <textarea
                  rows={3}
                  value={applyNote}
                  onChange={(e) => setApplyNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyingJobId(null)}
                  className="flex-1 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApp}
                  className="flex-1 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {submittingApp ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Submit Proposal</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
