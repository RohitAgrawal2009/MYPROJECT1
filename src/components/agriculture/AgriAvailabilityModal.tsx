import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { X, Sprout, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../api/client.ts';
import { WorkerDetail } from '../../types/index.ts';

interface AgriAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  workerProfile: WorkerDetail | null;
  onSuccess: (updated: any) => void;
}

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

export const AgriAvailabilityModal: React.FC<AgriAvailabilityModalProps> = ({
  isOpen,
  onClose,
  workerProfile,
  onSuccess,
}) => {
  const { t } = useLanguage();

  const [available, setAvailable] = useState<boolean>(workerProfile?.agri_available ?? true);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(
    workerProfile?.agri_activities || ['Harvesting', 'General Farm Labour']
  );
  const [serviceRadius, setServiceRadius] = useState<number>(Number(workerProfile?.agri_service_radius) || 25);
  const [schedule, setSchedule] = useState<string>(workerProfile?.agri_schedule || 'Daily / Seasonal');
  const [expectedWage, setExpectedWage] = useState<number>(workerProfile?.agri_expected_wage || 550);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const toggleActivity = (act: string) => {
    setSelectedActivities((prev) =>
      prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const updated = await api.patch('/api/workers/profile', {
        agri_available: available,
        agri_activities: selectedActivities,
        agri_service_radius: Number(serviceRadius),
        agri_schedule: schedule,
        agri_expected_wage: Number(expectedWage),
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onSuccess(updated);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Error saving availability');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/60 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('agriManageAvailability')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Set your farm work availability and expected daily rates
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

        {savedSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Agricultural Availability Updated!
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Farmers and contractors can now see your live schedule and work preferences.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs font-semibold text-red-700 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Availability Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Available for Agricultural Work
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Turn on to appear in "Find Agricultural Workers"
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Activities Checkboxes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Preferred Agricultural Activities
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AGRI_ACTIVITIES_LIST.map((act) => {
                  const isChecked = selectedActivities.includes(act);
                  return (
                    <label
                      key={act}
                      onClick={() => toggleActivity(act)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
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
                  Service Radius (km)
                </label>
                <input
                  type="number"
                  min={5}
                  max={200}
                  value={serviceRadius}
                  onChange={(e) => setServiceRadius(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Expected Wage Rate (₹ / day)
                </label>
                <input
                  type="number"
                  min={200}
                  step={50}
                  value={expectedWage}
                  onChange={(e) => setExpectedWage(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Schedule Availability / Days
              </label>
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="e.g. Daily mornings (6 AM - 2 PM), Full season available"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
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
                {submitting ? 'Saving...' : 'Save Availability'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
