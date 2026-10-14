import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Coins,
  Users,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../lib/i18n';
import {
  getCategories,
  postJobWithBudgetReservation,
} from '../../services/db';
import { JobCategory, ProofRequirement } from '../../types';

interface PostJobPageProps {
  onNavigate: (route: string) => void;
  onJobCreated: (jobId: string) => void;
}

export const PostJobPage: React.FC<PostJobPageProps> = ({ onNavigate, onJobCreated }) => {
  const { profile, wallet, currentUser, refreshWallet } = useAuth();
  const { language, t } = useLanguage();

  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [rewardPerWorker, setRewardPerWorker] = useState<number>(5);
  const [workersNeeded, setWorkersNeeded] = useState<number>(10);
  const [deadlineDays, setDeadlineDays] = useState<number>(3);

  // Dynamic Proof Requirements Builder
  const [proofReqs, setProofReqs] = useState<ProofRequirement[]>([
    {
      id: 'req_1',
      type: 'screenshot',
      labelEn: 'Screenshot of Completed Task',
      labelBn: 'সম্পন্ন কাজের স্ক্রিনশট',
      required: true,
      instructionsEn: 'Upload to postimages.org or imgur and provide link',
      instructionsBn: 'ছবি আপলোড করে লিঙ্ক পেস্ট করুন',
    },
    {
      id: 'req_2',
      type: 'text',
      labelEn: 'Your Username / Channel Name',
      labelBn: 'আপনার ইউজারনেম / চ্যানেলের নাম',
      required: true,
      instructionsEn: 'Enter the exact name you used',
      instructionsBn: 'যে নাম দিয়ে কাজটি করেছেন তা লিখুন',
    },
  ]);

  useEffect(() => {
    getCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    });
  }, []);

  const totalBudget = Math.max(0, rewardPerWorker * workersNeeded);
  const availableBal = wallet?.clientDepositBalance || 0;
  const isBudgetSufficient = availableBal >= totalBudget;

  const handleAddProofRequirement = () => {
    const newId = `req_${Date.now()}`;
    setProofReqs((prev) => [
      ...prev,
      {
        id: newId,
        type: 'text',
        labelEn: 'Proof Answer',
        labelBn: 'কাজের প্রমাণের উত্তর',
        required: true,
      },
    ]);
  };

  const handleRemoveProofRequirement = (id: string) => {
    if (proofReqs.length <= 1) return;
    setProofReqs((prev) => prev.filter((r) => r.id !== id));
  };

  const handleProofChange = (id: string, field: keyof ProofRequirement, value: any) => {
    setProofReqs((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!currentUser.emailVerified) {
      setErrorMessage('Please verify your email address before publishing jobs.');
      return;
    }

    if (!title.trim() || !description.trim() || !instructions.trim()) {
      setErrorMessage('Please fill in all required job details.');
      return;
    }

    if (rewardPerWorker <= 0 || workersNeeded <= 0) {
      setErrorMessage('Reward and worker count must be greater than zero.');
      return;
    }

    if (!isBudgetSufficient) {
      setErrorMessage(
        `Insufficient Deposit Wallet balance. You need ৳${totalBudget}, but have ৳${availableBal}. Please deposit funds first.`
      );
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const jobId = await postJobWithBudgetReservation(
        {
          clientId: currentUser.uid,
          clientName: profile?.displayName || currentUser.displayName || 'Employer',
          title: title.trim(),
          categoryId,
          description: description.trim(),
          instructions: instructions.trim(),
          rewardPerWorker,
          workersNeeded,
          totalBudget,
          platformFee: 0,
          status: 'active',
          deadlineDays,
          proofRequirements: proofReqs,
        },
        currentUser.uid
      );

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      await refreshWallet();
      onJobCreated(jobId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('nav.postJob')}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Create a targeted microtask campaign. Funds are locked securely in escrow and released only upon your approval.
        </p>
      </div>

      {/* Balance Check Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block">
            {t('wallet.clientDeposit')} Available:
          </span>
          <span className="text-2xl font-black text-sky-600 dark:text-sky-400">
            ৳{availableBal.toLocaleString()}
          </span>
        </div>

        {!isBudgetSufficient && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-rose-500 font-semibold flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 shrink-0" /> Balance is below total budget
            </span>
            <button
              type="button"
              onClick={() => onNavigate('/client/deposits')}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer"
            >
              Deposit Funds
            </button>
          </div>
        )}
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Basic Details */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            1. Campaign Overview
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              {t('job.title')} <span className="text-rose-500">*</span>:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Subscribe to YouTube Channel & Watch 2 Minutes"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              {t('job.category')} <span className="text-rose-500">*</span>:
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {language === 'bn' ? c.nameBn : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              Job Description <span className="text-rose-500">*</span>:
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the background and purpose of this task..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              {t('job.instructions')} (Step-by-Step) <span className="text-rose-500">*</span>:
            </label>
            <textarea
              rows={5}
              required
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="1. Go to URL: https://...&#10;2. Search for 'xyz'&#10;3. Click on the video and watch minimum 2 minutes&#10;4. Take screenshot showing subscribe & bell icon"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {/* 2. Budget & Workers */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            2. Budget & Worker Allocation
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                {t('job.reward')} <span className="text-rose-500">*</span>:
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                required
                value={rewardPerWorker}
                onChange={(e) => setRewardPerWorker(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                {t('job.workersNeeded')} <span className="text-rose-500">*</span>:
              </label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={workersNeeded}
                onChange={(e) => setWorkersNeeded(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                {t('job.deadline')}:
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Budget Calculation Summary */}
          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 flex items-center justify-between">
            <span className="text-xs font-bold text-sky-900 dark:text-sky-200">
              Total Budget to Reserve:
            </span>
            <div className="text-right">
              <span className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400">
                ৳{totalBudget}
              </span>
              <span className="text-[10px] text-slate-400 block">
                ({workersNeeded} workers × ৳{rewardPerWorker})
              </span>
            </div>
          </div>
        </div>

        {/* 3. Proof Requirements Configuration */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                3. {t('job.proofReqs')}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Define what workers must submit (screenshots, text answers, or links).
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddProofRequirement}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('job.addProofField')}</span>
            </button>
          </div>

          <div className="space-y-4">
            {proofReqs.map((req, idx) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Field #{idx + 1}
                  </span>
                  {proofReqs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProofRequirement(req.id)}
                      className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Label / Question (English):
                    </label>
                    <input
                      type="text"
                      required
                      value={req.labelEn}
                      onChange={(e) => handleProofChange(req.id, 'labelEn', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Proof Type:
                    </label>
                    <select
                      value={req.type}
                      onChange={(e) => handleProofChange(req.id, 'type', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    >
                      <option value="text">Text Answer</option>
                      <option value="screenshot">Screenshot Link</option>
                      <option value="url">URL</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`req_check_${req.id}`}
                    checked={req.required}
                    onChange={(e) => handleProofChange(req.id, 'required', e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <label
                    htmlFor={`req_check_${req.id}`}
                    className="text-xs text-slate-600 dark:text-slate-300"
                  >
                    Mandatory proof field
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => onNavigate('/client/dashboard')}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || !isBudgetSufficient}
            className="px-7 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
          >
            <span>{loading ? 'Publishing Campaign...' : t('job.postSubmit')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
