import React, { useState } from 'react';
import { Check, Globe, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { Language } from '../../types/index.ts';

interface LanguageSelectScreenProps {
  onContinue?: () => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const LanguageSelectScreen: React.FC<LanguageSelectScreenProps> = ({
  onContinue,
  isModal = false,
  onClose,
}) => {
  const { language, setLanguage, confirmLanguageSelection, languages } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<Language>(language);

  const handleSelect = (code: Language) => {
    setSelectedLang(code);
    setLanguage(code);
  };

  const handleProceed = () => {
    confirmLanguageSelection(selectedLang);
    if (onContinue) {
      onContinue();
    }
  };

  // Subtitle translations in the 8 respective languages
  const subtitles: Record<Language, string> = {
    en: 'Select your preferred language to continue',
    hi: 'अपनी पसंदीदा भाषा चुनें',
    pa: 'ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ',
    bn: 'আপনার পছন্দের ভাষা নির্বাচন করুন',
    mr: 'तुमची पसंतीची भाषा निवडा',
    ta: 'உங்கள் விருப்ப மொழியைத் தேர்ந்தெடுக்கவும்',
    te: 'మీకు కావలసిన భాషను ఎంచుకోండి',
    gu: 'તમારી પસંદગીની ભાષા પસંદ કરો',
  };

  const content = (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 md:p-8">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4 ring-1 ring-emerald-500/20">
          <Globe className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Choose Your Language
        </h1>
        <p className="mt-2 text-base sm:text-lg font-medium text-emerald-600 dark:text-emerald-400">
          {subtitles[selectedLang] || 'अपनी पसंदीदा भाषा चुनें'}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          JobBond is available in 8 major Indian languages. You can change this anytime.
        </p>
      </div>

      {/* Language Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
        {languages.map((lang) => {
          const isSelected = selectedLang === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang.code)}
              className={`relative flex flex-col items-start p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 text-left focus:outline-none focus:ring-4 focus:ring-emerald-500/20 ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-500 shadow-md shadow-emerald-500/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="w-full flex items-center justify-between mb-2">
                <span
                  className={`text-xl sm:text-2xl font-bold ${
                    isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {lang.nativeName}
                </span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                {lang.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action CTA */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleProceed}
          className="w-full flex-1 flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5"
        >
          <span>Continue / आगे बढ़ें</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
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
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-2 sm:p-4">
        {content}
      </div>
    </div>
  );
};
