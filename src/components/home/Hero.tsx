import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Search,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
  Users,
  Sprout,
  Wrench,
  Check,
} from 'lucide-react';

interface HeroProps {
  onSearch: (skill: string, city: string) => void;
  onFindWorkClick: () => void;
  onAgriClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, onFindWorkClick, onAgriClick }) => {
  const { t } = useLanguage();
  const { openAuthModal } = useAuth();
  const [skill, setSkill] = useState('');
  const [city, setCity] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(skill, city);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-800">
      {/* Background Subtle Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full"></div>
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-500/10 blur-3xl pointer-events-none rounded-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Two-column desktop grid stacking on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline, Copy, Search, CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>India's Trusted Worker & Employment Network</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
              {t('heroHeading')}
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              {t('heroDescription')}
            </p>

            {/* Quick Search Form */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white dark:bg-slate-800 p-2 sm:p-2.5 rounded-2xl shadow-2xl border border-slate-700/60 flex flex-col sm:flex-row gap-2 text-slate-900 text-left max-w-xl"
            >
              <div className="flex-1 flex items-center px-3 gap-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-emerald-500 transition-all">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  placeholder={t('searchSkillPlaceholder')}
                  className="w-full py-2.5 text-xs sm:text-sm bg-transparent focus:outline-none font-medium placeholder:text-slate-400 text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:w-44 flex items-center px-2.5 gap-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-emerald-500 transition-all">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full py-2.5 text-xs bg-transparent focus:outline-none font-medium text-slate-700 dark:text-slate-200"
                >
                  <option value="" className="text-slate-900">{t('allCities')}</option>
                  <option value="New Delhi" className="text-slate-900">Delhi NCR</option>
                  <option value="Mumbai" className="text-slate-900">Mumbai</option>
                  <option value="Bengaluru" className="text-slate-900">Bengaluru</option>
                  <option value="Lucknow" className="text-slate-900">Lucknow</option>
                  <option value="Chandigarh" className="text-slate-900">Chandigarh / Punjab</option>
                  <option value="Jaipur" className="text-slate-900">Jaipur</option>
                  <option value="Pune" className="text-slate-900">Pune</option>
                  <option value="Hyderabad" className="text-slate-900">Hyderabad</option>
                </select>
              </div>

              <button
                type="submit"
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t('btnFindWorker')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Dual CTA Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onSearch('', '')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span>{t('btnFindWorker')}</span>
              </button>
              <button
                onClick={onFindWorkClick}
                className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>{t('btnFindWork')}</span>
              </button>
              {onAgriClick && (
                <button
                  onClick={onAgriClick}
                  className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
                >
                  <Sprout className="w-4 h-4 text-amber-400" />
                  <span>{t('navAgriculture')}</span>
                </button>
              )}
            </div>

            {/* Quick 3 verification bullet points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('heroStats1')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('heroStats2')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('heroStats3')}</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-quality visual showcase of Indian workers */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative card */}
              <div className="p-4 sm:p-5 rounded-3xl bg-slate-800/70 backdrop-blur-md border border-slate-700/80 shadow-2xl space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-200">Live Active Worker Directory</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                    Direct Connections
                  </span>
                </div>

                {/* Worker Card 1: Electrician / Technician */}
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-emerald-500/50 transition-all flex items-center gap-3 group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0">
                    RS
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white truncate">Ramesh Sharma</p>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                        Available Today
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">Certified Electrician • 8 Yrs Exp</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" /> 4.9 (42)
                      </span>
                      <span>•</span>
                      <span>South Delhi NCR</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-200">₹600/day</span>
                    </div>
                  </div>
                </div>

                {/* Worker Card 2: Tractor & Agricultural Operator */}
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/40 hover:border-emerald-500 transition-all flex items-center gap-3 group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0">
                    BS
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white truncate">Balwant Singh</p>
                      <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/50">
                        Farm Machinery & Harvest
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-300">Tractor, Sowing & Combine Specialist</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" /> 5.0 (29)
                      </span>
                      <span>•</span>
                      <span>Punjab / Haryana Belt</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-200">₹800/day</span>
                    </div>
                  </div>
                </div>

                {/* Worker Card 3: Carpenter / Interior */}
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-emerald-500/50 transition-all flex items-center gap-3 group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-orange-800 text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0">
                    PK
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white truncate">Prakash Kumar</p>
                      <span className="text-[10px] font-semibold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                        Available in 2 Days
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">Master Carpenter & Wood Craftsman</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" /> 4.8 (35)
                      </span>
                      <span>•</span>
                      <span>Bengaluru Urban</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-200">₹700/day</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Trust Row */}
                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Direct Phone & WhatsApp
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 0% Middleman Commission
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
