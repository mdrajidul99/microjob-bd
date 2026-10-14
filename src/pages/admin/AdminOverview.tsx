import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  ArrowDownLeft,
  ArrowUpRight,
  Mail,
  ShieldAlert,
  Clock,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { getAdminStats, AdminStats } from '../../services/db';
import { AdminTab } from './AdminLayout';

interface AdminOverviewProps {
  onSelectTab: (tab: AdminTab) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ onSelectTab }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((err) => console.warn('Error loading admin stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Pending Deposits Action Card */}
        <div
          onClick={() => onSelectTab('deposits')}
          className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer hover:border-sky-500 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">
              Pending Deposits
            </span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">
              {stats?.pendingDeposits || 0}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Awaiting verification
            </span>
          </div>
        </div>

        {/* Pending Withdrawals Action Card */}
        <div
          onClick={() => onSelectTab('withdrawals')}
          className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer hover:border-emerald-500 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">
              Pending Withdrawals
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {stats?.pendingWithdrawals || 0}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Need payout disbursement
            </span>
          </div>
        </div>

        {/* Total Approved Deposits */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Deposits (BDT)
            </span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              ৳{stats?.approvedDepositsTotal?.toLocaleString() || 0}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Verified client funding
            </span>
          </div>
        </div>

        {/* Total Completed Payouts */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Withdrawn (BDT)
            </span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              ৳{stats?.completedWithdrawalsTotal?.toLocaleString() || 0}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Sent via bKash/Nagad
            </span>
          </div>
        </div>

        {/* Total Users */}
        <div
          onClick={() => onSelectTab('users')}
          className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer hover:border-purple-500 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">
              Platform Users
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats?.totalUsers || 0}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              {stats?.verifiedUsers || 0} email verified
            </span>
          </div>
        </div>

        {/* Active Jobs */}
        <div
          onClick={() => onSelectTab('jobs')}
          className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer hover:border-sky-500 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">
              Active Campaigns
            </span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats?.activeJobs || 0}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              {stats?.totalSubmissions || 0} total work submissions
            </span>
          </div>
        </div>

        {/* Unread Contact Inquiries */}
        <div
          onClick={() => onSelectTab('contacts')}
          className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer hover:border-amber-500 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">
              Unread Messages
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {stats?.unreadContacts || 0}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Contact form inquiries
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Guidance */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
          Daily Administrative Checklist
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div
            onClick={() => onSelectTab('deposits')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-purple-500 transition-colors"
          >
            <span className="font-bold text-slate-900 dark:text-white block mb-1">
              1. Review Deposit Queue
            </span>
            <p className="text-slate-500 leading-relaxed">
              Verify client bKash & Nagad TrxIDs in your bank statement. Approving automatically credits the client's wallet atomically.
            </p>
          </div>

          <div
            onClick={() => onSelectTab('withdrawals')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-purple-500 transition-colors"
          >
            <span className="font-bold text-slate-900 dark:text-white block mb-1">
              2. Disburse Freelancer Payouts
            </span>
            <p className="text-slate-500 leading-relaxed">
              Send money via bKash/Nagad app, enter payment TrxID, and finalize the reserved withdrawal.
            </p>
          </div>

          <div
            onClick={() => onSelectTab('jobs')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-purple-500 transition-colors"
          >
            <span className="font-bold text-slate-900 dark:text-white block mb-1">
              3. Audit Tasks & Abuse
            </span>
            <p className="text-slate-500 leading-relaxed">
              Inspect reported tasks, suspend suspicious accounts, and maintain platform integrity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
