import React, { useState } from 'react';
import { User, MapPin, Wrench, Briefcase, IndianRupee, Check, ArrowRight, RefreshCw, Sparkles, Sprout, Zap, Droplets, Hammer, Paintbrush, Truck, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface ProfileSetupScreenProps {
  onSuccess?: () => void;
  isModal?: boolean;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ onSuccess, isModal = false }) => {
  const { user, workerProfile, completeProfile } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const isWorker = user?.role === 'worker';

  // Form State
  const [fullName, setFullName] = useState(
    user?.full_name && !user.full_name.startsWith('Worker / Customer') ? user.full_name : ''
  );
  const [city, setCity] = useState(user?.city || 'Pune');
  const [village, setVillage] = useState(user?.village || '');
  const [trade, setTrade] = useState('electrician');
  const [expYears, setExpYears] = useState(3);
  const [dailyRate, setDailyRate] = useState(800);
  const [isAvailableToday, setIsAvailableToday] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick Indian Cities
  const popularCities = ['Pune', 'New Delhi', 'Mumbai', 'Ludhiana', 'Jaipur', 'Varanasi', 'Patna', 'Bengaluru'];

  // Trade definitions for Workers
  const trades = [
    { id: 'cat-elec', slug: 'electrician', name: 'Electrician', name_hi: 'इलेक्ट्रीशियन', icon: Zap },
    { id: 'cat-plumb', slug: 'plumber', name: 'Plumber', name_hi: 'प्लंबर (नलसाज)', icon: Droplets },
    { id: 'cat-carp', slug: 'carpenter', name: 'Carpenter', name_hi: 'बढ़ई (कारपेंटर)', icon: Hammer },
    { id: 'cat-agri', slug: 'agricultural-worker', name: 'Farm / Agri Worker', name_hi: 'कृषि व खेत मजदूर', icon: Sprout },
    { id: 'cat-mason', slug: 'mason', name: 'Mason / Rajmistri', name_hi: 'राजमिस्त्री', icon: Wrench },
    { id: 'cat-paint', slug: 'painter', name: 'Painter', name_hi: 'पेंटर', icon: Paintbrush },
    { id: 'cat-clean', slug: 'cleaner', name: 'Cleaner / Housekeeper', name_hi: 'सफाई कर्मचारी', icon: Sparkles },
    { id: 'cat-mech', slug: 'mechanic', name: 'Mechanic / Driver', name_hi: 'मैकेनिक / चालक', icon: Truck },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }

    if (!city.trim()) {
      setError('Please provide your city, town, or village.');
      return;
    }

    setLoading(true);
    try {
      const selectedTradeObj = trades.find((t) => t.slug === trade);
      await completeProfile({
        full_name: fullName.trim(),
        city: city.trim(),
        village: village.trim() || city.trim(),
        preferred_lang: language,
        trade: isWorker ? selectedTradeObj?.name : undefined,
        category_id: isWorker ? selectedTradeObj?.id : undefined,
        experience_years: isWorker ? expYears : undefined,
        daily_rate: isWorker ? dailyRate : undefined,
        availability_status: isWorker ? (isAvailableToday ? 'available' : 'busy') : undefined,
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3 ring-1 ring-emerald-500/20">
          {isWorker ? <Wrench className="w-7 h-7" /> : <User className="w-7 h-7" />}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('profileSetupTitle')}
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
          {isWorker
            ? 'Tell customers about your trade, experience, and daily wage expectations.'
            : 'Enter your basic details so local workers and service providers can connect with you.'}
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs sm:text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Your Full Name / आपका पूरा नाम <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Kumar / Gurpreet Singh"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base font-medium focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 shadow-sm"
              autoFocus
            />
          </div>
        </div>

        {/* City / District / Village */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            City, Town or Village / शहर या गाँव <span className="text-red-500">*</span>
          </label>
          <div className="relative mb-2">
            <MapPin className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={t('cityVillagePlaceholder')}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base font-medium focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 shadow-sm"
            />
          </div>

          {/* Quick Indian City Pills */}
          <div className="flex flex-wrap gap-1.5">
            {popularCities.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCity(c)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  city === c
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* WORKER SPECIFIC FIELDS */}
        {isWorker && (
          <>
            {/* Primary Trade Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Primary Trade / आपका मुख्य काम <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {trades.map((tItem) => {
                  const Icon = tItem.icon;
                  const isSelected = trade === tItem.slug;
                  return (
                    <button
                      key={tItem.slug}
                      type="button"
                      onClick={() => setTrade(tItem.slug)}
                      className={`p-3 rounded-2xl border-2 text-left flex flex-col items-center text-center justify-center transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm ring-1 ring-emerald-600/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold leading-tight">{tItem.name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {tItem.name_hi}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience & Daily Wage Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Experience */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Experience / अनुभव
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 3, 5, 8].map((yrs) => (
                    <button
                      key={yrs}
                      type="button"
                      onClick={() => setExpYears(yrs)}
                      className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                        expYears === yrs
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {yrs === 8 ? '8+ Yrs' : `${yrs} Yrs`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expected Daily Wage */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Daily Wage (दिहाड़ी) / दिन
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-base">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={200}
                    step={50}
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Availability Status Toggle */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 flex items-center justify-between">
              <div>
                <span className="block text-sm font-bold text-slate-900 dark:text-white">
                  {t('availableTodayLabel')}
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Show your profile as active for new bookings and immediate work
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAvailableToday(!isAvailableToday)}
                className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAvailableToday ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isAvailableToday ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5"
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>{t('finishSetupBtn')}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
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
