import React, { useState } from 'react';
import { UserCheck, Briefcase, Check, ArrowRight, Home, Wrench, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface UserTypeScreenProps {
  onContinue?: () => void;
  isModal?: boolean;
}

export const UserTypeScreen: React.FC<UserTypeScreenProps> = ({ onContinue, isModal = false }) => {
  const { user, setUserRole } = useAuth();
  const { t } = useLanguage();

  const [selectedRole, setSelectedRole] = useState<'customer' | 'worker'>('customer');
  const [loading, setLoading] = useState(false);

  const handleProceed = async () => {
    setLoading(true);
    try {
      await setUserRole(selectedRole);
      if (onContinue) onContinue();
    } catch (err) {
      console.error('Failed to set role:', err);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4 ring-1 ring-emerald-500/20">
          <Sparkles className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('userTypeHeading')}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          {t('userTypeSubheading')}
        </p>
      </div>

      {/* Two Large Visual Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* Card 1: I Need a Worker (Customer) */}
        <button
          type="button"
          onClick={() => setSelectedRole('customer')}
          className={`relative p-6 sm:p-7 rounded-3xl border-2 transition-all duration-200 text-left flex flex-col justify-between focus:outline-none focus:ring-4 focus:ring-emerald-500/20 group ${
            selectedRole === 'customer'
              ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-500 shadow-xl shadow-emerald-600/10 ring-2 ring-emerald-600/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          {/* Top Row with Icon & Check */}
          <div className="flex items-center justify-between w-full mb-6">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                selectedRole === 'customer'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <UserCheck className="w-7 h-7" />
            </div>

            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                selectedRole === 'customer'
                  ? 'bg-emerald-600 text-white'
                  : 'border-2 border-slate-300 dark:border-slate-700'
              }`}
            >
              {selectedRole === 'customer' && <Check className="w-4 h-4 stroke-[3]" />}
            </div>
          </div>

          {/* Titles & Hindi Copy */}
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
              {t('needWorkerTitle')}
            </h3>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              {t('needWorkerHindi')}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('needWorkerSubtitle')}
            </p>
          </div>
        </button>

        {/* Card 2: I Need Work (Worker) */}
        <button
          type="button"
          onClick={() => setSelectedRole('worker')}
          className={`relative p-6 sm:p-7 rounded-3xl border-2 transition-all duration-200 text-left flex flex-col justify-between focus:outline-none focus:ring-4 focus:ring-emerald-500/20 group ${
            selectedRole === 'worker'
              ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-500 shadow-xl shadow-emerald-600/10 ring-2 ring-emerald-600/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          {/* Top Row with Icon & Check */}
          <div className="flex items-center justify-between w-full mb-6">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                selectedRole === 'worker'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Briefcase className="w-7 h-7" />
            </div>

            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                selectedRole === 'worker'
                  ? 'bg-emerald-600 text-white'
                  : 'border-2 border-slate-300 dark:border-slate-700'
              }`}
            >
              {selectedRole === 'worker' && <Check className="w-4 h-4 stroke-[3]" />}
            </div>
          </div>

          {/* Titles & Hindi Copy */}
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
              {t('needWorkTitle')}
            </h3>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              {t('needWorkHindi')}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('needWorkSubtitle')}
            </p>
          </div>
        </button>
      </div>

      {/* Prominent Continue Button */}
      <button
        type="button"
        disabled={loading}
        onClick={handleProceed}
        className="w-full flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5"
      >
        <span>Continue / आगे बढ़ें</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white dark:bg-slate-900 rounded-3xl max-h-[92vh] overflow-y-auto w-full max-w-xl shadow-2xl border border-slate-200 dark:border-slate-800">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-slate-100 to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-10 px-4">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800">
        {content}
      </div>
    </div>
  );
};
