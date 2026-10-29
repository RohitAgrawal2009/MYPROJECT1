import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { api } from '../api/client.ts';
import { ServiceCategory, Job, AdminStats, AuditLogItem } from '../types/index.ts';
import {
  ShieldCheck,
  Trash2,
  History,
  Lock,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'categories' | 'jobs' | 'audit'>('stats');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Category State
  const [catName, setCatName] = useState('');
  const [catNameHi, setCatNameHi] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catIcon, setCatIcon] = useState('Wrench');
  const [catDesc, setCatDesc] = useState('');
  const [catDescHi, setCatDescHi] = useState('');
  const [catSuccess, setCatSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, u, c, j, logs] = await Promise.all([
        api.get<AdminStats>('/api/admin/stats'),
        api.get<any[]>('/api/admin/users'),
        api.get<ServiceCategory[]>('/api/categories'),
        api.get<Job[]>('/api/jobs?status=all'),
        api.get<AuditLogItem[]>('/api/admin/audit-logs'),
      ]);

      setStats(s);
      setUsersList(u);
      setCategories(c);
      setJobs(j);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadData();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center max-w-md shadow-xs space-y-4">
          <Lock className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Administrator Credentials Required</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            This portal is restricted to authorized JobBond platform moderators.
          </p>
          <button
            onClick={() => openAuthModal('login', 'customer')}
            className="px-5 py-2.5 bg-slate-900 dark:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Log in as Admin
          </button>
        </div>
      </div>
    );
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/api/admin/users/${userId}/status`, { is_active: !currentStatus });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatSuccess(null);
    try {
      await api.post('/api/admin/categories', {
        name: catName,
        name_hi: catNameHi,
        slug: catSlug,
        icon: catIcon,
        description: catDesc,
        description_hi: catDescHi,
      });

      setCatSuccess('Category created successfully!');
      setCatName('');
      setCatNameHi('');
      setCatSlug('');
      setCatDesc('');
      setCatDescHi('');
      loadData();
      setTimeout(() => setCatSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to create category');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Moderate and permanently delete this job listing?')) return;
    try {
      await api.delete(`/api/jobs/${jobId}`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Header */}
        <div className="bg-slate-950 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">JobBond Central Admin & Moderation</h1>
              <p className="text-xs text-slate-400">Enforcing platform safety, role management, and category curation</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
            System Operational
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'stats'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Platform Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            User Directory ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'categories'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Service Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'jobs'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Job Moderation ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Audit Logs ({auditLogs.length})
          </button>
        </div>

        {/* Tab 1: Stats */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Registered Users</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total_users}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{stats.total_customers} Customers</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Active Workers</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.active_workers}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{stats.total_workers} total profiles</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Jobs Listed</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total_jobs}</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.open_jobs} currently open</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Applications & Inquiries</p>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {stats.total_applications + stats.total_enquiries}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{stats.total_enquiries} direct enquiries</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User Directory */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Platform Registered Accounts</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">Details</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {u.full_name}
                        <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400">{u.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                              : u.role === 'worker'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{u.phone}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {u.worker_details ? (
                          <span>
                            {u.worker_details.city} • {u.worker_details.experience_years}y exp
                          </span>
                        ) : (
                          <span>Customer account</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {u.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                              u.is_active
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                            }`}
                          >
                            {u.is_active ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Categories Management */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Category Form */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add New Service Category</h3>
              {catSuccess && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl font-semibold">
                  {catSuccess}
                </div>
              )}
              <form onSubmit={handleCreateCategory} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Name (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => {
                      setCatName(e.target.value);
                      if (!catSlug) setCatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }}
                    placeholder="e.g. Mason / Rajmistri"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Name (हिंदी)
                  </label>
                  <input
                    type="text"
                    required
                    value={catNameHi}
                    onChange={(e) => setCatNameHi(e.target.value)}
                    placeholder="e.g. राजमिस्त्री"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Slug</label>
                  <input
                    type="text"
                    required
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    placeholder="mason"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Icon Key</label>
                  <select
                    value={catIcon}
                    onChange={(e) => setCatIcon(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Wrench">Wrench</option>
                    <option value="Hammer">Hammer</option>
                    <option value="Zap">Zap (Electric)</option>
                    <option value="Droplets">Droplets (Plumbing)</option>
                    <option value="Paintbrush">Paintbrush</option>
                    <option value="Sparkles">Sparkles (Cleaning)</option>
                    <option value="Wheat">Wheat (Agri)</option>
                    <option value="Users">Users (Labour)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl"
                >
                  Create Category
                </button>
              </form>
            </div>

            {/* Existing Categories List */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Current Platform Categories</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {c.name} ({c.name_hi})
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Slug: {c.slug} • Icon: {c.icon}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Job Moderation */}
        {activeTab === 'jobs' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Review & Moderate Job Postings</h2>
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{job.title}</h4>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {job.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{job.description}</p>
                    <p className="text-[11px] text-slate-400">
                      City: {job.location_city} • Budget: ₹{job.budget_min || 0} - ₹{job.budget_max || 0}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 text-xs font-bold rounded-lg flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Job</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Audit Logs */}
        {activeTab === 'audit' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Security & Moderation Audit Trail</h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{log.action}</span>
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{log.details}</p>
                  <p className="text-[11px] text-slate-400">
                    Admin: {log.admin_name} • Target: {log.target_type} ({log.target_id})
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
