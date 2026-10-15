import React, { useState } from 'react';
import { Mail, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../lib/i18n';

export const EmailVerificationBanner: React.FC = () => {
  const { currentUser, sendVerification, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // If user is not logged in or email is already verified, do not show
  if (!currentUser || currentUser.emailVerified) {
    return null;
  }

  // Google provider accounts are generally already verified by Google
  const isGoogle = currentUser.providerData.some((p) => p.providerId === 'google.com');
  if (isGoogle && currentUser.emailVerified) {
    return null;
  }

  const handleResend = async () => {
    try {
      setLoading(true);
      await sendVerification();
      setSent(true);
      setMsg(t('verify.sent'));
    } catch (err: any) {
      setMsg(err.message || 'Failed to send verification email.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshUser();
    } catch (err: any) {
      console.warn('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="min-w-0 break-all">
            <strong>{t('verify.banner')}</strong> ({currentUser.email})
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {sent ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle className="w-4 h-4" /> Sent! Check Inbox
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              {loading ? 'Sending...' : t('verify.resend')}
            </button>
          )}

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-600/40 text-amber-800 dark:text-amber-200 hover:bg-amber-600/10 text-xs font-medium cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {t('verify.refresh')}
          </button>
        </div>
      </div>
      {msg && !sent && (
        <div className="max-w-7xl mx-auto mt-1 text-xs text-rose-600 dark:text-rose-400">
          {msg}
        </div>
      )}
    </div>
  );
};
