import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle,
  XCircle,
  PauseCircle,
  PlayCircle,
  AlertCircle,
  Clock,
  Eye,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getJobs, updateJobStatus, moveToRecycleBin } from '../../services/db';
import { Job } from '../../types';

export const AdminJobs: React.FC = () => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getJobs({ status: undefined });
      setJobs(data);
    } catch (err) {
      console.warn('Admin jobs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (jobId: string, status: Job['status']) => {
    try {
      setProcessingId(jobId);
      await updateJobStatus(jobId, status);
      await fetchJobs();
      if (selectedJob?.id === jobId) {
        setSelectedJob(null);
      }
    } catch (err) {
      console.warn('Update status error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleMoveToRecycleBin = async (job: Job) => {
    if (!currentUser) return;
    const confirm = window.confirm(`Move job campaign "${job.title}" to the Recycle Bin?`);
    if (!confirm) return;

    try {
      setProcessingId(job.id);
      await moveToRecycleBin(
        'job',
        job.id,
        job.title,
        job,
        currentUser.uid,
        currentUser.email || 'admin'
      );
      setFeedback(`Job "${job.title}" moved to Recycle Bin.`);
      await fetchJobs();
    } catch (err: any) {
      alert(err.message || 'Failed to move job to Recycle Bin');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Job Moderation & Control
          </h2>
          <p className="text-xs text-slate-500">
            Review campaigns, pause suspicious tasks, or move non-compliant jobs to Recycle Bin.
          </p>
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
                className="h-14 rounded-xl bg-slate-100 dark:bg-slate-700/50 animate-pulse"
              />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No marketplace jobs posted yet.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Employer</th>
                  <th className="py-2.5 px-3">Campaign Title</th>
                  <th className="py-2.5 px-3">Payout</th>
                  <th className="py-2.5 px-3">Progress</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {job.clientName || 'Client'}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                      {job.title}
                    </td>
                    <td className="py-3 px-3 font-black text-emerald-600 dark:text-emerald-400">
                      ৳{job.rewardPerWorker}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-600 dark:text-slate-300">
                      {job.workersCompleted} / {job.workersNeeded}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          job.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : job.status === 'completed'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : job.status === 'paused'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {job.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {job.status === 'active' && (
                          <button
                            onClick={() => handleUpdateStatus(job.id, 'paused')}
                            disabled={processingId === job.id}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 font-bold text-xs cursor-pointer"
                          >
                            Pause
                          </button>
                        )}

                        {job.status === 'paused' && (
                          <button
                            onClick={() => handleUpdateStatus(job.id, 'active')}
                            disabled={processingId === job.id}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                          >
                            Activate
                          </button>
                        )}

                        <button
                          onClick={() => handleMoveToRecycleBin(job)}
                          disabled={processingId === job.id}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                          title="Move to Recycle Bin"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Details View Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Campaign Inspection: {selectedJob.title}
            </h3>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 space-y-2 max-h-72 overflow-y-auto">
              <p>
                <strong>Employer:</strong> {selectedJob.clientName} ({selectedJob.clientId})
              </p>
              <p>
                <strong>Budget:</strong> ৳{selectedJob.totalBudget} (৳{selectedJob.rewardPerWorker} × {selectedJob.workersNeeded} workers)
              </p>
              <p className="break-words">
                <strong>Description:</strong> {selectedJob.description}
              </p>
              <p className="break-words font-mono">
                <strong>Instructions:</strong> {selectedJob.instructions}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
