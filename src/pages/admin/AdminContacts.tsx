import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, Clock, Filter, Archive } from 'lucide-react';
import { getContactMessages, updateContactStatus } from '../../services/db';
import { ContactMessage } from '../../types';

export const AdminContacts: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('new');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getContactMessages();
      setMessages(data);
    } catch (err) {
      console.warn('Error fetching contact messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (msgId: string, status: ContactMessage['status']) => {
    await updateContactStatus(msgId, status);
    await fetchMessages();
  };

  const filtered = messages.filter((m) => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Support & Inquiries Inbox
          </h2>
          <p className="text-xs text-slate-500">
            Messages dispatched from public Contact Us page to mrs.engineers.bd26@gmail.com.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['new', 'in_progress', 'resolved', 'all'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${
                filter === st
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-xl bg-slate-100 dark:bg-slate-700/50 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No contact messages found in this filter.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((msg) => (
              <div
                key={msg.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {msg.name} ({msg.email})
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Subject: {msg.subject} • {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        msg.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : msg.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                      }`}
                    >
                      {msg.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/60">
                  {msg.message}
                </p>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <a
                    href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                    className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  >
                    Reply via Email
                  </a>

                  {msg.status !== 'resolved' && (
                    <button
                      onClick={() => handleStatusChange(msg.id, 'resolved')}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
