import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { ArrowRight, Check } from 'lucide-react';

interface HowItWorksProps {
  onFindWorkersClick: () => void;
  onPostJobClick: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onFindWorkersClick, onPostJobClick }) => {
  const { t } = useLanguage();
  const { user, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'customer' | 'worker'>('customer');

  return (
    <section className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('howItWorksHeading')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            {t('howItWorksSubheading')}
          </p>

          {/* Toggle buttons */}
          <div className="inline-flex p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs mt-2">
            <button
              onClick={() => setActiveTab('customer')}
              className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                activeTab === 'customer'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('tabForCustomers')}
            </button>
            <button
              onClick={() => setActiveTab('worker')}
              className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                activeTab === 'worker'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('tabForWorkers')}
            </button>
          </div>
        </div>

        {/* Steps Grid */}
        {activeTab === 'customer' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center justify-center text-lg mb-4 border border-emerald-100 dark:border-emerald-800">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {t('step1CustomerTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('step1CustomerDesc')}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center justify-center text-lg mb-4 border border-emerald-100 dark:border-emerald-800">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {t('step2CustomerTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('step2CustomerDesc')}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center justify-center text-lg mb-4 border border-emerald-100 dark:border-emerald-800">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {t('step3CustomerTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('step3CustomerDesc')}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center justify-center text-lg mb-4 border border-indigo-100 dark:border-indigo-800">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {t('step1WorkerTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('step1WorkerDesc')}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center justify-center text-lg mb-4 border border-indigo-100 dark:border-indigo-800">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {t('step2WorkerTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('step2WorkerDesc')}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center justify-center text-lg mb-4 border border-indigo-100 dark:border-indigo-800">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {t('step3WorkerTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('step3WorkerDesc')}
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-10 text-center">
          {activeTab === 'customer' ? (
            <button
              onClick={onFindWorkersClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>{t('btnFindWorker')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (user) {
                  onPostJobClick();
                } else {
                  openAuthModal('register', 'worker');
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>Join JobBond as a Worker</span>
              <ArrowRight className="w-4 h-4 text-emerald-400 dark:text-white" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
