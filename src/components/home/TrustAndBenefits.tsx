import React from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import {
  MapPin,
  FileText,
  PhoneCall,
  TrendingUp,
  Coins,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface TrustAndBenefitsProps {
  onGetStarted?: () => void;
}

export const TrustAndBenefits: React.FC<TrustAndBenefitsProps> = ({ onGetStarted }) => {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: MapPin,
      title: t('benefitEasyDiscoveryTitle'),
      desc: t('benefitEasyDiscoveryDesc'),
      color: 'emerald',
    },
    {
      icon: FileText,
      title: t('benefitClearInfoTitle'),
      desc: t('benefitClearInfoDesc'),
      color: 'blue',
    },
    {
      icon: PhoneCall,
      title: t('benefitDirectEnquiryTitle'),
      desc: t('benefitDirectEnquiryDesc'),
      color: 'purple',
    },
    {
      icon: TrendingUp,
      title: t('benefitWorkerOppsTitle'),
      desc: t('benefitWorkerOppsDesc'),
      color: 'amber',
    },
    {
      icon: Coins,
      title: t('benefitTransparentPricingTitle'),
      desc: t('benefitTransparentPricingDesc'),
      color: 'teal',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Fair Employment & Direct Connection</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('benefitsHeading')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Engineered to empower Indian workers and make finding dependable local assistance seamless and honest.
          </p>
        </div>

        {/* 5 Points Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-2xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2">
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified standard</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Banner */}
        <div className="mt-14 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Ready to find trusted workers or offer your skilled services?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Join thousands of Indian homeowners, contractors, electricians, plumbers, and farm workers on JobBond today.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                if (onGetStarted) {
                  onGetStarted();
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
