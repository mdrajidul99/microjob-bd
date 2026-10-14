import React from 'react';
import { Briefcase, ShieldCheck, Heart, Award, Users, Mail } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

export const AboutUsPage: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs mb-3">
          <Briefcase className="w-3.5 h-3.5" /> About Microjob BD
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Empowering the Bangladeshi Gig Economy
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Microjob BD is a microtask marketplace developed by MRS Engineers BD, created to give students, homemakers, and freelancers across Bangladesh the opportunity to earn real daily income through simple digital tasks.
        </p>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Integrity & Fair Pay
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We operate on a zero-hidden-fee model for workers with 100% payout delivery through verified bKash and Nagad numbers.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Rapid Scalability
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Employers reach real people across Bangladesh to complete digital marketing, survey responses, and user experience testing.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            MRS Engineers BD
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Backed by dedicated technical architecture and engineering governance prioritizing data safety, fraud prevention, and uptime.
          </p>
        </div>
      </div>

      {/* Trust & Contact Box */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 text-center max-w-2xl mx-auto space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Need assistance or partnership information?
        </h3>
        <p className="text-xs text-slate-500">
          Our engineering support team is available to assist you with account verification, payment verifications, and custom campaigns.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <Mail className="w-4 h-4" />
          <a href="mailto:mrs.engineers.bd26@gmail.com" className="hover:underline">
            mrs.engineers.bd26@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};
