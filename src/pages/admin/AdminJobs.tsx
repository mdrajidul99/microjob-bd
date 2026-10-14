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
} from 'lucide-react';
import { getJobs, updateJobStatus } from '../../services/db';
import { Job } from '../../types';

export const AdminJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

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
      await updateJobStatus(jobId, status);
      await fetchJobs();
      if (selectedJob?.id === jobId) {
        setSelectedJob(null);
      }
    } catch (err) {
      console.warn('Update status error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">
          Job Moderation & Control
        </h2>
        <p className="text-xs text-slate-500">
          Review campaigns, pause suspicious tasks, or deactivate non-compliant jobs.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-slate-100 dark:bg-slate-700/50 animate-pulse"
              />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No jobs found on the platform.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Job Title</th>
                  <th className="py-2.5 px-3">Reward</th>
                  <th className="py-2.5 px-3">Workers</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {job.clientName}
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
                            : job.status === 'paused'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 dark:text-slate-300"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {job.status === 'active' && (
                          <button
                            onClick={() => handleUpdateStatus(job.id, 'paused')}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-xs"
                          >
                            Pause
                          </button>
                        )}

                        {job.status === 'paused' && (
                          <button
                            onClick={() => handleUpdateStatus(job.id, 'active')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                          >
                            Activate
                          </button>
                        )}
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
              <p>
                <strong>Description:</strong> {selectedJob.description}
              </p>
              <p>
                <strong>Instructions:</strong> {selectedJob.instructions}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
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
