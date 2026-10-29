import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { api } from '../../api/client.ts';
import { X, Sprout, Calendar, Users, DollarSign, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

interface PostAgriJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AGRI_ACTIVITIES = [
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

export const PostAgriJobModal: React.FC<PostAgriJobModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, openAuthModal } = useAuth();
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [agriActivity, setAgriActivity] = useState(AGRI_ACTIVITIES[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [workersNeeded, setWorkersNeeded] = useState(2);
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('3-5 Days');
  const [budgetMin, setBudgetMin] = useState(500);
  const [paymentBasis, setPaymentBasis] = useState<'Daily' | 'Per Acre' | 'Contract' | 'Hourly'>('Daily');
  const [schedule, setSchedule] = useState('Morning shift (6 AM - 2 PM)');
  const [mealsAccommodation, setMealsAccommodation] = useState(true);
  const [accommodationDetails, setAccommodationDetails] = useState('Lunch and tea provided at the field');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!title.trim() || !location.trim() || !description.trim()) {
      setError('Please fill in title, farm location, and description.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.post('/api/jobs', {
        title,
        category_id: 'cat-agri',
        description,
        location,
        budget_min: Number(budgetMin),
        budget_max: Number(budgetMin) * 1.2,
        budget_type: 'daily',
        urgency: 'medium',
        status: 'open',
        agri_activity: agriActivity,
        workers_needed: Number(workersNeeded),
        start_date: startDate || new Date().toISOString().split('T')[0],
        duration,
        payment_basis: paymentBasis,
        meals_accommodation: mealsAccommodation,
        accommodation_details: accommodationDetails,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error creating job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 dark:bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('agriPostJobTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('agriPostJobSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Agricultural Job Posted Successfully!
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Local farm workers and operators will be notified and can apply directly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs font-semibold text-red-700 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Work Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 4 Workers for Wheat Harvesting & Threshing"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Agricultural Activity *
                </label>
                <select
                  value={agriActivity}
                  onChange={(e) => setAgriActivity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {AGRI_ACTIVITIES.map((act) => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Workers Needed
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={workersNeeded}
                    onChange={(e) => setWorkersNeeded(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Duration / Tenure
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 3-5 days, 2 weeks"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Wage Rate (₹)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="number"
                    min={200}
                    step={20}
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Basis
                </label>
                <select
                  value={paymentBasis}
                  onChange={(e) => setPaymentBasis(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Daily">Daily Wage</option>
                  <option value="Per Acre">Per Acre Basis</option>
                  <option value="Contract">Fixed Contract / Lumpsum</option>
                  <option value="Hourly">Hourly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Farm / Field Location *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Karnal Road, GT Belt, Haryana"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description & Requirements *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention crop type, field size, tools required or provided, pick-up point if any..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Meals and Accommodation */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mealsAccommodation}
                  onChange={(e) => setMealsAccommodation(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t('agriMealsAccommodation')} (Tea, Food, or Rest shed provided)
                </span>
              </label>

              {mealsAccommodation && (
                <input
                  type="text"
                  value={accommodationDetails}
                  onChange={(e) => setAccommodationDetails(e.target.value)}
                  placeholder="e.g. Free lunch & afternoon tea provided"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition-all"
              >
                {submitting ? 'Posting...' : 'Post Farm Work'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
