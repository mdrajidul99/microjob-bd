import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../lib/i18n';
import { getFreelancerSubmissions, getJobs } from '../../services/db';
import { JobSubmission, Job } from '../../types';

interface FreelancerDashboardProps {
  onNavigate: (route: string) => void;
  onSelectJob: (jobId: string) => void;
}

export const FreelancerDashboard: React.FC<FreelancerDashboardProps> = ({
  onNavigate,
  onSelectJob,
}) => {
  const { profile, wallet, currentUser } = useAuth();
  const { language, t } = useLanguage();

  const [submissions, setSubmissions] = useState<JobSubmission[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      getFreelancerSubmissions(currentUser.uid),
      getJobs({ status: 'active' }),
    ])
      .then(([subsData, jobsData]) => {
        setSubmissions(subsData);
        setRecommendedJobs(jobsData.slice(0, 4));
      })
      .catch((err) => console.warn('Dashboard fetch error:', err))
      .finally(() => setLoading(false));
  }, [currentUser]);

  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const pendingCount = submissions.filter((s) => s.status === 'submitted').length;
  const revisionCount = submissions.filter((s) => s.status === 'revision_requested').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {language === 'bn'
              ? `স্বাগতম, ${profile?.displayName || 'ফ্রিল্যান্সার'}!`
              : `Welcome back, ${profile?.displayName || 'Freelancer'}!`}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {language === 'bn'
              ? 'আপনার ফ্রিল্যান্সার আর্নিংস ড্যাশবোর্ড ও জমাকৃত কাজের হিসাব।'
              : 'Track your microtask earnings, pending reviews, and payouts.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/jobs')}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 cursor-pointer transition-colors"
          >
            {t('nav.browseJobs')}
          </button>
          <button
            onClick={() => onNavigate('/freelancer/withdrawals')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            {t('wallet.withdrawBtn')}
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Available Earnings */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('wallet.available')}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              ৳{wallet?.freelancerEarningsBalance?.toLocaleString() || 0}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Ready to withdraw (Min: ৳20)
            </span>
          </div>
        </div>

        {/* Pending Withdrawals */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('wallet.pendingPayout')}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              ৳{wallet?.freelancerPendingWithdrawal?.toLocaleString() || 0}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Processing in payout queue
            </span>
          </div>
        </div>

        {/* Total Earned */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('wallet.totalEarned')}
            </span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              ৳{wallet?.totalEarned?.toLocaleString() || 0}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Lifetime approved tasks
            </span>
          </div>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('wallet.totalWithdrawn')}
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              ৳{wallet?.totalWithdrawn?.toLocaleString() || 0}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Sent via bKash & Nagad
            </span>
          </div>
        </div>
      </div>

      {/* Task Performance Snapshot */}
      <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
        <div>
          <span className="text-lg sm:text-xl font-black text-emerald-600">
            {approvedCount}
          </span>
          <span className="text-[11px] font-medium text-slate-500 block">
            Approved Tasks
          </span>
        </div>
        <div className="border-l border-slate-100 dark:border-slate-700">
          <span className="text-lg sm:text-xl font-black text-sky-600">
            {pendingCount}
          </span>
          <span className="text-[11px] font-medium text-slate-500 block">
            Pending Reviews
          </span>
        </div>
        <div className="border-l border-slate-100 dark:border-slate-700">
          <span className="text-lg sm:text-xl font-black text-amber-500">
            {revisionCount}
          </span>
          <span className="text-[11px] font-medium text-slate-500 block">
            Revisions Needed
          </span>
        </div>
      </div>

      {/* Two Column Layout: Recent Submissions & Recommended Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Submissions */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              Recent Submissions
            </h3>
            <button
              onClick={() => onNavigate('/freelancer/submissions')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 cursor-pointer"
            >
              View All
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-slate-100 dark:bg-slate-700/50 animate-pulse"
                />
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              You haven't submitted any jobs yet.{' '}
              <button
                onClick={() => onNavigate('/jobs')}
                className="text-emerald-600 font-bold hover:underline cursor-pointer"
              >
                Find tasks
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.slice(0, 5).map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {sub.jobTitle}
                    </p>
                    <span className="text-[11px] text-slate-400 block">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                      ৳{sub.reward}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        sub.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : sub.status === 'revision_requested'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : sub.status === 'rejected'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                      }`}
                    >
                      {sub.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Jobs */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              Recommended Tasks
            </h3>
            <button
              onClick={() => onNavigate('/jobs')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 cursor-pointer"
            >
              Browse More
            </button>
          </div>

          <div className="space-y-3">
            {recommendedJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onSelectJob(job.id)}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-emerald-50/50 dark:hover:bg-slate-700/50 border border-slate-100 dark:border-slate-800 cursor-pointer transition-colors flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {job.title}
                  </p>
                  <span className="text-[11px] text-slate-400">
                    {job.workersCompleted}/{job.workersNeeded} completed
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    ৳{job.rewardPerWorker}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
