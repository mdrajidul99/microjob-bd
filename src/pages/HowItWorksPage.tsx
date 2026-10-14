import React from 'react';
import {
  Users,
  Briefcase,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Coins,
  Send,
} from 'lucide-react';
import { useLanguage } from '../lib/i18n';

interface HowItWorksPageProps {
  onNavigate: (route: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('hiw.title')}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300">
          A seamless, transparent ecosystem built specifically for employers and freelancers in Bangladesh.
        </p>
      </div>

      {/* Freelancer Journey */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-700 shadow-sm space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
          <Users className="w-4 h-4" /> For Workers & Freelancers
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          How to Earn Money Daily
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs">
              1
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Register & Verify
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Create an account with your active mobile number and email. Verify your email to activate full marketplace features.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs">
              2
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Select Simple Tasks
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Browse microjobs in social media, YouTube, surveys, typing, and app testing. Choose tasks that suit your skills.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs">
              3
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Submit Valid Proof
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Follow instructions step-by-step. Submit requested screenshots or text answers for client inspection.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs">
              4
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Cashout to bKash/Nagad
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Once approved, your Earnings Wallet is credited immediately. Request payout with a low minimum threshold of just ৳20.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => onNavigate('/jobs')}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Start Browsing Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Employer Journey */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-700 shadow-sm space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold text-xs">
          <Briefcase className="w-4 h-4" /> For Employers & Business Owners
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          How to Hire Rapid Workers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="w-8 h-8 rounded-full bg-sky-600 text-white font-extrabold flex items-center justify-center text-xs">
              1
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Deposit Wallet Funds
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Add funds to your Client Deposit Wallet via our official bKash or Nagad personal numbers with zero hidden commission.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="w-8 h-8 rounded-full bg-sky-600 text-white font-extrabold flex items-center justify-center text-xs">
              2
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Launch Campaign
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Define the reward per worker, required number of completions, and custom proof fields (screenshots or text answers).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="w-8 h-8 rounded-full bg-sky-600 text-white font-extrabold flex items-center justify-center text-xs">
              3
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Review Work Proof
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Inspect submitted work with one click. Approve valid work, request revisions, or reject invalid submissions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="w-8 h-8 rounded-full bg-sky-600 text-white font-extrabold flex items-center justify-center text-xs">
              4
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Fast Results Delivered
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Scale your social proof, organic engagements, app reviews, and signups across Bangladesh within hours.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => onNavigate('/client/post-job')}
            className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Post a Job Campaign</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
