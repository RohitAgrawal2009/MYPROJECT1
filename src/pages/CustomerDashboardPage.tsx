import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { api } from '../api/client.ts';
import { Job, JobApplication, ServiceEnquiry, SavedWorker } from '../types/index.ts';
import {
  Briefcase,
  PlusCircle,
  IndianRupee,
  Trash2,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { PostJobModal } from '../components/jobs/PostJobModal.tsx';
import { SendEnquiryModal } from '../components/workers/SendEnquiryModal.tsx';

export const CustomerDashboardPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'jobs' | 'enquiries' | 'saved'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [enquiries, setEnquiries] = useState<ServiceEnquiry[]>([]);
  const [savedWorkers, setSavedWorkers] = useState<SavedWorker[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected job for inspecting applicants
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Modal triggers
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [enquiryWorker, setEnquiryWorker] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allJobs, myApps, myEnqs, saved] = await Promise.all([
        api.get<Job[]>('/api/jobs?status=all'),
        api.get<JobApplication[]>('/api/my/applications'),
        api.get<ServiceEnquiry[]>('/api/my/enquiries'),
        api.get<SavedWorker[]>('/api/saved-workers'),
      ]);

      const myJobs = allJobs.filter((j) => j.customer_id === user?.id);
      setJobs(myJobs);
      setApplications(myApps);
      setEnquiries(myEnqs);
      setSavedWorkers(saved);
      if (myJobs.length > 0 && !selectedJobId) {
        setSelectedJobId(myJobs[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  if (!user || user.role === 'worker') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center max-w-md shadow-xs space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Customer Access Required</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Please log in with a Customer account to view your posted jobs and hire workers.
          </p>
          <button
            onClick={() => openAuthModal('login', 'customer')}
            className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Log in as Customer
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateApplicationStatus = async (appId: string, status: string) => {
    try {
      await api.patch(`/api/applications/${appId}/status`, { status });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await api.delete(`/api/jobs/${jobId}`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnsave = async (workerId: string) => {
    try {
      await api.delete(`/api/saved-workers/${workerId}`);
      setSavedWorkers((prev) => prev.filter((w) => w.id !== workerId));
    } catch (err) {
      console.error(err);
    }
  };

  const currentJobApplications = applications.filter((a) => a.job_id === selectedJobId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Welcome, {user.full_name}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {t('roleCustomer')}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage your job postings, review applicants, and connect with verified workers.
            </p>
          </div>

          <button
            onClick={() => setIsPostJobOpen(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('navPostJob')}</span>
          </button>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'jobs'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {t('tabMyJobs')} ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'enquiries'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <span>Sent Enquiries</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]">
              {enquiries.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'saved'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {t('tabSavedWorkers')} ({savedWorkers.length})
          </button>
        </div>

        {/* Tab 1: My Posted Jobs & Applicants */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            {jobs.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
                <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">You haven't posted any jobs yet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Create a job requirement to get proposals from skilled local electricians, plumbers, carpenters, or helpers.
                </p>
                <button
                  onClick={() => setIsPostJobOpen(true)}
                  className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700"
                >
                  Post Your First Job
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Jobs List (Left) */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Your Active Job Posts
                  </h3>
                  {jobs.map((job) => {
                    const jobApps = applications.filter((a) => a.job_id === job.id);
                    const isSelected = selectedJobId === job.id;
                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJobId(job.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white dark:bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/10 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                            {job.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteJob(job.id);
                            }}
                            className="text-slate-400 hover:text-red-600 p-1 rounded"
                            title="Delete job"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          {job.location_city} • {job.service_area}
                        </p>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            ₹{job.budget_min || 0} - ₹{job.budget_max || 0}
                          </span>
                          <span className="font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-[10px]">
                            {jobApps.length} Applicants
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Applicants for Selected Job (Right) */}
                <div className="lg:col-span-2 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Applicants for Selected Job ({currentJobApplications.length})
                  </h3>

                  {currentJobApplications.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                      No applications received for this job yet. Workers usually apply within a few hours.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentJobApplications.map((app) => (
                        <div
                          key={app.id}
                          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{app.worker_name}</h4>
                                <span
                                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                    app.status === 'accepted'
                                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                      : app.status === 'shortlisted'
                                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                      : app.status === 'rejected'
                                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {app.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {app.worker_city} • {app.worker_experience} yrs exp • Rating: ★ {app.worker_rating?.toFixed(1)}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Proposed Charge</span>
                              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                ₹{app.proposed_rate || 'Negotiable'}
                              </span>
                            </div>
                          </div>

                          {app.cover_message && (
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                              "{app.cover_message}"
                            </div>
                          )}

                          {/* Show phone if shortlisted or accepted */}
                          {(app.status === 'shortlisted' || app.status === 'accepted') && app.worker_phone && (
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span>Worker Direct Contact: {app.worker_phone}</span>
                            </div>
                          )}

                          {/* Customer Action Controls */}
                          <div className="pt-2 flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateApplicationStatus(app.id, 'shortlisted')}
                              className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 text-xs font-bold rounded-lg cursor-pointer"
                            >
                              Shortlist
                            </button>
                            <button
                              onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}
                              className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold rounded-lg cursor-pointer"
                            >
                              Hire & Accept
                            </button>
                            <button
                              onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Sent Enquiries */}
        {activeTab === 'enquiries' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Direct Inquiries Sent to Workers</h2>
            {enquiries.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                You haven't sent any enquiries to workers yet. Explore the "Find Workers" directory to reach out!
              </div>
            ) : (
              <div className="space-y-3">
                {enquiries.map((enq) => (
                  <div
                    key={enq.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Enquiry to: {enq.worker_name}</h3>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              enq.status === 'accepted' || enq.status === 'responded'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : enq.status === 'declined'
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            {enq.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Category: {enq.category_name} • Requested Schedule: {enq.preferred_schedule || 'Flexible'}
                        </p>
                      </div>

                      {(enq.status === 'accepted' || enq.status === 'responded') && enq.worker_phone && (
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Worker Phone: {enq.worker_phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-slate-500 dark:text-slate-400 block mb-0.5">Your Requirement:</span>
                      {enq.description}
                    </div>

                    {enq.response_message && (
                      <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-950 dark:text-emerald-200">
                        <span className="font-bold block mb-0.5">Worker's Reply:</span>
                        {enq.response_message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Saved Workers */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Saved Workers Shortlist</h2>
            {savedWorkers.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                You have not shortlisted any workers yet. Click the heart icon on any worker card to save them here.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 font-bold flex items-center justify-center text-sm">
                          {worker.avatar_url ? (
                            <img src={worker.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            worker.full_name.charAt(0)
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{worker.full_name}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {worker.city} • {worker.experience_years} yrs exp
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnsave(worker.id)}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center">
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>{worker.daily_rate || 800}/day</span>
                      </span>
                      <button
                        onClick={() => setEnquiryWorker(worker)}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700"
                      >
                        Send Enquiry
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <PostJobModal
          isOpen={isPostJobOpen}
          onClose={() => setIsPostJobOpen(false)}
          onSuccess={() => {
            loadData();
          }}
        />

        {enquiryWorker && (
          <SendEnquiryModal
            worker={enquiryWorker}
            isOpen={!!enquiryWorker}
            onClose={() => setEnquiryWorker(null)}
            onSuccess={() => {
              loadData();
            }}
          />
        )}
      </div>
    </div>
  );
};
