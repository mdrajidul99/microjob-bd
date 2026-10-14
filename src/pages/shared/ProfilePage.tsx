import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  Save,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../lib/i18n';

export const ProfilePage: React.FC = () => {
  const { currentUser, profile, refreshUser } = useAuth();
  const { language } = useLanguage();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [skills, setSkills] = useState(profile?.skills || '');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!displayName.trim()) {
      setMessage({ type: 'error', text: 'Display Name cannot be empty.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
        photoURL: photoURL.trim(),
        bio: bio.trim(),
        skills: skills.trim(),
        updatedAt: new Date().toISOString(),
      });

      await refreshUser();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Account Profile & Settings
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage your personal public information and contact mobile number.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
        {/* Verification & Avatar header */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-700">
          <div className="relative">
            {photoURL ? (
              <img
                src={photoURL}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-sky-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              {displayName || 'User Profile'}
            </h3>
            <p className="text-xs text-slate-400">{currentUser?.email}</p>

            <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {currentUser?.emailVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Account
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                  <ShieldAlert className="w-3.5 h-3.5" /> Email Unverified
                </span>
              )}

              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase">
                Role: {profile?.role || 'user'}
              </span>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              Display Name:
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              Email Address (Immutable):
            </label>
            <input
              type="email"
              disabled
              value={currentUser?.email || ''}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm text-slate-500 cursor-not-allowed"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Email address cannot be changed directly for security and fraud protection.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              Mobile Number (bKash / Nagad Contact):
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              Profile Photo URL:
            </label>
            <input
              type="url"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              placeholder="https://..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              Bio / Introduction:
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell clients about yourself, your device type, or availability..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              Skills & Experience (comma separated):
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. YouTube Engagement, App Testing, Facebook Marketing, Typing"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
