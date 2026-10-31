import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { X, Lock, Mail, User as UserIcon, Phone, Briefcase, MapPin, Award, IndianRupee, AlertCircle } from 'lucide-react';
import { api } from '../../api/client.ts';
import { ServiceCategory } from '../../types/index.ts';
import { MobileLoginScreen } from '../onboarding/MobileLoginScreen.tsx';

export const AuthModal: React.FC = () => {
  const { authModalState, closeAuthModal, login, register, quickLogin } = useAuth();
  const { t, language } = useLanguage();

  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'customer' | 'worker'>('customer');
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [prefLang, setPrefLang] = useState<'en' | 'hi'>('en');
  const [city, setCity] = useState('New Delhi');
  const [serviceArea, setServiceArea] = useState('');
  const [experienceYears, setExperienceYears] = useState('3');
  const [categoryId, setCategoryId] = useState('');
  const [dailyRate, setDailyRate] = useState('900');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authModalState.isOpen) {
      setMode(authModalState.mode);
      setRole(authModalState.defaultRole);
      setError(null);
      api.get<ServiceCategory[]>('/api/categories').then(setCategories).catch(() => {});
    }
  }, [authModalState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        const payload: any = {
          email,
          password,
          full_name: fullName,
          phone,
          role,
          preferred_lang: prefLang,
        };

        if (role === 'worker') {
          payload.city = city;
          payload.service_area = serviceArea || 'City Wide';
          payload.experience_years = Number(experienceYears) || 1;
          payload.category_id = categoryId || (categories[0]?.id || '');
          payload.daily_rate = Number(dailyRate) || 800;
        }

        await register(payload);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemo = async (type: 'customer' | 'worker_elec' | 'worker_plumb' | 'admin') => {
    setError(null);
    setIsSubmitting(true);
    try {
      await quickLogin(type);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authModalState.isOpen) return null;

  if (authMethod === 'otp') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
        <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
          <div className="flex items-center justify-between px-6 pt-5 pb-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              ⚡ Mobile Number + OTP
            </span>
            <button
              type="button"
              onClick={() => setAuthMethod('password')}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 underline"
            >
              Email & Password Login →
            </button>
          </div>
          <MobileLoginScreen
            isModal={false}
            onClose={closeAuthModal}
            onSuccess={() => {
              closeAuthModal();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xl shadow-inner">
              JB
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {mode === 'login' ? t('modalLoginTitle') : t('modalRegisterTitle')}
              </h2>
              <p className="text-xs text-slate-400">JobBond • {t('brandTagline')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAuthMethod('otp')}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium"
            >
              Mobile OTP
            </button>
            <button
              onClick={closeAuthModal}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-all ${
              mode === 'login'
                ? 'border-emerald-600 text-slate-900 dark:text-white bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {t('navLogin')}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-all ${
              mode === 'register'
                ? 'border-emerald-600 text-slate-900 dark:text-white bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {t('navSignUp')}
          </button>
        </div>

        {/* Quick Demo Logins Panel */}
        <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/40">
          <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {t('quickDemoLogins')}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleDemo('customer')}
              className="py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200 font-medium hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors text-left flex items-center gap-1.5"
            >
              <UserIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{t('demoCustomer')}</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleDemo('worker_elec')}
              className="py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200 font-medium hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors text-left flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{t('demoWorkerElec')}</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleDemo('worker_plumb')}
              className="py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200 font-medium hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors text-left flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{t('demoWorkerPlumb')}</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleDemo('admin')}
              className="py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="truncate">{t('demoAdmin')}</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2.5 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <>
              {/* Role Toggle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  {t('iAmA')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`py-2 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                      role === 'customer'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('roleCustomer')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('worker')}
                    className={`py-2 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                      role === 'worker'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('roleWorker')}</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('fullName')} *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('phoneNumber')} *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Preferred Language */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('preferredLanguage')}
                </label>
                <select
                  value={prefLang}
                  onChange={(e) => setPrefLang(e.target.value as 'en' | 'hi')}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                >
                  <option value="en">English (अंग्रेजी)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                </select>
              </div>

              {/* Worker Specific Fields */}
              {role === 'worker' && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <p className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                    Worker Profile Setup
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">City</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                      >
                        <option value="New Delhi">New Delhi</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Lucknow">Lucknow</option>
                        <option value="Chandigarh">Chandigarh / Punjab</option>
                        <option value="Jaipur">Jaipur</option>
                        <option value="Pune">Pune</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Patna">Patna</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Experience (Yrs)</label>
                      <input
                        type="number"
                        min="0"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Primary Skill Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                    >
                      <option value="">Select Primary Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {language === 'hi' ? c.name_hi : c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Service Area / Colony</label>
                      <input
                        type="text"
                        value={serviceArea}
                        onChange={(e) => setServiceArea(e.target.value)}
                        placeholder="e.g. South Delhi, Dwarka"
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Indicative Daily Rate (₹)</label>
                      <input
                        type="number"
                        min="100"
                        value={dailyRate}
                        onChange={(e) => setDailyRate(e.target.value)}
                        placeholder="800"
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('emailAddress')} *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('password')} *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>{t('submitting')}</span>
            ) : mode === 'login' ? (
              <span>{t('navLogin')}</span>
            ) : (
              <span>{t('navSignUp')}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
