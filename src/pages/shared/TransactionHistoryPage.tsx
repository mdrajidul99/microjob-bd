import React, { useState, useEffect } from 'react';
import {
  Wallet,
  History,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../lib/i18n';
import { getUserTransactions } from '../../services/db';
import { WalletTransaction } from '../../types';

export const TransactionHistoryPage: React.FC = () => {
  const { currentUser, wallet } = useAuth();
  const { language } = useLanguage();

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (!currentUser) return;
    getUserTransactions(currentUser.uid)
      .then(setTransactions)
      .catch((err) => console.warn('Error loading transactions:', err))
      .finally(() => setLoading(false));
  }, [currentUser]);

  const filtered = transactions.filter((tx) => {
    if (filterType === 'all') return true;
    return tx.walletType === filterType;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-emerald-600" />
          <span>Financial Ledger & Transaction History</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Append-only financial records for both your Client Deposit Wallet and Freelancer Earnings Wallet.
        </p>
      </div>

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Client Deposit Wallet
          </span>
          <span className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">
            ৳{wallet?.clientDepositBalance?.toLocaleString() || 0}
          </span>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 flex justify-between">
            <span>Reserved in Jobs: ৳{wallet?.clientReservedBalance || 0}</span>
            <span>Total Spent: ৳{wallet?.totalSpent || 0}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Freelancer Earnings Wallet
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            ৳{wallet?.freelancerEarningsBalance?.toLocaleString() || 0}
          </span>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 flex justify-between">
            <span>Pending Withdrawal: ৳{wallet?.freelancerPendingWithdrawal || 0}</span>
            <span>Total Withdrawn: ৳{wallet?.totalWithdrawn || 0}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5" /> Filter by Wallet:
        </span>
        {[
          { id: 'all', label: 'All Transactions' },
          { id: 'client_deposit', label: 'Client Deposit Wallet' },
          { id: 'freelancer_earnings', label: 'Freelancer Earnings' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              filterType === f.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-slate-100 dark:bg-slate-700/50 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No financial transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Wallet</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filtered.map((tx) => {
                  const isPositive =
                    tx.type === 'deposit' ||
                    tx.type === 'worker_payout' ||
                    tx.type === 'withdrawal_rejected_refund' ||
                    tx.type === 'job_budget_refund';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            tx.walletType === 'client_deposit'
                              ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300'
                              : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {tx.walletType === 'client_deposit' ? 'Client' : 'Freelancer'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold uppercase text-slate-700 dark:text-slate-300">
                        {tx.type.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td
                        className={`py-3 px-3 font-black whitespace-nowrap ${
                          isPositive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isPositive ? `+৳${tx.amount}` : `-৳${tx.amount}`}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
