import React from 'react';
import { Mail, Shield, ExternalLink, Heart } from 'lucide-react';
import { useLanguage } from '../../lib/i18n';
import { Logo } from '../common/Logo';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Logo size="md" onClick={() => onNavigate('/')} />

            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'bn'
                ? 'বাংলাদেশের নির্ভরযোগ্য মাইক্রোটাস্ক মার্কেটপ্লেস। বিশ্বস্ত নিয়োগদাতা ও নিবেদিত ফ্রিল্যান্সারদের সরাসরি সংযোগ।'
                : 'Bangladesh’s premier microtask marketplace. Connecting trusted employers with dedicated freelancers for fast results and daily earnings.'}
            </p>

            <div className="pt-2 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href="mailto:mrs.engineers.bd26@gmail.com"
                  className="hover:text-emerald-400 transition-colors"
                >
                  mrs.engineers.bd26@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Shield className="w-4 h-4 text-sky-400 shrink-0" />
                <span>bKash & Nagad Payouts (Min: ৳20)</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('nav.home')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/jobs')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('nav.browseJobs')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/how-it-works')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('nav.howItWorks')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/categories')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('nav.categories')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/faq')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('nav.faq')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('nav.contact')}
                </button>
              </li>
            </ul>
          </div>

          {/* Policies & Compliance */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              {t('footer.policies')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/policy/terms')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('policy.terms')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/policy/privacy')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('policy.privacy')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/policy/deposit')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('policy.deposit')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/policy/withdrawal')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('policy.withdrawal')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/policy/refund')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('policy.refund')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/policy/prohibited')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('policy.prohibited')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/policy/fees')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('policy.fees')}
                </button>
              </li>
            </ul>
          </div>

          {/* Payment Badges & Brand */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Supported Payouts
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Instant manual processing directly to your personal mobile wallet in Bangladesh.
            </p>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-pink-950/40 border border-pink-700/50 text-pink-400 font-extrabold text-xs">
                bKash
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-orange-950/40 border border-orange-700/50 text-orange-400 font-extrabold text-xs">
                Nagad
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
              <p>Platform fee: 0% for workers</p>
              <p>Employer security escrow model</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Microjob BD. All rights reserved. Brand: MRS Engineers BD.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with precision for Bangladesh</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
