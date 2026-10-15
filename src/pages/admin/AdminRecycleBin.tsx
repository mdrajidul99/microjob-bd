import React, { useState, useEffect } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Briefcase,
  User,
  Layers,
  Mail,
  Search,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RecycleBinItem } from '../../types';
import {
  getRecycleBinItems,
  restoreFromRecycleBin,
  permanentlyDeleteFromRecycleBin,
  emptyRecycleBin,
} from '../../services/db';

export const AdminRecycleBin: React.FC = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Confirmation modal for permanent deletion
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    item: RecycleBinItem | null;
    isAll: boolean;
  }>({
    open: false,
    item: null,
    isAll: false,
  });

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getRecycleBinItems();
      setItems(data || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load Recycle Bin items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleRestore = async (item: RecycleBinItem) => {
    if (!currentUser) return;
    setActionInProgress(item.id);
    setErrorMessage(null);
    try {
      await restoreFromRecycleBin(item, currentUser.uid, currentUser.email || 'admin');
      setSuccessMessage(`Successfully restored "${item.title}" to active records.`);
      await loadItems();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to restore item.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleConfirmPermanentDelete = async () => {
    if (!currentUser) return;
    setConfirmModal({ open: false, item: null, isAll: false });

    if (confirmModal.isAll) {
      setActionInProgress('all');
      try {
        await emptyRecycleBin(items, currentUser.uid, currentUser.email || 'admin');
        setSuccessMessage('Permanently emptied all items from the Recycle Bin.');
        await loadItems();
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to empty Recycle Bin.');
      } finally {
        setActionInProgress(null);
      }
    } else if (confirmModal.item) {
      setActionInProgress(confirmModal.item.id);
      try {
        await permanentlyDeleteFromRecycleBin(
          confirmModal.item,
          currentUser.uid,
          currentUser.email || 'admin'
        );
        setSuccessMessage(`Permanently deleted "${confirmModal.item.title}".`);
        await loadItems();
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to permanently delete item.');
      } finally {
        setActionInProgress(null);
      }
    }
  };

  const filtered = items.filter((item) => {
    if (filterType !== 'all' && item.itemType !== filterType) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      item.originalId.toLowerCase().includes(term) ||
      item.deletedBy.toLowerCase().includes(term)
    );
  });

  const getItemIcon = (type: RecycleBinItem['itemType']) => {
    switch (type) {
      case 'job':
        return <Briefcase className="w-4 h-4 text-emerald-500" />;
      case 'user':
        return <User className="w-4 h-4 text-sky-500" />;
      case 'category':
        return <Layers className="w-4 h-4 text-amber-500" />;
      case 'contact':
        return <Mail className="w-4 h-4 text-purple-500" />;
      default:
        return <Trash2 className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Recycle Bin & Safe Recovery
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Safely inspect soft-deleted jobs, suspended users, and archived platform records. Restore or permanently erase.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => setConfirmModal({ open: true, item: null, isAll: true })}
            disabled={actionInProgress !== null}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Empty Recycle Bin</span>
          </button>
        )}
      </div>

      {/* Feedback Messages */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-[11px] font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-[11px] font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'job', 'user', 'category', 'contact'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                filterType === type
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {type === 'all' ? `All (${items.length})` : `${type}s (${items.filter(i => i.itemType === type).length})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deleted records..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Recycle Bin Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-700/50 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Trash2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              The Recycle Bin is empty
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Soft-deleted jobs, deactivated accounts, and archived records will appear here for safe restoration or permanent purging.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold">
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Title / Record</th>
                  <th className="py-2.5 px-3">Original ID</th>
                  <th className="py-2.5 px-3">Deleted Date</th>
                  <th className="py-2.5 px-3">Deleted By</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 font-bold capitalize text-[11px] text-slate-800 dark:text-slate-200">
                        {getItemIcon(item.itemType)}
                        <span>{item.itemType}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {item.originalId}
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(item.deletedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {item.deletedBy}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleRestore(item)}
                          disabled={actionInProgress === item.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                        >
                          <RotateCcw className={`w-3.5 h-3.5 ${actionInProgress === item.id ? 'animate-spin' : ''}`} />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => setConfirmModal({ open: true, item, isAll: false })}
                          disabled={actionInProgress === item.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs cursor-pointer transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Forever</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {confirmModal.isAll ? 'Empty Entire Recycle Bin?' : 'Permanent Destruction'}
                </h3>
                <span className="text-xs text-rose-500 font-bold">This action cannot be undone</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {confirmModal.isAll
                ? `You are about to permanently erase all ${items.length} records in the Recycle Bin. Data will be completely deleted from Firestore.`
                : `Are you sure you want to permanently delete "${confirmModal.item?.title}"? All associated document files and database references will be unrecoverable.`}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmModal({ open: false, item: null, isAll: false })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPermanentDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Confirm Permanent Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
