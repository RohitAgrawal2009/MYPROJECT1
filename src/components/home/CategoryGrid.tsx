import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { api } from '../../api/client.ts';
import { ServiceCategory } from '../../types/index.ts';
import {
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Sparkles,
  GraduationCap,
  Wheat,
  Users,
  Wrench,
  ArrowRight,
  Sprout,
} from 'lucide-react';

interface CategoryGridProps {
  onSelectCategory: (categorySlug: string) => void;
  onNavigateToAgri?: () => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Sparkles,
  GraduationCap,
  Wheat,
  Users,
  Wrench,
  Sprout,
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelectCategory, onNavigateToAgri }) => {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ServiceCategory[]>('/api/categories')
      .then((data) => setCategories(data.filter((c) => c.is_active)))
      .catch((err) => console.error('Failed to load categories', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCardClick = (cat: ServiceCategory) => {
    if (cat.slug === 'agricultural-worker' && onNavigateToAgri) {
      onNavigateToAgri();
    } else {
      onSelectCategory(cat.slug);
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('categoriesHeading')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            {t('categoriesSubheading')}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
            {categories.map((cat) => {
              const IconComponent = cat.slug === 'agricultural-worker' ? Sprout : (ICON_MAP[cat.icon] || Wrench);
              const displayName = language === 'hi' ? cat.name_hi : cat.name;
              const displayDesc = language === 'hi' ? cat.description_hi : cat.description;
              const isAgri = cat.slug === 'agricultural-worker';

              return (
                <div
                  key={cat.id}
                  onClick={() => handleCardClick(cat)}
                  className={`group relative rounded-2xl p-6 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isAgri
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 hover:shadow-xl'
                      : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/50 hover:shadow-xl'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 group-hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 group-hover:text-white border border-slate-200 dark:border-slate-700 group-hover:border-emerald-600 flex items-center justify-center transition-colors shadow-xs">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      {isAgri && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                          Dedicated Hub
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {displayName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {displayDesc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <span>
                      {isAgri ? 'Open Agri Work Hub' : `${t('viewAllWorkers')} ${displayName}`}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
