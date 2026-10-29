import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { api } from '../../api/client.ts';
import { Job } from '../../types/index.ts';
import { X, Send, IndianRupee, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ApplyJobModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, openAuthModal } = useAuth();
  const { t } = useLanguage();

  const [proposedRate, setProposedRate] = useState<string>('');
  const [coverMessage, setCoverMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login', 'worker');
      return;
    }

    if (user.role !== 'worker' && user.role !== 'admin') {
      setError('Only registered workers can apply for job postings.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post(`/api/jobs/${job.id}/applications`, {
        proposed_rate: proposedRate ? Number(proposedRate) : undefined,
        cover_message: coverMessage,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setCoverMessage('');
        setProposedRate('');
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application.');
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
            <h2 className="text-lg font-bold">{t('btnApplyJob')}</h2>
            <p className="text-xs text-slate-400">Direct proposal to the job poster</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Application Submitted!</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              The customer has received your application. You can track this in your Worker Dashboard.
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

            {/* Job Summary Banner */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-900 dark:text-white">{job.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {job.location_city} • {job.service_area} • Budget: ₹{job.budget_min || 0} - ₹{job.budget_max || 0} ({job.pay_type})
              </p>
            </div>

            {/* Proposed Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Proposed Rate (₹)
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="0"
                  value={proposedRate}
                  onChange={(e) => setProposedRate(e.target.value)}
                  placeholder={`Suggest your charge (e.g. ${job.budget_min || 1000})`}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Cover Message */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cover Message / Brief Introduction
              </label>
              <textarea
                rows={4}
                value={coverMessage}
                onChange={(e) => setCoverMessage(e.target.value)}
                placeholder="Briefly state your relevant experience, tools you bring, or earliest availability..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
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
                <span>{loading ? t('submitting') : 'Submit Application'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
