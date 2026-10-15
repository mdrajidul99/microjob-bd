import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Send,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  reload,
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';

interface AdminLoginPageProps {
  onNavigate: (route: string) => void;
  onSuccess: () => void;
}

const AUTHORIZED_ADMIN_UID = 'YG8glv1gg4XXYUkSUMZtyBcT1fu2';
const AUTHORIZED_ADMIN_EMAIL = 'mrs.engineers.bd26@gmail.com';

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate, onSuccess }) => {
  const { currentUser, refreshUser } = useAuth();
  const [email, setEmail] = useState(AUTHORIZED_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email verification state
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationSent, setVerificationSent] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);

  // Password reset modal state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState(AUTHORIZED_ADMIN_EMAIL);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Check if current user is logged in
  useEffect(() => {
    if (!currentUser) {
      setNeedsVerification(false);
      return;
    }

    const isAuthorized =
      currentUser.uid === AUTHORIZED_ADMIN_UID ||
      currentUser.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();

    if (!isAuthorized) {
      // User is logged in as someone else! Auto sign out from admin session
      signOut(auth);
      setErrorMessage(
        `Access Denied: The account "${currentUser.email}" is not authorized as the platform administrator.`
      );
      return;
    }

    // If authorized but email is not verified
    if (!currentUser.emailVerified) {
      setNeedsVerification(true);
    } else {
      setNeedsVerification(false);
      onSuccess();
    }
  }, [currentUser, onSuccess]);

  const getActionCodeSettings = () => {
    const url = window.location.href;
    return {
      url: url,
      handleCodeInApp: false,
    };
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      const isAuthorized =
        user.uid === AUTHORIZED_ADMIN_UID ||
        user.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();

      if (!isAuthorized) {
        await signOut(auth);
        setErrorMessage(
          `Unauthorized: Only the designated administrator account (${AUTHORIZED_ADMIN_EMAIL}) has access to this portal.`
        );
        return;
      }

      if (!user.emailVerified) {
        setNeedsVerification(true);
        // Automatically send verification link if not sent recently
        try {
          await sendEmailVerification(user, getActionCodeSettings());
          setVerificationSent(true);
          setResendCooldown(60);
        } catch (e) {
          console.warn('Could not auto-send verification email:', e);
        }
      } else {
        await refreshUser();
        onSuccess();
      }
    } catch (err: any) {
      let msg = 'Authentication failed. Please verify your credentials and try again.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid administrator password. Please check your credentials or reset your password.';
      } else if (err.code === 'auth/user-not-found') {
        msg = `Administrator account not found for ${email}.`;
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Access temporarily locked for security. Please try again later.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const isAuthorized =
        user.uid === AUTHORIZED_ADMIN_UID ||
        user.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();

      if (!isAuthorized) {
        await signOut(auth);
        setErrorMessage(
          `Unauthorized: Google account "${user.email}" is not authorized as the platform administrator.`
        );
        return;
      }

      await refreshUser();
      onSuccess();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err.message || 'Google administrator authentication failed.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!auth.currentUser || resendCooldown > 0) return;
    try {
      await sendEmailVerification(auth.currentUser, getActionCodeSettings());
      setVerificationSent(true);
      setResendCooldown(60);
    } catch (err: any) {
      setErrorMessage('Failed to send verification link. Please wait before trying again.');
    }
  };

  const handleCheckVerification = async () => {
    if (!auth.currentUser) return;
    setCheckingVerification(true);
    setErrorMessage(null);
    try {
      await reload(auth.currentUser);
      await refreshUser();
      if (auth.currentUser.emailVerified) {
        setNeedsVerification(false);
        onSuccess();
      } else {
        setErrorMessage(
          'Email not yet verified. Please click the link sent to your email inbox, then click "Verify & Enter".'
        );
      }
    } catch (err) {
      setErrorMessage('Could not refresh authentication status. Please try again.');
    } finally {
      setCheckingVerification(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim(), getActionCodeSettings());
      setResetSuccess(true);
    } catch (err: any) {
      setResetError(err.message || 'Failed to dispatch password recovery email.');
    } finally {
      setResetLoading(false);
    }
  };

  // If authenticated as admin but email is not verified yet
  if (needsVerification) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-purple-500 selection:text-white">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Mail className="w-8 h-8 animate-bounce" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Administrator Email Verification
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              For security compliance, platform administrative access requires a verified email address.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Admin Account:</span>
              <span className="font-mono text-purple-400 font-bold">{currentUser?.email}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Admin UID:</span>
              <span className="font-mono text-[11px] text-slate-300 break-all">{AUTHORIZED_ADMIN_UID}</span>
            </div>
          </div>

          {verificationSent && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>A verification link was dispatched to your inbox. Please check your spam folder if not found.</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              onClick={handleCheckVerification}
              disabled={checkingVerification}
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${checkingVerification ? 'animate-spin' : ''}`} />
              <span>{checkingVerification ? 'Checking Status...' : 'I Have Verified — Enter Dashboard'}</span>
            </button>

            <button
              onClick={handleResendVerification}
              disabled={resendCooldown > 0}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-700 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {resendCooldown > 0
                  ? `Resend link in ${resendCooldown}s`
                  : 'Resend Verification Link'}
              </span>
            </button>

            <button
              onClick={async () => {
                await signOut(auth);
                setNeedsVerification(false);
              }}
              className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              Sign out and return to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 selection:bg-purple-500 selection:text-white">
      {/* Top Bar with brand and return to public marketplace */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <Logo size="md" showText={true} onClick={() => onNavigate('/')} />
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Public Marketplace</span>
        </button>
      </div>

      {/* Main Login Card Container */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/20 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-900/40">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Admin Control Center
            </h1>
            <p className="text-xs text-slate-400">
              Authorized administrator access for Microjob BD & MRS Engineers BD
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={AUTHORIZED_ADMIN_EMAIL}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setResetModalOpen(true)}
                  className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] uppercase font-bold tracking-wider text-slate-500 shrink-0">
              OR
            </span>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 text-white font-semibold text-xs flex items-center justify-center gap-3 border border-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Sign in with Authorized Google Account</span>
              </>
            )}
          </button>

          {/* Security Badge Info */}
          <div className="pt-2 border-t border-slate-800/80 text-center">
            <span className="text-[10px] text-slate-500 font-medium">
              Protected by Firebase Authentication & Role-Based Access Control
            </span>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="max-w-6xl w-full mx-auto text-center py-2 text-[11px] text-slate-600">
        Microjob BD &copy; {new Date().getFullYear()} — MRS Engineers BD. All rights reserved.
      </div>

      {/* Password Reset Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-2.5 text-white">
              <KeyRound className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold">Admin Password Recovery</h3>
            </div>

            {resetSuccess ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Password recovery instructions sent to {resetEmail}.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setResetModalOpen(false);
                    setResetSuccess(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter the administrator email address to dispatch a password recovery link.
                </p>

                {resetError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                    {resetError}
                  </div>
                )}

                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md disabled:opacity-50"
                  >
                    {resetLoading ? 'Sending...' : 'Send Recovery Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
