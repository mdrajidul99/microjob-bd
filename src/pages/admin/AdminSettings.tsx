import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPlatformSettings, updatePlatformSettings } from '../../services/db';
import { PlatformSettings } from '../../types';

export const AdminSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getPlatformSettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !currentUser) return;

    try {
      setSaving(true);
      await updatePlatformSettings(
        settings,
        currentUser.uid,
        currentUser.email || 'admin'
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.warn('Settings save error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">
          Platform Configuration & Payment Gateways
        </h2>
        <p className="text-xs text-slate-500">
          Manage official bKash/Nagad deposit accounts, minimum withdrawal limits, and announcements.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Platform settings saved and deployed to live system!</span>
          </div>
        )}

        {/* 1. MFS Deposit Numbers */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            1. Official Payment Accounts (MFS)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Official bKash Personal Number:
              </label>
              <input
                type="text"
                required
                value={settings.bkashNumber}
                onChange={(e) => setSettings({ ...settings, bkashNumber: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Official Nagad Personal Number:
              </label>
              <input
                type="text"
                required
                value={settings.nagadNumber}
                onChange={(e) => setSettings({ ...settings, nagadNumber: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                bKash Instructions (English):
              </label>
              <textarea
                rows={4}
                value={settings.bkashInstructionsEn}
                onChange={(e) =>
                  setSettings({ ...settings, bkashInstructionsEn: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                bKash Instructions (Bengali / বাংলা):
              </label>
              <textarea
                rows={4}
                value={settings.bkashInstructionsBn}
                onChange={(e) =>
                  setSettings({ ...settings, bkashInstructionsBn: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* 2. Platform Parameters */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            2. Platform Parameters & Withdrawal Limits
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Minimum Withdrawal Threshold (৳ BDT):
              </label>
              <input
                type="number"
                min="20"
                step="1"
                required
                value={settings.minimumWithdrawal}
                onChange={(e) =>
                  setSettings({ ...settings, minimumWithdrawal: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard configured minimum: ৳20
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Platform Support Contact Email:
              </label>
              <input
                type="email"
                required
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* 3. Global Announcements */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            3. Announcements & Maintenance
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Announcement Banner (English):
              </label>
              <input
                type="text"
                value={settings.announcementEn || ''}
                onChange={(e) =>
                  setSettings({ ...settings, announcementEn: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Announcement Banner (Bengali):
              </label>
              <input
                type="text"
                value={settings.announcementBn || ''}
                onChange={(e) =>
                  setSettings({ ...settings, announcementBn: e.target.value })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="maint_mode"
              checked={settings.maintenanceMode}
              onChange={(e) =>
                setSettings({ ...settings, maintenanceMode: e.target.checked })
              }
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="maint_mode" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Maintenance Mode (Informational banner)
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Deploy Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
