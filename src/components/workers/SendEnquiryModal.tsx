import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { api } from '../../api/client.ts';
import { WorkerDetail } from '../../types/index.ts';
import { X, Send, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SendEnquiryModalProps {
  worker: WorkerDetail;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SendEnquiryModal: React.FC<SendEnquiryModalProps> = ({
  worker,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, openAuthModal } = useAuth();
  const { t, language } = useLanguage();

  const [description, setDescription] = useState('');
  const [preferredSchedule, setPreferredSchedule] = useState('');
  const [categoryId, setCategoryId] = useState(worker.skills[0]?.category_id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (description.trim().length < 10) {
      setError('Please provide at least 10 characters describing the required work.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/api/enquiries', {
        worker_id: worker.id,
        category_id: categoryId || undefined,
        description,
        preferred_schedule: preferredSchedule,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDescription('');
        setPreferredSchedule('');
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit enquiry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold">{t('btnSendEnquiry')}</h2>
            <p className="text-xs text-slate-400">Direct booking request to {worker.full_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form or Success State */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Enquiry Sent Successfully!</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              {worker.full_name} will review your request and reply directly in your customer dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2 text-red-700 dark:text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Worker Summary Pill */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0">
                {worker.avatar_url ? (
                  <img src={worker.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                ) : (
                  worker.full_name.charAt(0)
                )}
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900 dark:text-white">{worker.full_name}</p>
                <p className="text-slate-500 dark:text-slate-400">
                  {worker.city} • {worker.experience_years} years exp
                </p>
              </div>
            </div>

            {/* Category selection if worker has multiple */}
            {worker.skills.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Service Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {worker.skills.map((s, idx) => (
                    <option key={idx} value={s.category_id}>
                      {language === 'hi' ? s.category_name_hi || s.skill_name : s.category_name || s.skill_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Describe the Work Needed *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the work in detail (e.g., need 2 ceiling fans installed, wiring check in master bedroom, fix dripping kitchen pipe)..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Preferred Schedule */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Schedule / Time
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={preferredSchedule}
                  onChange={(e) => setPreferredSchedule(e.target.value)}
                  placeholder="e.g. Tomorrow 10 AM, or Saturday afternoon"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? t('submitting') : 'Send Enquiry'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
