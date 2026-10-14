import React, { useState, useEffect } from 'react';
import { FileText, Shield, Clock } from 'lucide-react';
import { getAuditLogs } from '../../services/db';
import { AuditLog } from '../../types';

export const AdminAudit: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.warn('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">
          Security & Administrative Audit Trail
        </h2>
        <p className="text-xs text-slate-500">
          Append-only immutable record of all financial approvals, suspensions, and settings changes.
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
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No audit records generated yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Action Type</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {l.actorEmail || l.actorUid}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-purple-600 dark:text-purple-400">
                      {l.actionType}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {l.targetCollection} ({l.targetId?.slice(0, 8)}...)
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                      {l.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
