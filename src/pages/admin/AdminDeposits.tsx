import React, { useState, useEffect } from 'react';
import {
  ArrowDownLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import {
  getDepositRequests,
  approveDeposit,
  rejectDeposit,
} from '../../services/db';
import { DepositRequest } from '../../types';

export const AdminDeposits: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [search, setSearch] = useState('');

  const [selectedReq, setSelectedReq] = useState<DepositRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const data = await getDepositRequests();
      setRequests(data);
    } catch (err) {
      console.warn('Error fetching deposits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (req: DepositRequest) => {
    if (!currentUser) return;
    try {
      setProcessingId(req.id);
      await approveDeposit(req, currentUser.uid, currentUser.email || 'admin');
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      await fetchDeposits();
    } catch (err) {
      console.warn('Approve deposit error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !rejectReason.trim() || !currentUser) return;

    try {
      setProcessingId(selectedReq.id);
      await rejectDeposit(
        selectedReq.id,
        selectedReq.userId,
        rejectReason.trim(),
        currentUser.uid
      );
      setSelectedReq(null);
      setRejectReason('');
      await fetchDeposits();
    } catch (err) {
      console.warn('Reject deposit error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = requests.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        r.userName.toLowerCase().includes(q) ||
        r.userEmail.toLowerCase().includes(q) ||
        r.senderNumber.includes(q) ||
        r.transactionId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Client Deposit Requests
          </h2>
          <p className="text-xs text-slate-500">
            Verify TrxID with your mobile banking balance before approving wallet credit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['pending', 'approved', 'rejected', 'all'].map((st) => (
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

      {/* Table */}
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
            No deposit requests found in this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Sender Number</th>
                  <th className="py-2.5 px-3">TrxID</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
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
                    <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                      {req.senderNumber}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {req.transactionId}
                    </td>
                    <td className="py-3 px-3 font-black text-emerald-600 dark:text-emerald-400">
                      ৳{req.amount}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : req.status === 'rejected'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {req.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedReq(req)}
                            className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(req)}
                            disabled={processingId === req.id}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                          >
                            {processingId === req.id ? '...' : 'Approve'}
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

      {/* Reject Reason Dialog */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Reject Deposit: TrxID {selectedReq.transactionId}
            </h3>
            <p className="text-xs text-slate-500">
              For client <strong>{selectedReq.userName}</strong> (৳{selectedReq.amount}).
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Reason for rejection:
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Transaction ID was not found in statement / Amount mismatch"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === selectedReq.id}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
