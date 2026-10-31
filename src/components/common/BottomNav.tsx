import React from 'react';
import { Home, Users, Briefcase, MessageSquare, User, FileText, CalendarCheck, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  const { user, openAuthModal } = useAuth();
  const { t } = useLanguage();

  const isWorker = user?.role === 'worker';

  const customerTabs = [
    { id: 'home', label: t('bottomNavHome'), icon: Home },
    { id: 'find-workers', label: t('bottomNavWorkers'), icon: Users },
    { id: 'find-jobs', label: t('navPostJob'), icon: Briefcase },
    { id: 'dashboard', label: t('bottomNavProfile'), icon: User },
  ];

  const workerTabs = [
    { id: 'home', label: t('bottomNavJobs'), icon: Briefcase },
    { id: 'find-jobs', label: 'All Jobs', icon: FileText },
    { id: 'agriculture', label: 'Farm Work', icon: Zap },
    { id: 'dashboard', label: t('bottomNavProfile'), icon: User },
  ];

  const tabs = isWorker ? workerTabs : customerTabs;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe shadow-lg">
      <div className="grid grid-cols-4 h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPage === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id === 'dashboard' && !user) {
                  openAuthModal('login');
                  return;
                }
                onNavigate(tab.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center gap-1 transition-all relative ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
              }`}
            >
              {isActive && (
                <span className="absolute top-1 w-8 h-1 rounded-full bg-emerald-500" />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] tracking-tight truncate max-w-[72px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
