import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../lib/i18n';
import {
  getOrCreateConversation,
  sendChatMessage,
  subscribeToChatMessages,
} from '../../services/db';
import { ChatMessage } from '../../types';

interface JobChatModalProps {
  jobId: string;
  clientId: string;
  freelancerId?: string;
  jobTitle: string;
  onClose: () => void;
}

export const JobChatModal: React.FC<JobChatModalProps> = ({
  jobId,
  clientId,
  freelancerId: propFreelancerId,
  jobTitle,
  onClose,
}) => {
  const { currentUser, profile } = useAuth();
  const { language, t } = useLanguage();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If user is client, the other party is freelancerId; if user is freelancer, other party is clientId
  const actualFreelancerId = propFreelancerId || currentUser?.uid || '';
  const recipientId = currentUser?.uid === clientId ? actualFreelancerId : clientId;

  useEffect(() => {
    if (!currentUser) return;

    let unsub: (() => void) | undefined;
    getOrCreateConversation(
      jobId,
      jobTitle,
      clientId,
      actualFreelancerId,
      'Employer',
      profile?.displayName || 'Freelancer'
    )
      .then((convId) => {
        setConversationId(convId);
        unsub = subscribeToChatMessages(convId, (msgs) => {
          setMessages(msgs);
          setLoading(false);
        });
      })
      .catch((err) => {
        console.warn('Error starting chat conversation:', err);
        setLoading(false);
      });

    return () => {
      if (unsub) unsub();
    };
  }, [jobId, clientId, actualFreelancerId, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !conversationId || !currentUser) return;

    try {
      setSending(true);
      const text = inputText.trim();
      setInputText('');
      await sendChatMessage(
        conversationId,
        currentUser.uid,
        profile?.displayName || currentUser.displayName || 'User',
        text,
        recipientId,
        jobTitle
      );
    } catch (err) {
      console.warn('Error sending chat message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full h-[580px] border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="min-w-0">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
              {jobTitle}
            </h3>
            <span className="text-[11px] text-slate-400 block truncate">
              Direct Communication regarding task instructions
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text-only policy banner */}
        <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-[11px] border-b border-emerald-100 dark:border-emerald-900/50 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 shrink-0" />
          <span>{t('chat.textOnlyNotice')}</span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full text-xs text-slate-400">
              Loading conversation...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 text-xs p-6 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300" />
              <p>No messages yet.</p>
              <p className="text-[11px]">
                Send a question or clarify proof instructions with the employer/worker.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === currentUser?.uid;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 mb-0.5 px-1">
                    {msg.senderName}
                  </span>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed break-words ${
                      isMine
                        ? 'bg-emerald-600 text-white rounded-tr-xs'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            required
            maxLength={2000}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('chat.placeholder')}
            className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
