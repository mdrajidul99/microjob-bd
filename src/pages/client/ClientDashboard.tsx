import React, { useState, useEffect } from 'react';
import {
  Wallet,
  PlusCircle,
  Clock,
  CheckCircle2,
  Briefcase,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  ArrowDownLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../lib/i18n';
import { getClientJobs, getDepositRequests } from '../../services/db';
import { Job, DepositRequest } from '../../types';

interface ClientDashboardProps {
  onNavigate: (route: string) => void;
  onManageJobSubmissions: (jobId: string) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  onNavigate,
  onManageJobSubmissions,
}) => {
  const { profile, wallet, currentUser } = useAuth();
  const { language, t } = useLanguage();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([getClientJobs(currentUser.uid), getDepositRequests(currentUser.uid)])
      .then(([jobsData, depData]) => {
        setJobs(jobsData);
        setDeposits(depData);
      })
      .catch((err) => console.warn('Client dashboard fetch error:', err))
      .finally(() => setLoading(false));
  }, [currentUser]);

  const activeJobsCount = jobs.filter((j) => j.status === 'active').length;
  const completedJobsCount = jobs.filter((j) => j.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {language === 'bn'
              ? `নিয়োগদাতা ড্যাশবোর্ড, ${profile?.displayName || 'ক্লায়েন্ট'}!`
              : `Employer Dashboard, ${profile?.displayName || 'Client'}!`}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {language === 'bn'
              ? 'ডিপোজিট ওয়ালেট ব্যালেন্স, কাজের অগ্রগতি ও কর্মীদের কাজের প্রমাণ যাচাই।'
              : 'Manage your deposit wallet, monitor microjob campaigns, and approve submissions.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/client/deposits')}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 cursor-pointer transition-colors"
          >
            {t('wallet.depositBtn')}
          </button>
          <button
            onClick={() => onNavigate('/client/post-job')}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t('nav.postJob')}</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Available Deposit Balance */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('wallet.available')}
            </span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">
              ৳{wallet?.clientDepositBalance?.toLocaleString() || 0}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Ready to fund new tasks
            </span>
          </div>
        </div>

        {/* Reserved in Active Jobs */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('wallet.reserved')}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              ৳{wallet?.clientReservedBalance?.toLocaleString() || 0}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Escrow locked for active jobs
            </span>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('wallet.totalSpent')}
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              ৳{wallet?.totalSpent?.toLocaleString() || 0}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Paid to verified freelancers
            </span>
          </div>
        </div>

        {/* Total Deposited */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('wallet.totalDeposited')}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              ৳{wallet?.totalDeposited?.toLocaleString() || 0}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Verified bKash & Nagad deposits
            </span>
          </div>
        </div>
      </div>

      {/* Campaigns Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              Your Posted Microjobs ({jobs.length})
            </h3>
            <span className="text-xs text-slate-400">
              {activeJobsCount} active campaigns, {completedJobsCount} completed
            </span>
          </div>
          <button
            onClick={() => onNavigate('/client/manage-jobs')}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
          >
            Manage All
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-700/50 animate-pulse"
              />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
            <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              You haven't posted any jobs yet.
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
              Deposit funds and launch your first campaign to get hundreds of workers in minutes.
            </p>
            <button
              onClick={() => onNavigate('/client/post-job')}
              className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Post a Job Now
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {jobs.map((job) => {
              const progress = Math.min(
                100,
                Math.round((job.workersCompleted / Math.max(1, job.workersNeeded)) * 100)
              );
              return (
                <div
                  key={job.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          job.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : job.status === 'completed'
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {job.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        Budget: ৳{job.totalBudget} (৳{job.rewardPerWorker}/worker)
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {job.title}
                    </h4>

                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                      <span>
                        {job.workersCompleted} of {job.workersNeeded} completed
                      </span>
                      <div className="w-24 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => onManageJobSubmissions(job.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 text-xs font-bold hover:bg-sky-100 cursor-pointer transition-colors"
                    >
                      Review Submissions
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
