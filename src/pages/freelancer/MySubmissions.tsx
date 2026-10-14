import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../lib/i18n';
import { getFreelancerSubmissions, resubmitRevision } from '../../services/db';
import { JobSubmission, SubmissionStatus } from '../../types';

interface MySubmissionsProps {
  onOpenChat: (jobId: string, clientId: string, jobTitle: string) => void;
  onNavigate: (route: string) => void;
}

export const MySubmissions: React.FC<MySubmissionsProps> = ({ onOpenChat, onNavigate }) => {
  const { currentUser } = useAuth();
  const { language, t } = useLanguage();

  const [submissions, setSubmissions] = useState<JobSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Revision modal state
  const [editingSub, setEditingSub] = useState<JobSubmission | null>(null);
  const [revisedAnswers, setRevisedAnswers] = useState<Record<string, string>>({});
  const [resubmitting, setResubmitting] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [currentUser]);

  const fetchSubmissions = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await getFreelancerSubmissions(currentUser.uid);
      setSubmissions(data);
    } catch (err) {
      console.warn('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubs = submissions.filter((s) => {
    if (activeFilter === 'all') return true;
    return s.status === activeFilter;
  });

  const handleStartRevision = (sub: JobSubmission) => {
    setEditingSub(sub);
    const initial: Record<string, string> = {};
    sub.proofAnswers?.forEach((a) => {
      initial[a.requirementId] = a.value;
    });
    setRevisedAnswers(initial);
  };

  const handleSaveRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;
    try {
      setResubmitting(true);
      const updatedAnswers = editingSub.proofAnswers.map((a) => ({
        ...a,
        value: revisedAnswers[a.requirementId] || a.value,
      }));
      await resubmitRevision(editingSub.id, updatedAnswers, editingSub.clientId, editingSub.jobTitle);
      setEditingSub(null);
      await fetchSubmissions();
    } catch (err) {
      console.warn('Error resubmitting:', err);
    } finally {
      setResubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('sub.title')}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Track proof review statuses, client feedback, and earnings releases.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'all', label: 'All Submissions' },
          { id: 'submitted', label: 'Under Review' },
          { id: 'approved', label: 'Approved & Paid' },
          { id: 'revision_requested', label: 'Revision Requested' },
          { id: 'rejected', label: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700"
            />
          ))}
        </div>
      ) : filteredSubs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No submissions in this filter
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Browse available microjobs and start completing simple tasks to earn BDT.
          </p>
          <button
            onClick={() => onNavigate('/jobs')}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Find Microjobs
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubs.map((sub) => (
            <div
              key={sub.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    {sub.jobTitle}
                  </h3>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Submitted on {new Date(sub.submittedAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    ৳{sub.reward}
                  </span>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
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

              {/* Revision / Rejection Note */}
              {sub.revisionNotes && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                  <strong>Client Revision Request:</strong>
                  <p>{sub.revisionNotes}</p>
                </div>
              )}

              {sub.rejectionReason && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 space-y-1">
                  <strong>Rejection Reason:</strong>
                  <p>{sub.rejectionReason}</p>
                </div>
              )}

              {/* Proof Answers summary */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Submitted Proof
                </span>
                {sub.proofAnswers?.map((ans, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <span className="text-slate-500 font-medium">Field #{idx + 1}:</span>{' '}
                    {ans.value.startsWith('http') ? (
                      <a
                        href={ans.value}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 underline font-medium inline-flex items-center gap-1"
                      >
                        {ans.value} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-800 dark:text-slate-200 font-mono">
                        {ans.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => onOpenChat(sub.jobId, sub.clientId, sub.jobTitle)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chat with Employer</span>
                </button>

                {sub.status === 'revision_requested' && (
                  <button
                    onClick={() => handleStartRevision(sub)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t('sub.resubmit')}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revision Modal */}
      {editingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Resubmit Work for: {editingSub.jobTitle}
            </h3>

            {editingSub.revisionNotes && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-xs text-amber-800 dark:text-amber-200">
                <strong>Feedback from employer:</strong> {editingSub.revisionNotes}
              </div>
            )}

            <form onSubmit={handleSaveRevision} className="space-y-4">
              {editingSub.proofAnswers?.map((ans, idx) => (
                <div key={idx} className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Proof Field #{idx + 1} ({ans.type}):
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={revisedAnswers[ans.requirementId] ?? ans.value}
                    onChange={(e) =>
                      setRevisedAnswers((prev) => ({
                        ...prev,
                        [ans.requirementId]: e.target.value,
                      }))
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ))}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSub(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {resubmitting ? 'Resubmitting...' : 'Send Updated Proof'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
