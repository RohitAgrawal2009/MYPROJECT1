import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { api } from '../api/client.ts';
import {
  WorkerDetail,
  ServiceCategory,
  JobApplication,
  ServiceEnquiry,
  Job,
} from '../types/index.ts';
import {
  User,
  Briefcase,
  Clock,
  MapPin,
  IndianRupee,
  Star,
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Save,
  Send,
  Eye,
  EyeOff,
  Sprout,
  Calendar,
} from 'lucide-react';
import { ApplyJobModal } from '../components/jobs/ApplyJobModal.tsx';

const AGRI_ACTIVITIES_LIST = [
  'Sowing / Planting',
  'Harvesting',
  'Irrigation',
  'Weeding / Cultivation',
  'Tractor & Machinery',
  'Crop Spraying',
  'Fruit / Vegetable Picking',
  'General Farm Labour',
  'Post-Harvest Processing',
];

export const WorkerDashboardPage: React.FC = () => {
  const { user, workerProfile, refreshUser, openAuthModal } = useAuth();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'profile' | 'agri' | 'enquiries' | 'applications' | 'opportunities'
  >('overview');
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [enquiries, setEnquiries] = useState<ServiceEnquiry[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [matchingJobs, setMatchingJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile Form State
  const [bio, setBio] = useState('');
  const [bioHi, setBioHi] = useState('');
  const [experienceYears, setExperienceYears] = useState(1);
  const [city, setCity] = useState('New Delhi');
  const [serviceArea, setServiceArea] = useState('');
  const [dailyRate, setDailyRate] = useState<number | string>(800);
  const [hourlyRate, setHourlyRate] = useState<number | string>(200);
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'busy' | 'unavailable'>('available');
  const [isPublic, setIsPublic] = useState(true);

  // Agricultural Availability State
  const [agriAvailable, setAgriAvailable] = useState<boolean>(workerProfile?.agri_available ?? true);
  const [agriActivities, setAgriActivities] = useState<string[]>(
    workerProfile?.agri_activities || ['Harvesting', 'General Farm Labour']
  );
  const [agriRadius, setAgriRadius] = useState<number>(workerProfile?.agri_service_radius || 25);
  const [agriSchedule, setAgriSchedule] = useState<string>(workerProfile?.agri_schedule || 'Daily / Seasonal');
  const [agriExpectedWage, setAgriExpectedWage] = useState<number>(workerProfile?.agri_expected_wage || 550);

  // Response dialog for enquiries
  const [activeEnquiry, setActiveEnquiry] = useState<ServiceEnquiry | null>(null);
  const [responseMsg, setResponseMsg] = useState('');
  const [responseStatus, setResponseStatus] = useState<'accepted' | 'declined'>('accepted');

  // Job apply
  const [jobToApply, setJobToApply] = useState<Job | null>(null);

  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [agriSaveStatus, setAgriSaveStatus] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, myEnqs, myApps, jobs] = await Promise.all([
        api.get<ServiceCategory[]>('/api/categories'),
        api.get<ServiceEnquiry[]>('/api/my/enquiries'),
        api.get<JobApplication[]>('/api/my/applications'),
        api.get<Job[]>('/api/jobs'),
      ]);

      setCategories(cats);
      setEnquiries(myEnqs);
      setApplications(myApps);
      setMatchingJobs(jobs);

      // Populate profile state
      if (workerProfile) {
        setBio(workerProfile.bio || '');
        setBioHi(workerProfile.bio_hi || '');
        setExperienceYears(workerProfile.experience_years || 1);
        setCity(workerProfile.city || 'New Delhi');
        setServiceArea(workerProfile.service_area || '');
        setDailyRate(workerProfile.daily_rate || 800);
        setHourlyRate(workerProfile.hourly_rate || 200);
        setAvailabilityStatus(workerProfile.availability_status || 'available');
        setIsPublic(workerProfile.is_public ?? true);

        // Agricultural fields
        if (workerProfile.agri_available !== undefined) {
          setAgriAvailable(workerProfile.agri_available);
        }
        if (workerProfile.agri_activities) {
          setAgriActivities(workerProfile.agri_activities);
        }
        if (workerProfile.agri_service_radius) {
          setAgriRadius(workerProfile.agri_service_radius);
        }
        if (workerProfile.agri_schedule) {
          setAgriSchedule(workerProfile.agri_schedule);
        }
        if (workerProfile.agri_expected_wage) {
          setAgriExpectedWage(workerProfile.agri_expected_wage);
        }
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

  if (!user || (user.role !== 'worker' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center max-w-md shadow-xs space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Worker Access Required</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            You must be logged into a Worker account to access this dashboard.
          </p>
          <button
            onClick={() => openAuthModal('login', 'worker')}
            className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Log in as Worker
          </button>
        </div>
      </div>
    );
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);
    try {
      await api.patch('/api/workers/profile', {
        bio,
        bio_hi: bioHi,
        experience_years: Number(experienceYears),
        city,
        service_area: serviceArea,
        daily_rate: Number(dailyRate),
        hourly_rate: Number(hourlyRate),
        availability_status: availabilityStatus,
        is_public: isPublic,
      });

      setSaveStatus('Profile updated successfully!');
      await refreshUser();
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      setSaveStatus(err.message || 'Failed to update profile');
    }
  };

  const handleAgriSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAgriSaveStatus(null);
    try {
      await api.patch('/api/workers/profile', {
        agri_available: agriAvailable,
        agri_activities: agriActivities,
        agri_service_radius: Number(agriRadius),
        agri_schedule: agriSchedule,
        agri_expected_wage: Number(agriExpectedWage),
      });

      setAgriSaveStatus('Agricultural work preferences updated successfully!');
      await refreshUser();
      setTimeout(() => setAgriSaveStatus(null), 3000);
    } catch (err: any) {
      setAgriSaveStatus(err.message || 'Failed to update agricultural settings');
    }
  };

  const toggleAgriActivity = (act: string) => {
    setAgriActivities((prev) =>
      prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]
    );
  };

  const handleRespondEnquiry = async () => {
    if (!activeEnquiry) return;
    try {
      await api.patch(`/api/enquiries/${activeEnquiry.id}/respond`, {
        status: responseStatus,
        response_message: responseMsg,
      });
      setActiveEnquiry(null);
      setResponseMsg('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-slate-950 font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                user.full_name.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{user.full_name}</h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {t('roleWorker')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {city} • {serviceArea || 'All Localities'} • {experienceYears} yrs experience
              </p>
            </div>
          </div>

          {/* Quick Availability & Visibility Toggles */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center">
              <button
                type="button"
                onClick={async () => {
                  setAvailabilityStatus('available');
                  await api.patch('/api/workers/profile', { availability_status: 'available' });
                  refreshUser();
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  availabilityStatus === 'available'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ● {t('statusAvailable')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  setAvailabilityStatus('busy');
                  await api.patch('/api/workers/profile', { availability_status: 'busy' });
                  refreshUser();
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  availabilityStatus === 'busy'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ● {t('statusBusy')}
              </button>
            </div>

            <button
              onClick={async () => {
                const nextVal = !isPublic;
                setIsPublic(nextVal);
                await api.patch('/api/workers/profile', { is_public: nextVal });
                refreshUser();
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border flex items-center gap-2 transition-all ${
                isPublic
                  ? 'bg-slate-800 border-slate-700 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {isPublic ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4" />}
              <span>{isPublic ? 'Public Profile: ON' : 'Public Profile: HIDDEN'}</span>
            </button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {t('tabOverview')}
          </button>
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'enquiries'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <span>{t('tabEnquiries')}</span>
            {enquiries.filter((e) => e.status === 'pending').length > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                {enquiries.filter((e) => e.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'applications'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {t('tabApplications')} ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'opportunities'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {t('tabOpportunities')}
          </button>
          <button
            onClick={() => setActiveTab('agri')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'agri'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Farm & Agri Work</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {t('tabEditProfile')}
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Enquiries Received</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{enquiries.length}</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                  {enquiries.filter((e) => e.status === 'pending').length} pending action
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Job Applications</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{applications.length}</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                  {applications.filter((a) => a.status === 'shortlisted' || a.status === 'accepted').length} shortlisted/accepted
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Daily Charges</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center">
                  <IndianRupee className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{dailyRate}</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">₹{hourlyRate}/hr indicative</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Worker Reputation</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-1.5 text-amber-500">
                  <Star className="w-5 h-5 fill-amber-400" />
                  <span>{workerProfile?.rating || '5.0'}</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {workerProfile?.completed_jobs || 0} completed works
                </p>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Customer Inquiries</h3>
              {enquiries.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-4">
                  No enquiries received yet. Keep your profile updated to attract clients!
                </p>
              ) : (
                <div className="space-y-3">
                  {enquiries.slice(0, 3).map((enq) => (
                    <div
                      key={enq.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{enq.customer_name}</span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {enq.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{enq.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveEnquiry(enq);
                          setActiveTab('enquiries');
                        }}
                        className="px-3 py-1.5 bg-slate-900 dark:bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-emerald-700"
                      >
                        Respond
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Enquiries */}
        {activeTab === 'enquiries' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Received Service Enquiries</h2>
            {enquiries.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                You haven't received any customer enquiries yet.
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
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{enq.customer_name}</h3>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              enq.status === 'accepted'
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
                          Schedule: {enq.preferred_schedule || 'Flexible'} • Category: {enq.category_name}
                        </p>
                      </div>

                      {enq.status === 'accepted' && enq.customer_phone && (
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          Customer Phone: {enq.customer_phone}
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                      {enq.description}
                    </div>

                    {enq.response_message && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800 rounded-xl text-xs text-blue-900 dark:text-blue-200">
                        <span className="font-bold">Your Response: </span>
                        {enq.response_message}
                      </div>
                    )}

                    {enq.status === 'pending' && (
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setActiveEnquiry(enq);
                            setResponseStatus('accepted');
                          }}
                          className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Accept Request</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveEnquiry(enq);
                            setResponseStatus('declined');
                          }}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Applications */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Job Applications</h2>
            {applications.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                You have not applied for any jobs yet. Check the "Find Jobs" tab to apply!
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{app.job_title}</h3>
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
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {app.job_city} • {app.job_area} • Job Budget: ₹{app.job_budget} ({app.pay_type})
                      </p>
                      {app.cover_message && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg mt-1">
                          "{app.cover_message}"
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Proposed Rate</span>
                      <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                        ₹{app.proposed_rate || 'Standard Rate'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Opportunities */}
        {activeTab === 'opportunities' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recommended Jobs in {city}</h2>
            <div className="space-y-3">
              {matchingJobs
                .filter((j) => j.status === 'open')
                .map((job) => (
                  <div
                    key={job.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{job.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{job.description}</p>
                      <p className="text-xs text-slate-400">
                        {job.location_city} • {job.service_area} • Budget: ₹{job.budget_min || 0} - ₹{job.budget_max || 0}
                      </p>
                    </div>
                    <button
                      onClick={() => setJobToApply(job)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer"
                    >
                      Apply Now
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 5: Agricultural Availability */}
        {activeTab === 'agri' && (
          <form
            onSubmit={handleAgriSubmit}
            className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Agricultural Work Availability
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage your seasonal farming activities, tractor services, and harvest schedule
                </p>
              </div>
            </div>

            {agriSaveStatus && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                {agriSaveStatus}
              </div>
            )}

            {/* Availability Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Available for Farm & Agricultural Work
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  When enabled, your profile appears under "Find Agricultural Workers"
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={agriAvailable}
                  onChange={(e) => setAgriAvailable(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Preferred Activities */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Preferred Agricultural Activities
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {AGRI_ACTIVITIES_LIST.map((act) => {
                  const isChecked = agriActivities.includes(act);
                  return (
                    <label
                      key={act}
                      onClick={() => toggleAgriActivity(act)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{act}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Service Radius (km or District coverage)
                </label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={agriRadius}
                  onChange={(e) => setAgriRadius(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Expected Wage Rate (₹ / day or per acre)
                </label>
                <input
                  type="number"
                  min="200"
                  step="50"
                  value={agriExpectedWage}
                  onChange={(e) => setAgriExpectedWage(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Schedule Availability / Seasonal Months
              </label>
              <input
                type="text"
                value={agriSchedule}
                onChange={(e) => setAgriSchedule(e.target.value)}
                placeholder="e.g. Daily morning shifts (6 AM - 2 PM), Available full Rabi/Kharif season"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Agricultural Availability</span>
            </button>
          </form>
        )}

        {/* Tab 6: Edit Profile */}
        {activeTab === 'profile' && (
          <form
            onSubmit={handleProfileSubmit}
            className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Worker Profile & Rates</h2>

            {saveStatus && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                {saveStatus}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="New Delhi">New Delhi</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Lucknow">Lucknow</option>
                  <option value="Jaipur">Jaipur</option>
                  <option value="Pune">Pune</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Patna">Patna</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Service Area / Localities
                </label>
                <input
                  type="text"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="e.g. South Delhi, Noida Sector 18-62"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Daily Charge (₹)
                </label>
                <input
                  type="number"
                  min="100"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hourly Charge (₹)
                </label>
                <input
                  type="number"
                  min="50"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Bio English */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Professional Bio (English)
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            {/* Bio Hindi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                व्यावसायिक परिचय (हिंदी / Hindi Bio)
              </label>
              <textarea
                rows={3}
                value={bioHi}
                onChange={(e) => setBioHi(e.target.value)}
                placeholder="अपने अनुभव और कार्य शैली का संक्षेप में वर्णन करें..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Updates</span>
            </button>
          </form>
        )}

        {/* Enquiry Response Dialog Modal */}
        {activeEnquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {responseStatus === 'accepted' ? 'Accept Enquiry' : 'Decline Enquiry'} from {activeEnquiry.customer_name}
              </h3>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300">
                "{activeEnquiry.description}"
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message to Customer
                </label>
                <textarea
                  rows={3}
                  value={responseMsg}
                  onChange={(e) => setResponseMsg(e.target.value)}
                  placeholder={
                    responseStatus === 'accepted'
                      ? 'Confirmed, I will visit as per the schedule...'
                      : 'Sorry, I am occupied on that day...'
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveEnquiry(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRespondEnquiry}
                  className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700"
                >
                  Send Response
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Embedded Apply Job Modal */}
        <ApplyJobModal
          job={jobToApply}
          isOpen={!!jobToApply}
          onClose={() => setJobToApply(null)}
          onSuccess={() => {
            loadData();
          }}
        />
      </div>
    </div>
  );
};
