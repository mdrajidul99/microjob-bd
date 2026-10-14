import { useState, useEffect, createContext, useContext } from 'react';

export type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.browseJobs': 'Find Jobs',
    'nav.howItWorks': 'How It Works',
    'nav.categories': 'Categories',
    'nav.about': 'About Us',
    'nav.contact': 'Contact Us',
    'nav.faq': 'FAQ',
    'nav.login': 'Log In',
    'nav.register': 'Sign Up',
    'nav.logout': 'Sign Out',
    'nav.postJob': 'Post a Job',
    'nav.dashboard': 'Dashboard',
    'nav.admin': 'Admin Panel',
    'nav.workspace': 'Workspace',
    'nav.switchFreelancer': 'Freelancer Mode',
    'nav.switchClient': 'Client Mode',

    // Hero & Home
    'hero.badge': 'Trusted Microtask Platform in Bangladesh',
    'hero.title': 'Complete Simple Tasks & Earn Money Daily',
    'hero.subtitle': 'Connect with thousands of Bangladeshi businesses and freelancers. Earn real money with bKash and Nagad payouts.',
    'hero.ctaFreelancer': 'Start Earning Now',
    'hero.ctaClient': 'Post a Job (Hire Fast)',
    'hero.statsWorkers': '10,000+ Active Workers',
    'hero.statsJobs': '50,000+ Jobs Completed',
    'hero.statsPayout': '৳1,500,000+ Paid Out',
    'hero.minWithdrawal': 'Min Withdrawal: ৳20',

    // How It Works
    'hiw.title': 'How Microjob BD Works',
    'hiw.subtitle': 'Transparent, fast, and secure for both employers and freelancers.',
    'hiw.freelancerTitle': 'For Freelancers',
    'hiw.clientTitle': 'For Employers & Clients',
    'hiw.fStep1Title': '1. Create Account',
    'hiw.fStep1Desc': 'Sign up in 30 seconds and verify your email.',
    'hiw.fStep2Title': '2. Pick a Task',
    'hiw.fStep2Desc': 'Browse hundreds of microjobs matching your skills.',
    'hiw.fStep3Title': '3. Submit Proof',
    'hiw.fStep3Desc': 'Complete task instructions and upload screenshots or required answers.',
    'hiw.fStep4Title': '4. Get Paid to bKash/Nagad',
    'hiw.fStep4Desc': 'Once approved, withdraw directly with min ৳20 threshold.',
    'hiw.cStep1Title': '1. Deposit Funds',
    'hiw.cStep1Desc': 'Top up your Client Deposit Wallet securely using bKash or Nagad.',
    'hiw.cStep2Title': '2. Post Your Job',
    'hiw.cStep2Desc': 'Set rewards per worker, instructions, and proof requirements.',
    'hiw.cStep3Title': '3. Review Submissions',
    'hiw.cStep3Desc': 'Check workers proofs with 72-hour auto-approval guarantee.',
    'hiw.cStep4Title': '4. Scale Your Business',
    'hiw.cStep4Desc': 'Get fast social engagement, app installs, reviews, and signups.',

    // Wallets
    'wallet.clientDeposit': 'Client Deposit Wallet',
    'wallet.freelancerEarnings': 'Freelancer Earnings Wallet',
    'wallet.available': 'Available Balance',
    'wallet.reserved': 'Reserved in Active Jobs',
    'wallet.pendingPayout': 'Pending Withdrawal',
    'wallet.totalDeposited': 'Total Deposited',
    'wallet.totalSpent': 'Total Spent',
    'wallet.totalEarned': 'Total Earned',
    'wallet.totalWithdrawn': 'Total Withdrawn',
    'wallet.depositBtn': 'Deposit Funds',
    'wallet.withdrawBtn': 'Withdraw Earnings',

    // Financial actions
    'deposit.title': 'Deposit Funds to Client Wallet',
    'deposit.subtitle': 'Deposit funds using official bKash or Nagad numbers. Funds will be credited after admin verification.',
    'deposit.amount': 'Deposit Amount (৳)',
    'deposit.method': 'Payment Method',
    'deposit.senderNumber': 'Your Mobile Number (Sender)',
    'deposit.txId': 'Transaction ID (TrxID)',
    'deposit.submit': 'Submit Deposit Request',
    'deposit.instructions': 'Payment Instructions',

    'withdraw.title': 'Withdraw Freelancer Earnings',
    'withdraw.subtitle': 'Withdraw your approved earnings directly to your bKash or Nagad personal wallet.',
    'withdraw.minNotice': 'Minimum withdrawal amount is ৳20.',
    'withdraw.amount': 'Withdrawal Amount (৳)',
    'withdraw.recipientNumber': 'Personal bKash / Nagad Number',
    'withdraw.submit': 'Submit Withdrawal Request',

    // Job Posting & Details
    'job.title': 'Job Title',
    'job.category': 'Category',
    'job.reward': 'Reward per Worker (৳)',
    'job.workersNeeded': 'Workers Needed',
    'job.totalCost': 'Total Job Budget (৳)',
    'job.instructions': 'Step-by-Step Instructions',
    'job.proofReqs': 'Proof Requirements',
    'job.addProofField': 'Add Proof Field',
    'job.postSubmit': 'Review & Post Job',
    'job.status': 'Status',
    'job.deadline': 'Estimated Completion Days',
    'job.applyBtn': 'Submit Work',

    // Submissions
    'sub.title': 'My Submissions',
    'sub.statusSubmitted': 'Under Review',
    'sub.statusApproved': 'Approved & Paid',
    'sub.statusRejected': 'Rejected',
    'sub.statusRevision': 'Revision Requested',
    'sub.resubmit': 'Resubmit Revision',

    // Chat
    'chat.title': 'Job Communication',
    'chat.placeholder': 'Type your message...',
    'chat.send': 'Send',
    'chat.textOnlyNotice': 'Text communication only for instructions and proof clarification.',

    // Email verification
    'verify.banner': 'Please verify your email address to access all marketplace features.',
    'verify.resend': 'Resend Email',
    'verify.refresh': 'I have verified (Refresh)',
    'verify.sent': 'Verification email has been sent! Check your inbox or spam folder.',

    // Admin
    'admin.title': 'Administrative Dashboard',
    'admin.users': 'User Management',
    'admin.jobs': 'Job Moderation',
    'admin.categories': 'Categories',
    'admin.deposits': 'Deposit Queue',
    'admin.withdrawals': 'Withdrawal Queue',
    'admin.contacts': 'Contact Inbox',
    'admin.settings': 'Platform Settings',
    'admin.audit': 'Audit Logs',
    'admin.approve': 'Approve',
    'admin.reject': 'Reject',
    'admin.reasonPlaceholder': 'Enter rejection reason...',

    // Footer & Brand
    'footer.brand': 'Microjob BD',
    'footer.by': 'A Project of MRS Engineers BD',
    'footer.rights': 'All rights reserved.',
    'footer.support': 'Support: mrs.engineers.bd26@gmail.com',
    'footer.policies': 'Policies & Legal',
    'footer.quickLinks': 'Quick Links',

    // Policies
    'policy.terms': 'Terms and Conditions',
    'policy.privacy': 'Privacy Policy',
    'policy.deposit': 'Deposit Policy',
    'policy.withdrawal': 'Withdrawal Policy',
    'policy.refund': 'Refund & Dispute Policy',
    'policy.prohibited': 'Prohibited Activities',
    'policy.fees': 'Fees & Charges',
  },
  bn: {
    // Navigation
    'nav.home': 'হোম',
    'nav.browseJobs': 'কাজ খুঁজুন',
    'nav.howItWorks': 'কীভাবে কাজ করে',
    'nav.categories': 'ক্যাটাগরি',
    'nav.about': 'আমাদের সম্পর্কে',
    'nav.contact': 'যোগাযোগ',
    'nav.faq': 'সাধারণ জিজ্ঞাসা',
    'nav.login': 'লগইন',
    'nav.register': 'রেজিস্ট্রেশন',
    'nav.logout': 'সাইন আউট',
    'nav.postJob': 'কাজ পোস্ট করুন',
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.admin': 'অ্যাডমিন প্যানেল',
    'nav.workspace': 'ওয়ার্কস্পেস',
    'nav.switchFreelancer': 'ফ্রিল্যান্সার মোড',
    'nav.switchClient': 'ক্লায়েন্ট মোড',

    // Hero & Home
    'hero.badge': 'বাংলাদেশের নির্ভরযোগ্য মাইক্রোটাস্ক মার্কেটপ্লেস',
    'hero.title': 'সহজ কাজ সম্পন্ন করে প্রতিদিন আয় করুন',
    'hero.subtitle': 'হাজার হাজার বাংলাদেশি উদ্যোক্তা ও ফ্রিল্যান্সারদের সাথে যুক্ত হোন। বিকাশ ও নগদে সরাসরি টাকা উত্তোলন করুন।',
    'hero.ctaFreelancer': 'এখনই আয় শুরু করুন',
    'hero.ctaClient': 'কাজ পোস্ট করুন (দ্রুত কর্মী পান)',
    'hero.statsWorkers': '১০,০০০+ সক্রিয় কর্মী',
    'hero.statsJobs': '৫০,০০০+ কাজ সম্পন্ন',
    'hero.statsPayout': '৳১৫,০০,০০০+ উত্তোলিত',
    'hero.minWithdrawal': 'সর্বনিম্ন উত্তোলন: ৳২০',

    // How It Works
    'hiw.title': 'মাইক্রোজব বিডি কীভাবে কাজ করে',
    'hiw.subtitle': 'নিয়োগদাতা ও ফ্রিল্যান্সার উভয়ের জন্য স্বচ্ছ, দ্রুত ও নিরাপদ।',
    'hiw.freelancerTitle': 'ফ্রিল্যান্সারদের জন্য',
    'hiw.clientTitle': 'নিয়োগদাতা ও ক্লায়েন্টদের জন্য',
    'hiw.fStep1Title': '১. অ্যাকাউন্ট তৈরি করুন',
    'hiw.fStep1Desc': 'মাত্র ৩০ সেকেন্ডে সাইন আপ করে ইমেইল ভেরিফাই করুন।',
    'hiw.fStep2Title': '২. কাজ বেছে নিন',
    'hiw.fStep2Desc': 'আপনার দক্ষতার সাথে মানানসই শত শত ছোট কাজ থেকে নির্বাচন করুন।',
    'hiw.fStep3Title': '৩. কাজের প্রমাণ জমা দিন',
    'hiw.fStep3Desc': 'নির্দেশনা অনুযায়ী কাজ সম্পন্ন করে স্ক্রিনশট বা উত্তর জমা দিন।',
    'hiw.fStep4Title': '৪. বিকাশ বা নগদে টাকা পান',
    'hiw.fStep4Desc': 'কাজ অনুমোদিত হলে মাত্র ২০ টাকা হলেই সরাসরি ক্যাশআউট করুন।',
    'hiw.cStep1Title': '১. ব্যালেন্স ডিপোজিট করুন',
    'hiw.cStep1Desc': 'বিকাশ বা নগদের মাধ্যমে নিরাপদভাবে ক্লায়েন্ট ডিপোজিট ওয়ালেটে টাকা যোগ করুন।',
    'hiw.cStep2Title': '২. কাজ পোস্ট করুন',
    'hiw.cStep2Desc': 'প্রতি কর্মীর পারিশ্রমিক, বিস্তারিত নির্দেশনা ও প্রমাণের শর্ত নির্ধারণ করুন।',
    'hiw.cStep3Title': '৩. কাজের প্রমাণ যাচাই করুন',
    'hiw.cStep3Desc': 'কর্মীদের প্রমাণ যাচাই করুন। ৭২ ঘণ্টার মধ্যে স্বয়ংক্রিয় অনুমোদন সুবিধা।',
    'hiw.cStep4Title': '৪. আপনার ব্যবসা এগিয়ে নিন',
    'hiw.cStep4Desc': 'সোশ্যাল মিডিয়া এনগেজমেন্ট, রিভিউ, অ্যাপ ইনস্টল ও সাইন আপ দ্রুত বৃদ্ধি করুন।',

    // Wallets
    'wallet.clientDeposit': 'ক্লায়েন্ট ডিপোজিট ওয়ালেট',
    'wallet.freelancerEarnings': 'ফ্রিল্যান্সার আর্নিংস ওয়ালেট',
    'wallet.available': 'উত্তোলনযোগ্য ব্যালেন্স',
    'wallet.reserved': 'চলতি কাজে সংরক্ষিত',
    'wallet.pendingPayout': 'উত্তোলনের অপেক্ষায়',
    'wallet.totalDeposited': 'মোট জমা',
    'wallet.totalSpent': 'মোট ব্যয়',
    'wallet.totalEarned': 'মোট আয়',
    'wallet.totalWithdrawn': 'মোট উত্তোলন',
    'wallet.depositBtn': 'ডিপোজিট করুন',
    'wallet.withdrawBtn': 'টাকা তুলুন',

    // Financial actions
    'deposit.title': 'ক্লায়েন্ট ওয়ালেটে ডিপোজিট',
    'deposit.subtitle': 'আমাদের অফিসিয়াল বিকাশ বা নগদ নম্বরে সেন্ড মানি করুন। অ্যাডমিন যাচাইয়ের পর ব্যালেন্স যুক্ত হবে।',
    'deposit.amount': 'ডিপোজিটের পরিমাণ (৳)',
    'deposit.method': 'পেমেন্ট মাধ্যম',
    'deposit.senderNumber': 'যে নম্বর থেকে পাঠিয়েছেন',
    'deposit.txId': 'ট্রানজেকশন আইডি (TrxID)',
    'deposit.submit': 'ডিপোজিট রিকোয়েস্ট পাঠান',
    'deposit.instructions': 'পেমেন্ট নির্দেশিকা',

    'withdraw.title': 'আর্নিংস ওয়ালেট থেকে উত্তোলন',
    'withdraw.subtitle': 'আপনার আয়ের টাকা সরাসরি আপনার ব্যক্তিগত বিকাশ বা নগদ অ্যাকাউন্টে উত্তোলন করুন।',
    'withdraw.minNotice': 'সর্বনিম্ন উত্তোলনের পরিমাণ ২০ টাকা।',
    'withdraw.amount': 'উত্তোলনের পরিমাণ (৳)',
    'withdraw.recipientNumber': 'ব্যক্তিগত বিকাশ / নগদ নম্বর',
    'withdraw.submit': 'উত্তোলন রিকোয়েস্ট পাঠান',

    // Job Posting & Details
    'job.title': 'কাজের শিরোনাম',
    'job.category': 'ক্যাটাগরি',
    'job.reward': 'কর্মী প্রতি পারিশ্রমিক (৳)',
    'job.workersNeeded': 'কতজন কর্মী প্রয়োজন',
    'job.totalCost': 'মোট বাজেট (৳)',
    'job.instructions': 'ধাপ অনুসারে কাজের বিস্তারিত নির্দেশনা',
    'job.proofReqs': 'কাজের প্রমাণের প্রয়োজনীয়তা',
    'job.addProofField': 'প্রমাণের ফিল্ড যোগ করুন',
    'job.postSubmit': 'যাচাই করে কাজ পোস্ট করুন',
    'job.status': 'অবস্থা',
    'job.deadline': 'আনুমানিক সম্পন্ন করার সময় (দিন)',
    'job.applyBtn': 'কাজ জমা দিন',

    // Submissions
    'sub.title': 'আমার জমাকৃত কাজসমূহ',
    'sub.statusSubmitted': 'পর্যালোচনাধীন',
    'sub.statusApproved': 'অনুমোদিত ও পরিশোধিত',
    'sub.statusRejected': 'বাতিল',
    'sub.statusRevision': 'সংশোধন চাওয়া হয়েছে',
    'sub.resubmit': 'সংশোধন করে পুনরায় জমা দিন',

    // Chat
    'chat.title': 'কাজের যোগাযোগ',
    'chat.placeholder': 'বার্তা লিখুন...',
    'chat.send': 'পাঠান',
    'chat.textOnlyNotice': 'কাজের নির্দেশনা ও প্রমাণের স্পষ্টতার জন্য শুধুমাত্র টেক্সট চ্যাট অনুমোদিত।',

    // Email verification
    'verify.banner': 'প্ল্যাটফর্মের সকল সুবিধা ব্যবহার করতে আপনার ইমেইল ভেরিফাই করুন।',
    'verify.resend': 'পুনরায় ইমেইল পাঠান',
    'verify.refresh': 'আমি ভেরিফাই করেছি (রিফ্রেশ)',
    'verify.sent': 'ভেরিফিকেশন ইমেইল পাঠানো হয়েছে! আপনার ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।',

    // Admin
    'admin.title': 'অ্যাডমিন ড্যাশবোর্ড',
    'admin.users': 'ব্যবহারকারী ব্যবস্থাপনা',
    'admin.jobs': 'কাজের অনুমোদন',
    'admin.categories': 'ক্যাটাগরি সমূহ',
    'admin.deposits': 'ডিপোজিট রিকোয়েস্ট',
    'admin.withdrawals': 'উত্তোলন রিকোয়েস্ট',
    'admin.contacts': 'যোগাযোগ ইনবক্স',
    'admin.settings': 'প্ল্যাটফর্ম সেটিংস',
    'admin.audit': 'অডিট লগ',
    'admin.approve': 'অনুমোদন করুন',
    'admin.reject': 'বাতিল করুন',
    'admin.reasonPlaceholder': 'বাতিলের কারণ লিখুন...',

    // Footer & Brand
    'footer.brand': 'মাইক্রোজব বিডি',
    'footer.by': 'এমআরএস ইঞ্জিনিয়ার্স বিডি (MRS Engineers BD)-এর একটি উদ্যোগ',
    'footer.rights': 'সর্বস্বত্ব সংরক্ষিত।',
    'footer.support': 'সাপোর্ট: mrs.engineers.bd26@gmail.com',
    'footer.policies': 'নীতিমালা ও শর্তাবলী',
    'footer.quickLinks': 'প্রয়োজনীয় লিংক',

    // Policies
    'policy.terms': 'ব্যবহারের শর্তাবলী (Terms)',
    'policy.privacy': 'গোপনীয়তা নীতি (Privacy Policy)',
    'policy.deposit': 'ডিপোজিট নীতিমালা',
    'policy.withdrawal': 'উত্তোলন নীতিমালা',
    'policy.refund': 'রিফান্ড ও বিরোধ নিষ্পত্তি',
    'policy.prohibited': 'নিষিদ্ধ কার্যক্রম',
    'policy.fees': 'ফি এবং চার্জ',
  },
};

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const useLanguage = () => useContext(LanguageContext);
