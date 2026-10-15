import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Users,
  Coins,
  Clock,
  Sparkles,
  ChevronRight,
  Send,
} from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { useAuth } from '../context/AuthContext';
import { getJobs, getCategories } from '../services/db';
import { Job, JobCategory } from '../types';

interface HomePageProps {
  onNavigate: (route: string) => void;
  onSelectJob: (jobId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectJob }) => {
  const { language, t } = useLanguage();
  const { currentUser, activeRole } = useAuth();

  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([getJobs({ status: 'active', sortBy: 'newest' }), getCategories()])
      .then(([jobsData, catsData]) => {
        setFeaturedJobs(jobsData.slice(0, 6));
        setCategories(catsData);
      })
      .catch((err) => console.warn('Home fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      onNavigate('/jobs');
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-b from-emerald-500/5 via-sky-500/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-6 shadow-xs animate-in fade-in slide-in-from-top-4">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('hero.badge')}</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            {t('hero.title')}
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-2xl mx-auto flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700"
          >
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'কাজের নাম বা কীওয়ার্ড লিখুন (যেমন: ইউটিউব, ফেসবুক, অ্যাপ রিভিউ)...'
                  : 'Search tasks (e.g., YouTube subscribe, Facebook share, App install)...'
              }
              className="min-w-0 flex-1 bg-transparent border-none text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none px-2"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shrink-0 cursor-pointer transition-colors shadow-sm"
            >
              {language === 'bn' ? 'খুঁজুন' : 'Search'}
            </button>
          </form>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                if (!currentUser) onNavigate('/register');
                else onNavigate('/jobs');
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5"
            >
              <span>{t('hero.ctaFreelancer')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (!currentUser) onNavigate('/register');
                else onNavigate('/client/post-job');
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-100 font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5"
            >
              <Briefcase className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>{t('hero.ctaClient')}</span>
            </button>
          </div>

          {/* Highlight Stats Pill Banner */}
          <div className="mt-12 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-center">
            <div className="p-2">
              <span className="block text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                10,000+
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {t('hero.statsWorkers')}
              </span>
            </div>

            <div className="p-2 border-l border-slate-100 dark:border-slate-700">
              <span className="block text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400">
                50,000+
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {t('hero.statsJobs')}
              </span>
            </div>

            <div className="p-2 border-l border-slate-100 dark:border-slate-700">
              <span className="block text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ৳1.5M+
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {t('hero.statsPayout')}
              </span>
            </div>

            <div className="p-2 border-l border-slate-100 dark:border-slate-700">
              <span className="block text-xl sm:text-2xl font-black text-amber-500">
                ৳20
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {t('hero.minWithdrawal')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সরাসরি অনুমোদিত কাজ' : 'Latest Opportunities'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {language === 'bn' ? 'সাম্প্রতিক মাইক্রোজব সমূহ' : 'Recently Posted Microtasks'}
            </h2>
          </div>

          <button
            onClick={() => onNavigate('/jobs')}
            className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 cursor-pointer"
          >
            <span>{language === 'bn' ? 'সকল কাজ দেখুন' : 'Explore All Jobs'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700"
              />
            ))}
          </div>
        ) : featuredJobs.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'bn' ? 'বর্তমানে কোনো কাজ প্রস্তুত নেই' : 'No active jobs right now'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {language === 'bn'
                ? 'আপনি ক্লায়েন্ট মোডে গিয়ে নতুন কাজ পোস্ট করে কর্মী নিয়োগ করতে পারেন।'
                : 'Be the first employer to post a microjob and hire fast workers!'}
            </p>
            <button
              onClick={() => onNavigate('/client/post-job')}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              {t('nav.postJob')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => {
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
                    {/* Header: Client & Reward */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {job.clientName || 'Verified Client'}
                      </span>
                      <div className="text-right">
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                          ৳{job.rewardPerWorker}
                        </span>
                        <span className="block text-[10px] text-slate-400">/ per worker</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {job.title}
                    </h3>

                    {/* Short Description */}
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                  </div>

                  {/* Progress & Meta footer */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                      <span>Completed</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {job.workersCompleted} / {job.workersNeeded}
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
      </section>

      {/* Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {language === 'bn' ? 'জনপ্রিয় কাজের ক্যাটাগরি' : 'Explore Top Categories'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {language === 'bn'
              ? 'আপনার পছন্দের বিষয়ের কাজ নির্বাচন করে এখনই কাজ শুরু করুন।'
              : 'Choose tasks tailored to your skills and get paid immediately upon approval.'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate(`/jobs?category=${cat.id}`)}
              className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-center flex flex-col items-center justify-center gap-2.5 transition-all hover:-translate-y-1 cursor-pointer shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {language === 'bn' ? cat.nameBn : cat.nameEn}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* How it Works Comparison */}
      <section className="bg-slate-50 dark:bg-slate-800/50 py-16 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t('hiw.title')}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('hiw.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* For Freelancers */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-6">
                <Users className="w-4 h-4" />
                <span>{t('hiw.freelancerTitle')}</span>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center justify-center text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('hiw.fStep1Title')}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{t('hiw.fStep1Desc')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center justify-center text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('hiw.fStep2Title')}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{t('hiw.fStep2Desc')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center justify-center text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('hiw.fStep3Title')}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{t('hiw.fStep3Desc')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center justify-center text-xs shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('hiw.fStep4Title')}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{t('hiw.fStep4Desc')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Employers */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 text-xs font-bold mb-6">
                <Briefcase className="w-4 h-4" />
                <span>{t('hiw.clientTitle')}</span>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-extrabold flex items-center justify-center text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('hiw.cStep1Title')}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{t('hiw.cStep1Desc')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-extrabold flex items-center justify-center text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('hiw.cStep2Title')}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{t('hiw.cStep2Desc')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-extrabold flex items-center justify-center text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('hiw.cStep3Title')}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{t('hiw.cStep3Desc')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-extrabold flex items-center justify-center text-xs shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('hiw.cStep4Title')}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{t('hiw.cStep4Desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 sm:p-12 border border-slate-700">
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-2">
              Security & Reliability
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {language === 'bn'
                ? 'নিরাপদ পেমেন্ট ও বিশ্বস্ত ট্রানজেকশন'
                : 'Built with Double-Entry Security & Escrow Protection'}
            </h3>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              {language === 'bn'
                ? 'ক্লায়েন্টের ডিপোজিট ব্যালেন্স এবং ফ্রিল্যান্সারের আর্নিংস ব্যালেন্স সম্পূর্ণ পৃথক ওয়ালেটে সংরক্ষিত থাকে। কাজ অনুমোদিত হলেই কেবল পারিশ্রমিক স্থানান্তরিত হয়।'
                : 'Client deposit funds are locked in reserved escrow upon job creation, ensuring workers are guaranteed payment when completing approved tasks. All transactions are logged in an immutable financial ledger.'}
            </p>

            <div className="mt-8 flex flex-wrap gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>bKash & Nagad Verified Processing</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>72-Hour Auto Approval Guarantee</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Low ৳20 Minimum Cashout</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
