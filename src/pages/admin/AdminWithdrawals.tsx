import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  History,
  Send,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import {
  getWithdrawalRequests,
  completeWithdrawal,
  rejectWithdrawal,
} from '../../services/db';
import { WithdrawalRequest } from '../../types';

export const AdminWithdrawals: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  // Pay modal
  const [payingReq, setPayingReq] = useState<WithdrawalRequest | null>(null);
  const [payoutTxId, setPayoutTxId] = useState('');

  // Reject modal
  const [rejectingReq, setRejectingReq] = useState<WithdrawalRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const data = await getWithdrawalRequests();
      setRequests(data);
    } catch (err) {
      console.warn('Error fetching withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingReq || !payoutTxId.trim() || !currentUser) return;

    try {
      setProcessingId(payingReq.id);
      await completeWithdrawal(
        payingReq,
        payoutTxId.trim().toUpperCase(),
        currentUser.uid,
        currentUser.email || 'admin'
      );
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      setPayingReq(null);
      setPayoutTxId('');
      await fetchWithdrawals();
    } catch (err) {
      console.warn('Complete withdrawal error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingReq || !rejectReason.trim() || !currentUser) return;

    try {
      setProcessingId(rejectingReq.id);
      await rejectWithdrawal(
        rejectingReq,
        rejectReason.trim(),
        currentUser.uid,
        currentUser.email || 'admin'
      );
      setRejectingReq(null);
      setRejectReason('');
      await fetchWithdrawals();
    } catch (err) {
      console.warn('Reject withdrawal error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = requests.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Freelancer Withdrawal Queue
          </h2>
          <p className="text-xs text-slate-500">
            Send payout via your mobile bKash or Nagad wallet, then record the TrxID.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['pending', 'paid', 'rejected', 'all'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-slate-100 dark:bg-slate-700/50 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No withdrawal requests found in this filter.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Freelancer</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Mobile Account</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">TrxID / Reason</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(req.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {req.userName}
                      </span>
                      <span className="text-[10px] text-slate-400">{req.userEmail}</span>
                    </td>
                    <td className="py-3 px-3 font-bold uppercase text-slate-800 dark:text-slate-200">
                      {req.paymentMethod}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {req.recipientNumber}
                    </td>
                    <td className="py-3 px-3 font-black text-emerald-600 dark:text-emerald-400">
                      ৳{req.amount}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          req.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : req.status === 'rejected'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                      {req.transactionId ? `TrxID: ${req.transactionId}` : req.rejectionReason || '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {req.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setRejectingReq(req);
                              setRejectReason('');
                            }}
                            className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => {
                              setPayingReq(req);
                              setPayoutTxId('');
                            }}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay Confirmation Modal */}
      {payingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Confirm Disbursed Payout
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Paying <strong>৳{payingReq.amount}</strong> to{' '}
              <strong>{payingReq.recipientNumber}</strong> via{' '}
              <strong className="uppercase">{payingReq.paymentMethod}</strong> for user{' '}
              <strong>{payingReq.userName}</strong>.
            </p>

            <form onSubmit={handleConfirmPay} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  MFS Payout Transaction ID (TrxID):
                </label>
                <input
                  type="text"
                  required
                  value={payoutTxId}
                  onChange={(e) => setPayoutTxId(e.target.value)}
                  placeholder="e.g. 9BKT6524QA"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayingReq(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === payingReq.id}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Confirm Payout Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {rejectingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Reject Withdrawal & Refund Balance
            </h3>
            <p className="text-xs text-slate-500">
              The reserved amount of <strong>৳{rejectingReq.amount}</strong> will be atomically restored to {rejectingReq.userName}'s available earnings.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Rejection Reason:
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Inactive bKash personal wallet number / KYC restriction"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingReq(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === rejectingReq.id}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Confirm Rejection & Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
