import React, { useState, useEffect } from 'react';
import { Briefcase, ArrowRight } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { getCategories, getJobs } from '../services/db';
import { JobCategory, Job } from '../types';

interface CategoriesPageProps {
  onNavigate: (route: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCategories(), getJobs({ status: 'active' })])
      .then(([cats, jobsData]) => {
        setCategories(cats);
        setJobs(jobsData);
      })
      .catch((err) => console.warn('Categories error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {language === 'bn' ? 'কাজের সকল ক্যাটাগরি' : 'Explore All Categories'}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Find focused microjobs in marketing, data entry, social interactions, and reviews.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-36 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const count = jobs.filter((j) => j.categoryId === cat.id).length;
            return (
              <div
                key={cat.id}
                onClick={() => onNavigate(`/jobs?category=${cat.id}`)}
                className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {count} active tasks
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {language === 'bn' ? cat.nameBn : cat.nameEn}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {language === 'bn' ? cat.descriptionBn : cat.descriptionEn}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Browse Category</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
