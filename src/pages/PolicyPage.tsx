import React from 'react';
import { Shield, FileText, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

interface PolicyPageProps {
  policyKey: string;
  onNavigate: (route: string) => void;
}

export const PolicyPage: React.FC<PolicyPageProps> = ({ policyKey, onNavigate }) => {
  const { language } = useLanguage();

  const getPolicyContent = () => {
    switch (policyKey) {
      case 'terms':
        return {
          title: language === 'bn' ? 'ব্যবহারের শর্তাবলী (Terms & Conditions)' : 'Terms and Conditions',
          updated: 'October 2026',
          sections: [
            {
              heading: '1. Introduction & Acceptance',
              text: 'Microjob BD is an online microtask platform operated under MRS Engineers BD (support email: mrs.engineers.bd26@gmail.com). By registering, posting jobs, or completing tasks on this platform, you agree to be bound by these Terms and Conditions.',
            },
            {
              heading: '2. User Accounts & Email Verification',
              text: 'Users must provide genuine information during registration. Accounts registered using Email and Password must verify their email address before participating in marketplace activities. Account creation with falsified identity or duplicate multi-accounting to manipulate tasks is strictly prohibited.',
            },
            {
              heading: '3. Role Separation (Employer & Freelancer)',
              text: 'A user may operate in Freelancer Mode to complete tasks or in Client Mode to post campaigns. However, balances are strictly partitioned into a Client Deposit Wallet and a Freelancer Earnings Wallet.',
            },
            {
              heading: '4. Code of Conduct',
              text: 'Users must not post deceptive, malicious, adult, phishing, or scam tasks. Freelancers must provide authentic proof. Falsifying screenshots will result in immediate permanent account termination.',
            },
          ],
        };
      case 'privacy':
        return {
          title: language === 'bn' ? 'গোপনীয়তা নীতি (Privacy Policy)' : 'Privacy Policy',
          updated: 'October 2026',
          sections: [
            {
              heading: '1. Information We Collect',
              text: 'We collect your full name, email address, mobile number for payment delivery (bKash/Nagad), and submitted proof records. We do not sell your personal data to third parties.',
            },
            {
              heading: '2. Use of Information',
              text: 'Your details are strictly used to process authentication via Firebase, verify payouts, disburse funds, and ensure marketplace safety.',
            },
            {
              heading: '3. Security & Storage',
              text: 'Authentication and database records are secured using Google Cloud Firebase Firestore ABAC security rules. Passwords and payment credentials are never exposed in client code.',
            },
          ],
        };
      case 'deposit':
        return {
          title: language === 'bn' ? 'ডিপোজিট নীতিমালা (Deposit Policy)' : 'Deposit Policy',
          updated: 'October 2026',
          sections: [
            {
              heading: '1. Deposit Methods',
              text: 'Microjob BD accepts deposits via official bKash and Nagad numbers. Clients must follow official instructions displayed on the Deposit page.',
            },
            {
              heading: '2. Verification Workflow',
              text: 'Every deposit request requires entering the sender mobile number and the official Transaction ID (TrxID). Our finance administration team manually verifies the receipt before crediting your Client Deposit Wallet.',
            },
            {
              heading: '3. Duplicate TrxID Prevention',
              text: 'Submitting a duplicate, altered, or fraudulent TrxID is considered fraud and will cause an immediate account freeze.',
            },
          ],
        };
      case 'withdrawal':
        return {
          title: language === 'bn' ? 'উত্তোলন নীতিমালা (Withdrawal Policy)' : 'Withdrawal Policy',
          updated: 'October 2026',
          sections: [
            {
              heading: '1. Minimum Cashout Threshold',
              text: 'The minimum withdrawal threshold is ৳20 (twenty Bangladeshi Taka). Freelancers can withdraw as soon as their available Earnings Wallet reaches ৳20.',
            },
            {
              heading: '2. Supported Channels',
              text: 'Payouts are made directly to your personal bKash or Nagad mobile account. Please ensure your 11-digit mobile number is active and correct.',
            },
            {
              heading: '3. Processing Timeline',
              text: 'Withdrawals are typically reviewed and sent within 2 to 24 hours. Upon completion, the official payment TrxID will be visible in your withdrawal history.',
            },
            {
              heading: '4. Balance Reservation & Rejections',
              text: 'When you submit a withdrawal request, the amount is reserved from your available balance. If your request is rejected due to an incorrect number, the full amount is returned to your earnings balance.',
            },
          ],
        };
      case 'refund':
        return {
          title: language === 'bn' ? 'রিফান্ড ও বিরোধ নিষ্পত্তি' : 'Refund and Dispute Policy',
          updated: 'October 2026',
          sections: [
            {
              heading: '1. Escrow Protection',
              text: 'When an employer posts a job, funds are reserved. If a job is closed or unfulfilled, any remaining unspent reserved funds are returned to the client’s Deposit Wallet.',
            },
            {
              heading: '2. Unfair Rejection Disputes',
              text: 'If a freelancer believes their valid work was wrongfully rejected, they can contact platform support (mrs.engineers.bd26@gmail.com). Admins can inspect submitted proof and resolve the dispute impartially.',
            },
            {
              heading: '3. 72-Hour Auto-Approval',
              text: 'To protect freelancers from unreviewed work, submissions not reviewed by the client within the platform review deadline (72 hours) are eligible for auto-approval.',
            },
          ],
        };
      case 'prohibited':
        return {
          title: language === 'bn' ? 'নিষিদ্ধ কার্যক্রম (Prohibited Activities)' : 'Prohibited Activities',
          updated: 'October 2026',
          sections: [
            {
              heading: 'Strictly Forbidden Tasks',
              text: '1. Malicious downloads, spyware, or keyloggers.\n2. Phishing sites, OTP sharing, or banking credential capture.\n3. Harassment, hate speech, or defamatory online campaigns.\n4. Artificial click manipulation or fake payment claims.\n5. Requesting off-platform direct communication to bypass marketplace safety.',
            },
          ],
        };
      case 'fees':
      default:
        return {
          title: language === 'bn' ? 'ফি এবং চার্জ (Fees & Charges)' : 'Fees and Charges',
          updated: 'October 2026',
          sections: [
            {
              heading: '1. Worker Fee Structure',
              text: 'Freelancers earn 100% of the published task reward. No hidden commissions are deducted from worker earnings.',
            },
            {
              heading: '2. Employer Campaign Fees',
              text: 'Posting fees are currently 0%. Employers pay only the exact worker budget they configure for their campaigns.',
            },
            {
              heading: '3. Withdrawal Fees',
              text: 'Withdrawals to personal bKash and Nagad wallets carry 0% platform processing fee. Minimum cashout is ৳20.',
            },
          ],
        };
    }
  };

  const content = getPolicyContent();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-8">
      <button
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-700 shadow-xs space-y-8">
        <div className="border-b border-slate-100 dark:border-slate-700 pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-3">
            <Shield className="w-3.5 h-3.5" /> Platform Governance
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {content.title}
          </h1>
          <span className="text-xs text-slate-400 mt-2 block">
            Brand: MRS Engineers BD | Last Updated: {content.updated} | Contact:{' '}
            <a
              href="mailto:mrs.engineers.bd26@gmail.com"
              className="text-emerald-600 dark:text-emerald-400 underline"
            >
              mrs.engineers.bd26@gmail.com
            </a>
          </span>
        </div>

        <div className="space-y-6">
          {content.sections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {sec.heading}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {sec.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
