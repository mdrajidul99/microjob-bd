import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  Ban,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAllUsers, toggleUserSuspension, moveToRecycleBin } from '../../services/db';
import { UserProfile } from '../../types';

export const AdminUsers: React.FC = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [processingUid, setProcessingUid] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.warn('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspend = async (user: UserProfile) => {
    if (!currentUser) return;
    try {
      setProcessingUid(user.uid);
      await toggleUserSuspension(
        user.uid,
        !!user.suspended,
        currentUser.uid,
        currentUser.email || 'admin'
      );
      setFeedback(`Updated suspension state for ${user.displayName}.`);
      await fetchUsers();
    } catch (err) {
      console.warn('Toggle suspension error:', err);
    } finally {
      setProcessingUid(null);
    }
  };

  const handleMoveToRecycleBin = async (user: UserProfile) => {
    if (!currentUser) return;
    const confirm = window.confirm(`Move user "${user.displayName}" (${user.email}) to the Recycle Bin?`);
    if (!confirm) return;

    try {
      setProcessingUid(user.uid);
      await moveToRecycleBin(
        'user',
        user.uid,
        user.displayName || user.email,
        user,
        currentUser.uid,
        currentUser.email || 'admin'
      );
      setFeedback(`User "${user.displayName}" moved to Recycle Bin.`);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to move user to Recycle Bin.');
    } finally {
      setProcessingUid(null);
    }
  };

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase().trim();
    return (
      u.displayName?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.phoneNumber?.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            User Directory & Access Control
          </h2>
          <p className="text-xs text-slate-500">
            Inspect verification status and enforce platform moderation, suspensions, or soft-deletes.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="underline font-bold text-[11px]">
            Dismiss
          </button>
        </div>
      )}

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
            No users found matching query.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold">
                  <th className="py-2.5 px-3">Joined</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Mobile Contact</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Verification</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filtered.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {u.displayName}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {u.email}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                      {u.phoneNumber || '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {u.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500">
                          <ShieldAlert className="w-3.5 h-3.5" /> Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {u.suspended ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 uppercase">
                          Suspended
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 uppercase">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {u.role !== 'admin' && (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleSuspend(u)}
                            disabled={processingUid === u.uid}
                            className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
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
                          <button
                            onClick={() => handleMoveToRecycleBin(u)}
                            disabled={processingUid === u.uid}
                            className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                            title="Move to Recycle Bin"
                          >
                            <Trash2 className="w-4 h-4" />
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
    </div>
  );
};
