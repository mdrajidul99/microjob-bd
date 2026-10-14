import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../lib/i18n';
import {
  getClientJobs,
  getSubmissionsForJob,
  approveSubmission,
  requestSubmissionRevision,
  rejectSubmission,
  updateJobStatus,
} from '../../services/db';
import { Job, JobSubmission } from '../../types';

interface ManageJobsPageProps {
  onNavigate: (route: string) => void;
  onOpenChat: (jobId: string, freelancerId: string, jobTitle: string) => void;
  selectedJobId?: string | null;
}

export const ManageJobsPage: React.FC<ManageJobsPageProps> = ({
  onNavigate,
  onOpenChat,
  selectedJobId,
}) => {
  const { currentUser, refreshWallet } = useAuth();
  const { language, t } = useLanguage();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [submissions, setSubmissions] = useState<JobSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(false);

  // Review modal / action states
  const [selectedSub, setSelectedSub] = useState<JobSubmission | null>(null);
  const [actionType, setActionType] = useState<'revision' | 'rejection' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [currentUser]);

  useEffect(() => {
    if (selectedJobId && jobs.length > 0) {
      const match = jobs.find((j) => j.id === selectedJobId);
      if (match) {
        handleViewSubmissions(match);
      }
    }
  }, [selectedJobId, jobs]);

  const fetchJobs = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await getClientJobs(currentUser.uid);
      setJobs(data);
    } catch (err) {
      console.warn('Error fetching client jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmissions = async (job: Job) => {
    setActiveJob(job);
    try {
      setLoadingSubs(true);
      const subs = await getSubmissionsForJob(job.id);
      setSubmissions(subs);
    } catch (err) {
      console.warn('Error fetching submissions for job:', err);
    } finally {
      setLoadingSubs(false);
    }
  };

  const handleApprove = async (sub: JobSubmission) => {
    try {
      setProcessingId(sub.id);
      await approveSubmission(sub);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      await refreshWallet();
      if (activeJob) {
        await handleViewSubmissions(activeJob);
        await fetchJobs();
      }
    } catch (err) {
      console.warn('Approve error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !actionReason.trim()) return;

    try {
      setProcessingId(selectedSub.id);
      if (actionType === 'revision') {
        await requestSubmissionRevision(
          selectedSub.id,
          actionReason.trim(),
          selectedSub.freelancerId,
          selectedSub.jobTitle
        );
      } else if (actionType === 'rejection') {
        await rejectSubmission(
          selectedSub.id,
          actionReason.trim(),
          selectedSub.freelancerId,
          selectedSub.jobTitle
        );
      }

      setSelectedSub(null);
      setActionType(null);
      setActionReason('');
      if (activeJob) {
        await handleViewSubmissions(activeJob);
      }
    } catch (err) {
      console.warn('Action error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleJobStatus = async (job: Job) => {
    const nextStatus = job.status === 'active' ? 'paused' : 'active';
    await updateJobStatus(job.id, nextStatus);
    await fetchJobs();
    if (activeJob?.id === job.id) {
      setActiveJob({ ...activeJob, status: nextStatus });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Manage Microjobs
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Monitor worker submissions, verify submitted proof, and release payments.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/client/post-job')}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs cursor-pointer"
        >
          {t('nav.postJob')}
        </button>
      </div>

      {activeJob ? (
        // Submissions View for Selected Job
        <div className="space-y-6">
          <button
            onClick={() => setActiveJob(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Campaigns
          </button>

          {/* Job Overview Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    activeJob.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {activeJob.status}
                </span>
                <span className="text-xs text-slate-400">
                  Reward: ৳{activeJob.rewardPerWorker}/worker | Budget: ৳{activeJob.totalBudget}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {activeJob.title}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggleJobStatus(activeJob)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer flex items-center gap-1.5"
              >
                {activeJob.status === 'active' ? (
                  <>
                    <PauseCircle className="w-3.5 h-3.5 text-amber-500" /> Pause Job
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-3.5 h-3.5 text-emerald-500" /> Resume Job
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Submissions List */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              Worker Proof Submissions ({submissions.length})
            </h3>

            {loadingSubs ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-700/50 animate-pulse"
                  />
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No submissions received yet for this task.
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {sub.freelancerName}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Submitted on {new Date(sub.submittedAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          ৳{sub.reward}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            sub.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : sub.status === 'revision_requested'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : sub.status === 'rejected'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                          }`}
                        >
                          {sub.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Proof answers preview */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Submitted Proof Answers:
                      </span>
                      {sub.proofAnswers?.map((ans, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <span className="text-slate-500 font-medium">Field #{idx + 1}:</span>{' '}
                          {ans.value.startsWith('http') ? (
                            <a
                              href={ans.value}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-600 dark:text-sky-400 underline font-medium inline-flex items-center gap-1"
                            >
                              {ans.value} <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="font-mono text-slate-800 dark:text-slate-200">
                              {ans.value}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Decision Action Buttons */}
                    {sub.status === 'submitted' && (
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                        <button
                          onClick={() => onOpenChat(sub.jobId, sub.freelancerId, sub.jobTitle)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> Chat
                        </button>

                        <button
                          onClick={() => {
                            setSelectedSub(sub);
                            setActionType('revision');
                            setActionReason('');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/20 cursor-pointer"
                        >
                          Request Revision
                        </button>

                        <button
                          onClick={() => {
                            setSelectedSub(sub);
                            setActionType('rejection');
                            setActionReason('');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/20 cursor-pointer"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => handleApprove(sub)}
                          disabled={processingId === sub.id}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                        >
                          {processingId === sub.id ? 'Approving...' : 'Approve & Release Pay'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Jobs Table
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
            All Posted Campaigns
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-700/50 animate-pulse"
                />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No jobs posted yet.{' '}
              <button
                onClick={() => onNavigate('/client/post-job')}
                className="text-sky-600 font-bold hover:underline cursor-pointer"
              >
                Post your first job
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Job Title</th>
                    <th className="py-2.5 px-3">Reward</th>
                    <th className="py-2.5 px-3">Workers</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                        {job.title}
                      </td>
                      <td className="py-3 px-3 font-black text-emerald-600 dark:text-emerald-400">
                        ৳{job.rewardPerWorker}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                        {job.workersCompleted} / {job.workersNeeded}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            job.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleViewSubmissions(job)}
                          className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold text-xs hover:bg-sky-100 cursor-pointer"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Action Dialog (Revision / Rejection Reason) */}
      {selectedSub && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {actionType === 'revision' ? 'Request Revision' : 'Reject Submission'}
            </h3>

            <p className="text-xs text-slate-500">
              For worker <strong>{selectedSub.freelancerName}</strong> on "{selectedSub.jobTitle}".
            </p>

            <form onSubmit={handleConfirmAction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {actionType === 'revision' ? 'Revision Instructions:' : 'Reason for Rejection:'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={
                    actionType === 'revision'
                      ? 'Explain what the worker needs to fix or upload...'
                      : 'State clear reason why this proof was invalid...'
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSub(null);
                    setActionType(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={processingId === selectedSub.id}
                  className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-xs cursor-pointer ${
                    actionType === 'revision'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirm {actionType === 'revision' ? 'Revision' : 'Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
