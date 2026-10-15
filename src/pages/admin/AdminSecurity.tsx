import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  UserX,
  Phone,
  AlertTriangle,
  RefreshCw,
  Search,
  Eye,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, WithdrawalRequest } from '../../types';
import {
  getAllUsers,
  toggleUserSuspension,
  getWithdrawalRequests,
} from '../../services/db';

interface DuplicateCluster {
  phone: string;
  users: UserProfile[];
}

export const AdminSecurity: React.FC = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [processingUid, setProcessingUid] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, w] = await Promise.all([getAllUsers(), getWithdrawalRequests()]);
      setUsers(u || []);
      setWithdrawals(w || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute duplicate phone number clusters
  const phoneMap = new Map<string, UserProfile[]>();
  users.forEach((u) => {
    if (u.phoneNumber && u.phoneNumber.trim().length >= 8) {
      const clean = u.phoneNumber.trim().replace(/\s+/g, '');
      const existing = phoneMap.get(clean) || [];
      existing.push(u);
      phoneMap.set(clean, existing);
    }
  });

  const duplicatePhoneClusters: DuplicateCluster[] = [];
  phoneMap.forEach((userList, phone) => {
    if (userList.length > 1) {
      duplicatePhoneClusters.push({ phone, users: userList });
    }
  });

  // Suspicious fast/large withdrawal requests (e.g. > ৳2,000 or multiple pending from same user)
  const suspiciousWithdrawals = withdrawals.filter(
    (w) => w.status === 'pending' && (w.amount >= 2000 || withdrawals.filter((other) => other.userId === w.userId && other.status === 'pending').length > 1)
  );

  const handleToggleSuspend = async (user: UserProfile) => {
    if (!currentUser) return;
    setProcessingUid(user.uid);
    try {
      await toggleUserSuspension(
        user.uid,
        !!user.suspended,
        currentUser.uid,
        currentUser.email || 'admin'
      );
      setNotification({
        type: 'success',
        message: `${user.suspended ? 'Reactivated' : 'Suspended'} user ${user.displayName}.`,
      });
      await loadData();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Operation failed.',
      });
    } finally {
      setProcessingUid(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Security & Anti-Abuse Sentinel
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Detect duplicate user accounts, multi-accounting phone abuse, and suspicious withdrawal activity.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400'
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-[11px] font-bold underline cursor-pointer ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">Duplicate Phone Clusters</span>
            <Phone className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {duplicatePhoneClusters.length}
          </div>
          <p className="text-[11px] text-slate-500">
            {duplicatePhoneClusters.reduce((acc, c) => acc + c.users.length, 0)} accounts sharing contact numbers
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">Suspicious Withdrawals</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {suspiciousWithdrawals.length}
          </div>
          <p className="text-[11px] text-slate-500">
            High-amount or rapid pending payouts
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">Enforced Protections</span>
            <Lock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 space-y-1 pt-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Email Verification Shield</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Immutable Ledger & Audit Trail</span>
            </div>
          </div>
        </div>
      </div>

      {/* Duplicate Account Detections Section */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <UserX className="w-4 h-4 text-amber-500" />
              <span>Multi-Accounting & Duplicate Phone Detections</span>
            </h3>
            <p className="text-xs text-slate-500">
              Accounts registered with matching phone numbers indicating potential multi-account abuse.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            {duplicatePhoneClusters.length} flagged
          </span>
        </div>

        {duplicatePhoneClusters.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No duplicate phone clusters detected. All user accounts have distinct contact numbers.
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {duplicatePhoneClusters.map((cluster) => (
              <div
                key={cluster.phone}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-500" />
                    <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                      {cluster.phone}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                      {cluster.users.length} accounts linked
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {cluster.users.map((u) => (
                    <div
                      key={u.uid}
                      className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {u.displayName}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${
                            u.suspended
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {u.suspended ? 'Suspended' : 'Active'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{u.email}</div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">UID: {u.uid}</div>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleSuspend(u)}
                            disabled={processingUid === u.uid}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                              u.suspended
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
                            }`}
                          >
                            {processingUid === u.uid
                              ? '...'
                              : u.suspended
                              ? 'Reactivate'
                              : 'Suspend'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Flagged Suspicious Payouts */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>High-Risk Withdrawal Queue</span>
            </h3>
            <p className="text-xs text-slate-500">
              Pending payouts exceeding threshold (৳2,000+) or repeated requests needing scrutiny.
            </p>
          </div>
        </div>

        {suspiciousWithdrawals.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No high-risk withdrawal requests currently pending.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">User UID</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Recipient</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Risk Factor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {suspiciousWithdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(w.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      {w.userId}
                    </td>
                    <td className="py-3 px-3 font-bold uppercase text-slate-800 dark:text-slate-200">
                      {w.paymentMethod}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                      {w.recipientNumber}
                    </td>
                    <td className="py-3 px-3 font-black text-rose-600 dark:text-rose-400">
                      ৳{w.amount}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                        {w.amount >= 2000 ? 'High Amount' : 'Multiple Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Practical Anti-Abuse Policies Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span>Platform Anti-VPN / Proxy & Abuse Strategy</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white block">
              1. Unique Phone & bKash / Nagad Wallet Binding
            </span>
            <p className="text-[11px] text-slate-500">
              Clients and freelancers must register unique Bangladeshi mobile numbers. Payouts are made directly to verified mobile financial service accounts, blocking offshore synthetic identities.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white block">
              2. Firebase Email Verification Challenge
            </span>
            <p className="text-[11px] text-slate-500">
              Disposable emails are minimized by requiring verified email links before critical wallet withdrawals or administration access.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white block">
              3. 72-Hour Client Verification Window
            </span>
            <p className="text-[11px] text-slate-500">
              Submissions undergo manual or auto-approval timeouts, and job creation requires deposited funds locked upfront to protect both parties.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white block">
              4. Complete Immutable Audit Trail
            </span>
            <p className="text-[11px] text-slate-500">
              Every balance modification, deposit approval, withdrawal payout, suspension, and Recycle Bin restoration is permanently recorded with actor UID and timestamp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
