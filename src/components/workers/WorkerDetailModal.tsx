import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { WorkerDetail } from '../../types/index.ts';
import {
  X,
  Star,
  MapPin,
  IndianRupee,
  Heart,
  Send,
  ShieldCheck,
  CheckCircle,
  Sprout,
} from 'lucide-react';
import { SendEnquiryModal } from './SendEnquiryModal.tsx';

interface WorkerDetailModalProps {
  worker: WorkerDetail | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: (workerId: string) => void;
}

export const WorkerDetailModal: React.FC<WorkerDetailModalProps> = ({
  worker,
  isOpen,
  onClose,
  isSaved = false,
  onToggleSave,
}) => {
  const { user, openAuthModal } = useAuth();
  const { t, language } = useLanguage();
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);

  if (!isOpen || !worker) return null;

  const handleSaveClick = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (onToggleSave) {
      onToggleSave(worker.id);
    }
  };

  const handleEnquiryClick = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setEnquiryModalOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border-2 border-emerald-500 text-emerald-400 font-extrabold text-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-lg">
                {worker.avatar_url ? (
                  <img src={worker.avatar_url} alt={worker.full_name} className="w-full h-full object-cover" />
                ) : (
                  worker.full_name.charAt(0)
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {worker.full_name}
                  </h2>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      worker.availability_status === 'available'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {worker.availability_status === 'available' ? t('statusAvailable') : t('statusBusy')}
                  </span>
                </div>

                <p className="text-xs text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{worker.city} • {worker.service_area}</span>
                </p>

                <div className="flex items-center gap-3 pt-1 text-xs text-slate-300">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {worker.rating.toFixed(1)} ({worker.reviews_count} reviews)
                  </span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">
                    {worker.completed_jobs} {t('completedJobsCount')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Rates & Experience Overview */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('filterExperience')}</p>
                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {worker.experience_years} Years
                </p>
              </div>
              <div className="border-x border-slate-200 dark:border-slate-700">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('dailyRate')}</p>
                <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4" />
                  <span>{worker.daily_rate || 800}</span>
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('hourlyRate')}</p>
                <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4" />
                  <span>{worker.hourly_rate || 200}</span>
                </p>
              </div>
            </div>

            {/* Farm / Agricultural Availability Box if applicable */}
            {(worker.agri_available !== undefined || (worker.agri_activities && worker.agri_activities.length > 0)) && (
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold">
                  <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Agricultural Availability Status</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                  <p>
                    <span className="font-semibold text-slate-900 dark:text-white">Status: </span>
                    {worker.agri_available ? 'Available for Farm Work' : 'Currently Not Available'}
                  </p>
                  {worker.agri_expected_wage && (
                    <p>
                      <span className="font-semibold text-slate-900 dark:text-white">Farm Wage: </span>
                      ₹{worker.agri_expected_wage}/day
                    </p>
                  )}
                  {worker.agri_service_radius && (
                    <p>
                      <span className="font-semibold text-slate-900 dark:text-white">Radius: </span>
                      {worker.agri_service_radius} km
                    </p>
                  )}
                  {worker.agri_schedule && (
                    <p>
                      <span className="font-semibold text-slate-900 dark:text-white">Schedule: </span>
                      {worker.agri_schedule}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Bio */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                About / Professional Experience
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                {language === 'hi' && worker.bio_hi ? worker.bio_hi : worker.bio}
              </p>
            </div>

            {/* Skills & Specialties */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                Verified Skills & Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {worker.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {language === 'hi' ? s.category_name_hi || s.skill_name : s.category_name || s.skill_name}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Privacy Protection Notice */}
            <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-300">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Privacy-Conscious Contact System</p>
                <p className="text-blue-700 dark:text-blue-400 mt-0.5">
                  To protect worker and customer privacy, phone numbers are shared only once a service enquiry is sent and accepted.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={handleSaveClick}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                isSaved
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{isSaved ? t('btnSaved') : t('btnSaveWorker')}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl"
              >
                {t('close')}
              </button>
              <button
                onClick={handleEnquiryClick}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('btnSendEnquiry')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Send Enquiry Modal */}
      <SendEnquiryModal
        worker={worker}
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        onSuccess={() => {
          setEnquiryModalOpen(false);
          onClose();
        }}
      />
    </>
  );
};
