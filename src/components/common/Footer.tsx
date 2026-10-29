import React from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { ShieldCheck, Mail, MapPin, Sprout, Heart } from 'lucide-react';

interface FooterProps {
  onCategoryClick?: (categorySlug: string) => void;
  onPageChange?: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onCategoryClick, onPageChange }) => {
  const { t } = useLanguage();

  const categories = [
    { name: t('catElectrician'), slug: 'electrician' },
    { name: t('catPlumber'), slug: 'plumber' },
    { name: t('catCarpenter'), slug: 'carpenter' },
    { name: t('catPainter'), slug: 'painter' },
    { name: t('catCleaner'), slug: 'cleaner' },
    { name: t('catTutor'), slug: 'tutor' },
    { name: t('catAgri'), slug: 'agricultural-worker', isAgri: true },
    { name: t('catLabour'), slug: 'general-labour' },
    { name: t('catAppliance'), slug: 'appliance-repair' },
  ];

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 font-black text-xl flex items-center justify-center">
                JB
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Job<span className="text-emerald-400">Bond</span>
              </span>
            </div>
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
              {t('brandTagline')}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('footerMission')}
            </p>
            <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero Aadhaar leakage • Direct verified contacts</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {t('footerLinks')}
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onPageChange?.('find-workers')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {t('navFindWorkers')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onPageChange?.('find-jobs')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {t('navFindJobs')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onPageChange?.('agriculture')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('navAgriculture')}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onPageChange?.('how-it-works')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {t('navHowItWorks')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onPageChange?.('about')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {t('navAbout')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onPageChange?.('contact')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {t('navContact')}
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {t('footerCategories')}
            </h3>
            <ul className="grid grid-cols-1 gap-2 text-xs text-slate-400">
              {categories.map((c) => (
                <li key={c.slug}>
                  <button
                    onClick={() => {
                      if (c.isAgri) {
                        if (onPageChange) onPageChange('agriculture');
                      } else {
                        if (onCategoryClick) onCategoryClick(c.slug);
                        if (onPageChange) onPageChange('find-workers');
                      }
                    }}
                    className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5"
                  >
                    {c.isAgri && <Sprout className="w-3 h-3 text-emerald-400" />}
                    <span>{c.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Safety & Contact */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {t('footerHelpSafety')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              JobBond promotes safe worker hiring and dignified local employment. Always agree on project scope, safety gear, and material costs prior to work commencement.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Pan-India: Punjab, Haryana, Delhi NCR, Maharashtra, Tamil Nadu & across states</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>support@jobbond.in</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} JobBond India. {t('footerRights')}</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Fair Wage Charter</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
