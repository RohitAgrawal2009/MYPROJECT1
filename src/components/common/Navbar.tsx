import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import {
  Menu,
  X,
  Globe,
  Sun,
  Moon,
  Monitor,
  User as UserIcon,
  LogOut,
  Briefcase,
  PlusCircle,
  ShieldCheck,
  ChevronDown,
  Sprout,
  Check,
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const { user, logout, openAuthModal } = useAuth();
  const { language, setLanguage, languages, resetLanguageSelection, t } = useLanguage();
  const { theme, effectiveTheme, setTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'home', label: t('navHome') },
    { id: 'find-workers', label: t('navFindWorkers') },
    { id: 'find-jobs', label: t('navFindJobs') },
    { id: 'agriculture', label: t('navAgriculture'), isAgri: true },
    { id: 'how-it-works', label: t('navHowItWorks') },
    { id: 'about', label: t('navAbout') },
    { id: 'contact', label: t('navContact') },
  ];

  const handleNavClick = (pageId: string) => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setLangDropdownOpen(false);
    setThemeDropdownOpen(false);
  };

  const getDashboardId = () => {
    if (!user) return 'home';
    if (user.role === 'admin') return 'admin-dashboard';
    if (user.role === 'worker') return 'worker-dashboard';
    return 'customer-dashboard';
  };

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Tagline */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-950 dark:bg-emerald-600 border border-slate-800 dark:border-emerald-500 flex items-center justify-center text-emerald-400 dark:text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
              <span className="text-white">J</span>
              <span className="text-emerald-400 dark:text-slate-950">B</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
                  Job<span className="text-emerald-600 dark:text-emerald-400">Bond</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  India
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
                {t('brandTagline')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                }`}
              >
                {item.isAgri && <Sprout className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Right Actions: Theme Selector + Language Selector + User / Auth */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme Toggle Dropdown */}
            <div className="relative" ref={themeRef}>
              <button
                onClick={() => {
                  setThemeDropdownOpen(!themeDropdownOpen);
                  setLangDropdownOpen(false);
                  setUserDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                title="Theme Settings"
                aria-label="Theme Settings"
              >
                {effectiveTheme === 'dark' ? (
                  <Moon className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <span className="hidden xl:inline text-[11px] capitalize">
                  {theme === 'system' ? 'System' : theme}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-fade-in">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {t('themeLabel')}
                  </div>
                  <button
                    onClick={() => {
                      setTheme('light');
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                      theme === 'light'
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/40'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>{t('themeLight')}</span>
                    </div>
                    {theme === 'light' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                  </button>

                  <button
                    onClick={() => {
                      setTheme('dark');
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                      theme === 'dark'
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/40'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-emerald-400" />
                      <span>{t('themeDark')}</span>
                    </div>
                    {theme === 'dark' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                  </button>

                  <button
                    onClick={() => {
                      setTheme('system');
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                      theme === 'system'
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/40'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-slate-400" />
                      <span>{t('themeSystem')}</span>
                    </div>
                    {theme === 'system' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* Language Selector Dropdown (8 Languages with Native Scripts) */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setThemeDropdownOpen(false);
                  setUserDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                title="Select Language"
              >
                <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold">{currentLangObj.nativeName}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-fade-in max-h-80 overflow-y-auto">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Select Language / भाषा
                  </div>
                  {languages.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLanguage(item.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                        language === item.code
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/40'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div>
                        <p className="font-bold">{item.nativeName}</p>
                        <p className="text-[10px] text-slate-400 font-normal">{item.name}</p>
                      </div>
                      {language === item.code && (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 dark:border-slate-700/60 mt-1 pt-1 px-1">
                    <button
                      type="button"
                      onClick={() => {
                        resetLanguageSelection();
                        setLangDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('chooseLanguageTitle')} (Full Screen)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Auth Buttons or User Menu */}
            {!user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('navLogin')}
                </button>
                <button
                  onClick={() => openAuthModal('register', 'customer')}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all"
                >
                  {t('navSignUp')}
                </button>
              </div>
            ) : (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setLangDropdownOpen(false);
                    setThemeDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 py-1 px-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-emerald-600 text-emerald-400 dark:text-white font-bold flex items-center justify-center text-xs overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                    ) : (
                      user.full_name.charAt(0)
                    )}
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[100px]">
                      {user.full_name}
                    </p>
                    <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      {user.role}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{user.full_name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => handleNavClick(getDashboardId())}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-2"
                    >
                      <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{t('navDashboard')}</span>
                    </button>

                    {user.role === 'customer' && (
                      <button
                        onClick={() => handleNavClick('customer-dashboard')}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-2"
                      >
                        <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{t('navPostJob')}</span>
                      </button>
                    )}

                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleNavClick('admin-dashboard')}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>{t('navAdminPanel')}</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          setCurrentPage('home');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>{t('navLogout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            {/* Quick theme cycle on mobile */}
            <button
              onClick={() => setTheme(effectiveTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              aria-label="Toggle Theme"
            >
              {effectiveTheme === 'dark' ? (
                <Moon className="w-4 h-4 text-emerald-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 ${
                  currentPage === item.id
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.isAgri && <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Theme selector in mobile drawer */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('themeLabel')}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg border ${
                  theme === 'light'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg border ${
                  theme === 'dark'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dark</span>
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg border ${
                  theme === 'system'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Monitor className="w-3.5 h-3.5 text-slate-400" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Language selector in mobile drawer */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Language / भाषा</span>
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`text-left px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
                    language === l.code
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <p className="leading-tight">{l.nativeName}</p>
                  <span className="text-[10px] text-slate-400 font-normal">{l.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User Auth in Mobile */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{user.full_name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {user.email} • {user.role}
                  </p>
                </div>
                <button
                  onClick={() => handleNavClick(getDashboardId())}
                  className="w-full py-2 px-3 text-sm font-semibold text-white bg-slate-900 dark:bg-emerald-600 rounded-xl flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-4 h-4 text-emerald-400 dark:text-white" />
                  <span>{t('navDashboard')}</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    setCurrentPage('home');
                  }}
                  className="w-full py-2 px-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('navLogout')}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {t('navLogin')}
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('register', 'customer');
                  }}
                  className="w-full py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-xs"
                >
                  {t('navSignUp')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
