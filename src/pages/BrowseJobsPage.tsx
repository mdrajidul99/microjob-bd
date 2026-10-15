import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Briefcase,
  Coins,
  Clock,
  ArrowUpDown,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { getJobs, getCategories } from '../services/db';
import { Job, JobCategory } from '../types';

interface BrowseJobsPageProps {
  onSelectJob: (jobId: string) => void;
  initialQuery?: string;
  initialCategory?: string;
}

export const BrowseJobsPage: React.FC<BrowseJobsPageProps> = ({
  onSelectJob,
  initialQuery = '',
  initialCategory = 'all',
}) => {
  const { language } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'newest' | 'reward_desc' | 'reward_asc'>('newest');
  const [minReward, setMinReward] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, sortBy, minReward]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsData, catsData] = await Promise.all([
        getJobs({
          status: 'active',
          categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
          search: search.trim() || undefined,
          minReward: minReward > 0 ? minReward : undefined,
          sortBy,
        }),
        getCategories(),
      ]);
      setJobs(jobsData);
      setCategories(catsData);
    } catch (err) {
      console.warn('Jobs fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {language === 'bn' ? 'সকল উপলব্ধ মাইক্রোটাস্ক' : 'Browse Available Microtasks'}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {language === 'bn'
            ? 'পছন্দের কাজ নির্বাচন করুন, সহজ নির্দেশনা অনুসরণ করুন এবং বিকাশ ও নগদে টাকা পান।'
            : 'Find simple tasks, follow instructions, submit proof, and get paid instantly.'}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-xs mb-8 space-y-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'কাজের শিরোনাম বা বিবরণ খুঁজুন...'
                  : 'Search by job title or keywords...'
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold cursor-pointer transition-colors"
          >
            {language === 'bn' ? 'সার্চ' : 'Filter'}
          </button>
        </form>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">
                {language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {language === 'bn' ? c.nameBn : c.nameEn}
                </option>
              ))}
            </select>

            {/* Min Reward Filter */}
            <select
              value={minReward}
              onChange={(e) => setMinReward(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="0">{language === 'bn' ? 'যেকোনো পারিশ্রমিক' : 'Any Reward'}</option>
              <option value="5">৳5+ Min</option>
              <option value="10">৳10+ Min</option>
              <option value="20">৳20+ Min</option>
              <option value="50">৳50+ Min</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="newest">{language === 'bn' ? 'নতুন কাজ' : 'Newest First'}</option>
              <option value="reward_desc">
                {language === 'bn' ? 'বেশি পারিশ্রমিক' : 'Highest Reward'}
              </option>
              <option value="reward_asc">
                {language === 'bn' ? 'কম পারিশ্রমিক' : 'Lowest Reward'}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700"
            />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
          <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {language === 'bn' ? 'কোনো কাজ পাওয়া যায়নি' : 'No jobs matched your filters'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {language === 'bn'
              ? 'অন্য কোনো ক্যাটাগরি বা ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।'
              : 'Try clearing your search filters or check back shortly for new postings.'}
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
              setMinReward(0);
            }}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            {language === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => {
            const progress = Math.min(
              100,
              Math.round((job.workersCompleted / Math.max(1, job.workersNeeded)) * 100)
            );
            return (
              <div
                key={job.id}
                onClick={() => onSelectJob(job.id)}
                className="group bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      {job.clientName || 'Client'}
                    </span>
                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        ৳{job.rewardPerWorker}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {job.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {job.deadlineDays || 3} days left
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {job.workersCompleted} / {job.workersNeeded} completed
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
