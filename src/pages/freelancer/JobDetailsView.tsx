import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Briefcase,
  Clock,
  ShieldCheck,
  Send,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  FileText,
  Link as LinkIcon,
  Upload,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../lib/i18n';
import { useAuth } from '../../context/AuthContext';
import { getJobById, submitWork, getSubmissionsForJob } from '../../services/db';
import { Job, JobSubmission, ProofAnswer } from '../../types';

interface JobDetailsViewProps {
  jobId: string;
  onBack: () => void;
  onOpenChat: (jobId: string, clientId: string, jobTitle: string) => void;
  onViewSubmissions?: () => void;
}

export const JobDetailsView: React.FC<JobDetailsViewProps> = ({
  jobId,
  onBack,
  onOpenChat,
  onViewSubmissions,
}) => {
  const { language, t } = useLanguage();
  const { currentUser, profile } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [userSubmission, setUserSubmission] = useState<JobSubmission | null>(null);

  // Dynamic Proof Form Answers
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId, currentUser]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const data = await getJobById(jobId);
      setJob(data);

      if (currentUser && data) {
        const subs = await getSubmissionsForJob(jobId);
        const mySub = subs.find((s) => s.freelancerId === currentUser.uid);
        if (mySub) {
          setAlreadySubmitted(true);
          setUserSubmission(mySub);
        }
      }
    } catch (err) {
      console.warn('Error fetching job details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (reqId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [reqId]: value }));
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !job) {
      setErrorMessage('Please log in to submit work.');
      return;
    }

    if (!currentUser.emailVerified) {
      setErrorMessage(
        'Please verify your email address before submitting work on the marketplace.'
      );
      return;
    }

    // Validate required fields
    for (const req of job.proofRequirements) {
      if (req.required && (!answers[req.id] || !answers[req.id].trim())) {
        setErrorMessage(
          `Please provide: ${language === 'bn' ? req.labelBn : req.labelEn}`
        );
        return;
      }
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const proofAnswers: ProofAnswer[] = job.proofRequirements.map((req) => ({
        requirementId: req.id,
        type: req.type,
        value: answers[req.id]?.trim() || '',
      }));

      await submitWork({
        jobId: job.id,
        jobTitle: job.title,
        clientId: job.clientId,
        freelancerId: currentUser.uid,
        freelancerName: profile?.displayName || currentUser.displayName || 'Worker',
        freelancerEmail: currentUser.email || '',
        reward: job.rewardPerWorker,
        proofAnswers,
      });

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setSubmitSuccess(true);
      setAlreadySubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit work. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Job not found or has been removed.
        </h2>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const remaining = Math.max(0, job.workersNeeded - job.workersCompleted);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{language === 'bn' ? 'সকল কাজে ফিরুন' : 'Back to Jobs'}</span>
      </button>

      {/* Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                {job.clientName || 'Client'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {job.deadlineDays || 3} days completion window
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {job.title}
            </h1>
          </div>

          {/* Reward Box */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-right sm:shrink-0">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              ৳{job.rewardPerWorker}
            </span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">
              Approved Worker Payout
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs">
          <div>
            <span className="text-slate-400 block">Positions Remaining</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
              {remaining} of {job.workersNeeded}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Auto-Approval Protection</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> 72 Hours
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
            {currentUser && currentUser.uid !== job.clientId && (
              <button
                onClick={() => onOpenChat(job.id, job.clientId, job.title)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs cursor-pointer transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Message Client</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Description & Step-by-Step Instructions */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">
            {language === 'bn' ? 'কাজের বিবরণ' : 'Task Overview'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed break-words">
            {job.description}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">
            {language === 'bn' ? 'ধাপ অনুসারে কাজের নির্দেশনা' : 'Step-by-Step Instructions'}
          </h3>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed font-mono break-words">
            {job.instructions}
          </div>
        </div>
      </div>

      {/* Submission Form Area */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">
          {language === 'bn' ? 'কাজের প্রমাণ জমা দিন' : 'Submit Proof of Work'}
        </h3>

        {alreadySubmitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
            <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h4 className="font-bold text-sm sm:text-base text-emerald-900 dark:text-emerald-200">
              {submitSuccess
                ? 'Work Submitted Successfully!'
                : 'You have already submitted proof for this task'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Status:{' '}
              <span className="font-bold uppercase text-emerald-700 dark:text-emerald-400">
                {userSubmission?.status || 'submitted'}
              </span>
              . The client will review your submission shortly.
            </p>
            {onViewSubmissions && (
              <button
                onClick={onViewSubmissions}
                className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                View in My Submissions
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmitProof} className="space-y-5">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Dynamic Proof Requirements Inputs */}
            {job.proofRequirements?.map((req) => (
              <div key={req.id} className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  {language === 'bn' ? req.labelBn : req.labelEn}{' '}
                  {req.required && <span className="text-rose-500">*</span>}
                </label>

                {req.instructionsEn && (
                  <p className="text-[11px] text-slate-400">
                    {language === 'bn' ? req.instructionsBn : req.instructionsEn}
                  </p>
                )}

                {req.type === 'text' && (
                  <textarea
                    rows={3}
                    required={req.required}
                    value={answers[req.id] || ''}
                    onChange={(e) => handleInputChange(req.id, e.target.value)}
                    placeholder="Enter requested proof text or answers..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                )}

                {req.type === 'screenshot' && (
                  <div className="space-y-2">
                    <input
                      type="url"
                      required={req.required}
                      value={answers[req.id] || ''}
                      onChange={(e) => handleInputChange(req.id, e.target.value)}
                      placeholder="Paste screenshot link (e.g., Imgur, Google Drive, Postimages)..."
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Tip: You can upload your screenshot to postimages.org, imgur, or google drive and paste the link here.
                    </span>
                  </div>
                )}

                {req.type === 'url' && (
                  <input
                    type="url"
                    required={req.required}
                    value={answers[req.id] || ''}
                    onChange={(e) => handleInputChange(req.id, e.target.value)}
                    placeholder="https://..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : t('job.applyBtn')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
