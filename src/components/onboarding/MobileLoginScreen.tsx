import React, { useState, useEffect } from 'react';
import { Phone, ShieldCheck, ArrowRight, RefreshCw, AlertCircle, ArrowLeft, KeyRound, Sparkles, User, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface MobileLoginScreenProps {
  onSuccess?: () => void;
  onBackToLanguage?: () => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const MobileLoginScreen: React.FC<MobileLoginScreenProps> = ({
  onSuccess,
  onBackToLanguage,
  isModal = false,
  onClose,
}) => {
  const { sendOtp, verifyOtp, quickLogin, setOnboardingStep } = useAuth();
  const { t } = useLanguage();

  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  // Cooldown countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const validatePhone = (val: string) => {
    const clean = val.replace(/\D/g, '');
    return clean.length === 10 && /^[6-9]\d{9}$/.test(clean);
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const clean = phone.replace(/\D/g, '');
    if (!validatePhone(clean)) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)');
      return;
    }

    setLoading(true);
    const result = await sendOtp(clean);
    setLoading(false);

    if (result.success) {
      setStep('otp');
      setSuccessMsg(`OTP sent to ${countryCode} ${clean}`);
      setCooldown(result.cooldown || 60);
      if (result.preview_code) {
        setPreviewCode(result.preview_code);
      }
    } else {
      setError(result.error || 'Failed to send OTP. Please try again.');
      if (result.cooldown) {
        setCooldown(result.cooldown);
      }
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const clean = phone.replace(/\D/g, '');

    if (otpCode.trim().length !== 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    const result = await verifyOtp(clean, otpCode.trim());
    setLoading(false);

    if (result.success) {
      if (onSuccess) onSuccess();
    } else {
      setError(result.error || 'Verification failed. Please check the code.');
    }
  };

  const handleChangeNumber = () => {
    setStep('phone');
    setOtpCode('');
    setError(null);
    setSuccessMsg(null);
    setPreviewCode(null);
  };

  const handleQuickLogin = async (type: 'customer' | 'worker_elec' | 'worker_plumb' | 'admin') => {
    setLoading(true);
    try {
      await quickLogin(type);
      setOnboardingStep(null);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch {
      setError('Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between mb-4">
        {step === 'otp' ? (
          <button
            type="button"
            onClick={handleChangeNumber}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('changeNumber')}</span>
          </button>
        ) : onBackToLanguage ? (
          <button
            type="button"
            onClick={onBackToLanguage}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('changeLanguage')}</span>
          </button>
        ) : (
          <div />
        )}

        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            {t('close')}
          </button>
        )}
      </div>

      {/* Screen Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3 ring-1 ring-emerald-500/20">
          {step === 'phone' ? <Phone className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('welcomeTitle')}
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
          {step === 'phone'
            ? t('welcomeSubtitle')
            : `${t('otpSentTo')} ${countryCode} ${phone.slice(0, 3)}****${phone.slice(-3)}`}
        </p>
      </div>

      {/* Error & Info Alerts */}
      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-red-700 dark:text-red-400 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && !error && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Sandbox Preview Code Banner for Testing */}
      {previewCode && (
        <div className="mb-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-semibold">{t('testCodeBanner')}</span>{' '}
              <span className="font-mono text-sm font-bold tracking-widest text-emerald-600 dark:text-emerald-400 ml-1">
                {previewCode}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOtpCode(previewCode)}
            className="px-2.5 py-1 text-xs font-bold bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 rounded-lg hover:bg-amber-300 transition-colors"
          >
            {t('useTestCode')}
          </button>
        </div>
      )}

      {/* Step 1: Mobile Input Form */}
      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              {t('mobileNumberLabel')}
            </label>
            <div className="flex items-center rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-within:border-emerald-600 dark:focus-within:border-emerald-500 overflow-hidden shadow-sm transition-all">
              {/* Country Code Selector */}
              <div className="flex items-center gap-1 px-3.5 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm shrink-0">
                <span className="text-base">🇮🇳</span>
                <span>+91</span>
              </div>
              {/* Mobile Input */}
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(val);
                }}
                placeholder={t('enterMobile')}
                className="w-full px-4 py-3.5 text-base sm:text-lg font-bold tracking-wider text-slate-900 dark:text-white bg-transparent focus:outline-none placeholder:text-slate-400 placeholder:text-sm placeholder:tracking-normal placeholder:font-normal"
                autoFocus
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>We'll send a 6-digit OTP code to verify your phone.</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || phone.length < 10}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{t('getOtpBtn')}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* Step 2: OTP Verification Form */
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              {t('enterOtp')}
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              className="w-full text-center text-3xl font-extrabold tracking-[0.5em] px-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 shadow-sm"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length !== 6}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl shadow-lg shadow-emerald-600/25 transition-all"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{t('verifyOtpBtn')}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Resend Cooldown Row */}
          <div className="flex items-center justify-between pt-2 text-xs">
            {cooldown > 0 ? (
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {t('resendIn')} <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{cooldown}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleSendOtp()}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t('resendOtp')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleChangeNumber}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:white underline font-medium"
            >
              {t('changeNumber')}
            </button>
          </div>
        </form>
      )}

      {/* Production SMS Configuration Transparency Notice */}
      <div className="mt-8 pt-5 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed text-center">
        <p className="flex items-center justify-center gap-1.5 font-medium mb-1">
          <KeyRound className="w-3.5 h-3.5 text-slate-400" />
          <span>Real SMS Provider Integration</span>
        </p>
        <p>
          JobBond supports Fast2SMS & Twilio SMS Gateways. In developer sandbox mode, an instant test code is displayed above without carrier SMS charges.
        </p>
      </div>

      {/* Quick Demo Accounts Link for Evaluators */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setShowDemoAccounts(!showDemoAccounts)}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
        >
          <User className="w-3.5 h-3.5" />
          <span>{showDemoAccounts ? 'Hide Demo Logins' : '1-Click Demo Accounts (Admin, Worker, Customer)'}</span>
        </button>

        {showDemoAccounts && (
          <div className="mt-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('customer')}
              className="p-2 bg-white dark:bg-slate-900 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 border border-slate-200 dark:border-slate-800"
            >
              👤 Customer (Rohan)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('worker_elec')}
              className="p-2 bg-white dark:bg-slate-900 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 border border-slate-200 dark:border-slate-800"
            >
              ⚡ Electrician (Rajesh)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('worker_plumb')}
              className="p-2 bg-white dark:bg-slate-900 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 border border-slate-200 dark:border-slate-800"
            >
              🚰 Plumber (Amit)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="p-2 bg-white dark:bg-slate-900 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 border border-slate-200 dark:border-slate-800"
            >
              🛡️ Admin (Pooja)
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white dark:bg-slate-900 rounded-3xl max-h-[92vh] overflow-y-auto w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-slate-100 to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-10 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800">
        {content}
      </div>
    </div>
  );
};
