import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Coins,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  History,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../lib/i18n';
import { submitWithdrawalRequest, getWithdrawalRequests } from '../../services/db';
import { WithdrawalRequest, PaymentMethod } from '../../types';

export const WithdrawalPage: React.FC = () => {
  const { profile, wallet, currentUser, refreshWallet } = useAuth();
  const { language, t } = useLanguage();

  const [method, setMethod] = useState<PaymentMethod>('bkash');
  const [recipientNumber, setRecipientNumber] = useState('');
  const [amount, setAmount] = useState<string>('20');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [currentUser]);

  const fetchHistory = async () => {
    if (!currentUser) return;
    try {
      setLoadingHistory(true);
      const data = await getWithdrawalRequests(currentUser.uid);
      setHistory(data);
    } catch (err) {
      console.warn('Error fetching withdrawals:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!currentUser.emailVerified) {
      setErrorMessage('Please verify your email address before requesting a withdrawal.');
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 20) {
      setErrorMessage('Minimum withdrawal amount is ৳20.');
      return;
    }

    const availableBal = wallet?.freelancerEarningsBalance || 0;
    if (numAmount > availableBal) {
      setErrorMessage(
        `Insufficient available earnings. You have ৳${availableBal}, requested: ৳${numAmount}.`
      );
      return;
    }

    if (!recipientNumber.trim() || recipientNumber.length < 11) {
      setErrorMessage('Please enter a valid 11-digit mobile wallet number (e.g. 017XXXXXXXX).');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await submitWithdrawalRequest({
        userId: currentUser.uid,
        userName: profile?.displayName || currentUser.displayName || 'Freelancer',
        userEmail: currentUser.email || '',
        amount: numAmount,
        paymentMethod: method,
        recipientNumber: recipientNumber.trim(),
      });

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setSuccessMessage(
        `Withdrawal request for ৳${numAmount} submitted successfully! Our finance team will review and disburse funds to your ${method.toUpperCase()} account.`
      );
      setAmount('20');
      setRecipientNumber('');
      await refreshWallet();
      await fetchHistory();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit withdrawal request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('withdraw.title')}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {t('withdraw.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card & Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Earnings Balance Card */}
          <div className="bg-gradient-to-tr from-emerald-700 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
            <div className="flex items-center justify-between text-emerald-200">
              <span className="text-xs font-bold uppercase tracking-wider">
                {t('wallet.freelancerEarnings')}
              </span>
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>

            <div>
              <span className="text-3xl sm:text-4xl font-black">
                ৳{wallet?.freelancerEarningsBalance?.toLocaleString() || 0}
              </span>
              <span className="text-xs text-emerald-200/80 block mt-1">
                Available for immediate payout
              </span>
            </div>

            <div className="pt-3 border-t border-emerald-600/50 flex items-center justify-between text-xs text-emerald-200">
              <span>{t('withdraw.minNotice')}</span>
              <span>Pending: ৳{wallet?.freelancerPendingWithdrawal || 0}</span>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Request Payout
            </h3>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                  Select Payout Service:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod('bkash')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer font-bold text-xs flex flex-col items-center justify-center gap-1 ${
                      method === 'bkash'
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 ring-2 ring-pink-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base font-black">bKash</span>
                    <span className="text-[10px] text-slate-400">Personal Wallet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('nagad')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer font-bold text-xs flex flex-col items-center justify-center gap-1 ${
                      method === 'nagad'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 ring-2 ring-orange-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base font-black">Nagad</span>
                    <span className="text-[10px] text-slate-400">Personal Wallet</span>
                  </button>
                </div>
              </div>

              {/* Number Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {t('withdraw.recipientNumber')} (11 Digits):
                </label>
                <input
                  type="tel"
                  required
                  value={recipientNumber}
                  onChange={(e) => setRecipientNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {t('withdraw.amount')} (Min ৳20):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                    ৳
                  </span>
                  <input
                    type="number"
                    min="20"
                    step="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Processing...' : t('withdraw.submit')}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Withdrawal Policy & Payout Guidelines */}
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 text-xs space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Payout Guidelines
            </h4>
            <ul className="space-y-2.5 text-slate-600 dark:text-slate-300 leading-relaxed list-disc pl-4">
              <li>
                <strong>Minimum Threshold:</strong> You can withdraw as low as ৳20 directly to your personal bKash or Nagad.
              </li>
              <li>
                <strong>Fee:</strong> 0% platform deduction on worker withdrawals. You receive the exact requested amount.
              </li>
              <li>
                <strong>Processing Time:</strong> Requests are processed within 2 to 24 hours after manual admin verification.
              </li>
              <li>
                <strong>Security Reservation:</strong> The requested amount is safely reserved until the payout is completed. If rejected for an incorrect number, funds are returned immediately.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Withdrawal History Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600" />
            <span>Withdrawal History</span>
          </h3>
          <span className="text-xs text-slate-400">{history.length} requests</span>
        </div>

        {loadingHistory ? (
          <div className="h-32 bg-slate-100 dark:bg-slate-700/50 rounded-2xl animate-pulse" />
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No withdrawal requests made yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Destination</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">TrxID / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(h.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-bold uppercase text-slate-800 dark:text-slate-200">
                      {h.paymentMethod}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                      {h.recipientNumber}
                    </td>
                    <td className="py-3 px-3 font-black text-emerald-600 dark:text-emerald-400">
                      ৳{h.amount}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          h.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : h.status === 'rejected'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {h.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-mono">
                      {h.transactionId ? `TrxID: ${h.transactionId}` : h.rejectionReason || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
