import React, { useState } from 'react';
import {
  Mail,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { sendContactMessage } from '../services/db';
import { useLanguage } from '../lib/i18n';

export const ContactUsPage: React.FC = () => {
  const { language, t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError('Please fill in all contact fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await sendContactMessage(name.trim(), email.trim(), subject.trim(), message.trim());
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch message. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-3">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Support & Inquiries</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {language === 'bn' ? 'আমাদের সাথে যোগাযোগ করুন' : 'Get in Touch with Microjob BD'}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Have a question regarding task verification, custom enterprise campaigns, or payments? Our support team is here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
              Official Contact
            </span>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-slate-400 font-medium">Direct Support Email:</span>
                  <a
                    href="mailto:mrs.engineers.bd26@gmail.com"
                    className="font-bold text-white hover:text-emerald-400 transition-colors"
                  >
                    mrs.engineers.bd26@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-slate-400 font-medium">Parent Engineering Brand:</span>
                  <span className="font-bold text-white">MRS Engineers BD</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-slate-400 font-medium">Support Hours:</span>
                  <span className="text-slate-300">9:00 AM – 11:00 PM (GMT+6) Daily</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
            <p className="flex items-center gap-1.5 text-emerald-300 font-semibold">
              <ShieldCheck className="w-4 h-4" /> 100% Genuine Bangladeshi Platform
            </p>
            <p>bKash & Nagad payments are processed through secure manual admin verification.</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Message Dispatched Successfully!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Thank you for contacting us. A ticket has been placed into our administration inbox, and we will reply to your email promptly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-2">
                Send a Message
              </h3>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Your Full Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tanvir Hossain"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Your Email:
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tanvir@example.com"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Subject / Topic:
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Deposit Verification Inquiry or Job Question"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Message Description:
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your query in detail..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Sending...' : 'Submit Message'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
