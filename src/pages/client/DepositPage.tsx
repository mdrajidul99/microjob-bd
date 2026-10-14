import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  History,
  Copy,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../lib/i18n';
import {
  submitDepositRequest,
  getDepositRequests,
  getPlatformSettings,
} from '../../services/db';
import { DepositRequest, PaymentMethod, PlatformSettings } from '../../types';

export const DepositPage: React.FC = () => {
  const { profile, wallet, currentUser, refreshWallet } = useAuth();
  const { language, t } = useLanguage();

  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('bkash');
  const [amount, setAmount] = useState<string>('500');
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [history, setHistory] = useState<DepositRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    getPlatformSettings().then(setSettings);
    fetchHistory();
  }, [currentUser]);

  const fetchHistory = async () => {
    if (!currentUser) return;
    try {
      setLoadingHistory(true);
      const data = await getDepositRequests(currentUser.uid);
      setHistory(data);
    } catch (err) {
      console.warn('Error fetching deposits:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const currentNumber =
    method === 'bkash'
      ? settings?.bkashNumber || '01XXXXXXXXX'
      : settings?.nagadNumber || '01XXXXXXXXX';

  const currentInstructions =
    method === 'bkash'
      ? language === 'bn'
        ? settings?.bkashInstructionsBn
        : settings?.bkashInstructionsEn
      : language === 'bn'
      ? settings?.nagadInstructionsBn
      : settings?.nagadInstructionsEn;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(currentNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid deposit amount.');
      return;
    }

    if (!senderNumber.trim() || senderNumber.length < 11) {
      setErrorMessage('Please enter your 11-digit sender mobile number.');
      return;
    }

    if (!transactionId.trim() || transactionId.trim().length < 6) {
      setErrorMessage('Please enter a valid Transaction ID (TrxID) from your SMS/app receipt.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await submitDepositRequest({
        userId: currentUser.uid,
        userName: profile?.displayName || currentUser.displayName || 'Client',
        userEmail: currentUser.email || '',
        userPhone: senderNumber.trim(),
        amount: numAmount,
        paymentMethod: method,
        senderNumber: senderNumber.trim(),
        transactionId: transactionId.trim().toUpperCase(),
      });

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setSuccessMessage(
        `Deposit request for ৳${numAmount} submitted! Your Deposit Wallet will be credited once verified by our finance team.`
      );
      setTransactionId('');
      setSenderNumber('');
      await refreshWallet();
      await fetchHistory();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit deposit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('deposit.title')}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {t('deposit.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deposit Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Deposit Wallet Balance */}
          <div className="bg-gradient-to-tr from-sky-700 to-sky-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-3">
            <div className="flex items-center justify-between text-sky-200">
              <span className="text-xs font-bold uppercase tracking-wider">
                {t('wallet.clientDeposit')}
              </span>
              <ShieldCheck className="w-5 h-5 text-sky-300" />
            </div>

            <div>
              <span className="text-3xl sm:text-4xl font-black">
                ৳{wallet?.clientDepositBalance?.toLocaleString() || 0}
              </span>
              <span className="text-xs text-sky-200/80 block mt-1">
                Available to publish jobs
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Submit Payment Details
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

            <form onSubmit={handleDeposit} className="space-y-4">
              {/* Method Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                  1. Choose Deposit Channel:
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
                    <span className="text-[10px] text-slate-400">Send Money</span>
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
                    <span className="text-[10px] text-slate-400">Send Money</span>
                  </button>
                </div>
              </div>

              {/* Display Official Number with Copy Button */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Our Official {method.toUpperCase()} Personal Number
                  </span>
                  <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                    {currentNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer hover:bg-slate-100"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {t('deposit.amount')}:
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                    ৳
                  </span>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sender Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {t('deposit.senderNumber')} (Your 11-Digit Number):
                </label>
                <input
                  type="tel"
                  required
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              {/* Transaction ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {t('deposit.txId')} (TrxID):
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. BKT76592KA"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-mono uppercase focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Submitting...' : t('deposit.submit')}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 text-xs space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              {t('deposit.instructions')}
            </h4>
            <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line font-mono bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              {currentInstructions}
            </div>

            <div className="pt-2 text-slate-500 text-[11px] space-y-2">
              <p>
                <strong>Security:</strong> All deposit submissions require manual independent cross-checking by our finance moderators before balance is credited.
              </p>
              <p>
                Duplicate or fake transaction IDs will lead to permanent account suspension.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit History */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-sky-600" />
            <span>Deposit History</span>
          </h3>
          <span className="text-xs text-slate-400">{history.length} requests</span>
        </div>

        {loadingHistory ? (
          <div className="h-32 bg-slate-100 dark:bg-slate-700/50 rounded-2xl animate-pulse" />
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No deposits requested yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Sender</th>
                  <th className="py-2.5 px-3">TrxID</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
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
                      {h.senderNumber}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {h.transactionId}
                    </td>
                    <td className="py-3 px-3 font-black text-emerald-600 dark:text-emerald-400">
                      ৳{h.amount}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          h.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : h.status === 'rejected'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {h.status.toUpperCase()}
                      </span>
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
