import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Search } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

export const FaqPage: React.FC = () => {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      qEn: 'What is Microjob BD?',
      qBn: 'মাইক্রোজব বিডি কী?',
      aEn: 'Microjob BD is a microtask marketplace in Bangladesh operated by MRS Engineers BD. It connects clients who need small digital jobs completed with freelancers who earn daily income completing those tasks.',
      aBn: 'মাইক্রোজব বিডি হলো এমআরএস ইঞ্জিনিয়ার্স বিডি পরিচালিত একটি বাংলাদেশি অনলাইন মাইক্রোটাস্ক মার্কেটপ্লেস। এখানে নিয়োগদাতারা ছোট ছোট কাজের মাধ্যমে হাজারো কর্মীদের নিয়োগ করতে পারেন এবং কর্মীরা প্রতিদিন আয় করতে পারেন।',
    },
    {
      qEn: 'What is the minimum withdrawal amount?',
      qBn: 'সর্বনিম্ন কত টাকা উত্তোলন করা যায়?',
      aEn: 'The minimum withdrawal amount is ৳20 (twenty Bangladeshi Taka). Once your Freelancer Earnings Wallet reaches ৳20, you can request a cashout to your personal bKash or Nagad wallet.',
      aBn: 'সর্বনিম্ন উত্তোলনের পরিমাণ মাত্র ২০ টাকা। আপনার আর্নিংস ওয়ালেটে ২০ টাকা জমা হলেই আপনি বিকাশ বা নগদে উত্তোলনের আবেদন করতে পারবেন।',
    },
    {
      qEn: 'How do deposits work for clients?',
      qBn: 'ক্লায়েন্ট বা নিয়োগদাতারা কীভাবে ডিপোজিট করবেন?',
      aEn: 'Clients send money to our official bKash or Nagad numbers displayed on the Deposit page. Then, submit the sender mobile number and the Transaction ID (TrxID). Our administration verifies the transaction and credits your Client Deposit Wallet.',
      aBn: 'ক্লায়েন্টরা ডিপোজিট পেজে প্রদর্শিত আমাদের অফিসিয়াল বিকাশ বা নগদ নম্বরে সেন্ড মানি করবেন। এরপর প্রেরক নম্বর ও TrxID সাবমিট করবেন। অ্যাডমিন ভেরিফাই করে আপনার ডিপোজিট ওয়ালেটে ব্যালেন্স যুক্ত করে দেবে।',
    },
    {
      qEn: 'Why is email verification mandatory?',
      qBn: 'ইমেইল ভেরিফিকেশন কেন বাধ্যতামূলক?',
      aEn: 'Mandatory email verification prevents fraudulent bots, spam accounts, and multi-accounting, ensuring high-quality work for clients and protected payments for honest freelancers.',
      aBn: 'প্ল্যাটফর্মকে বট ও ভুয়া অ্যাকাউন্ট মুক্ত রাখতে এবং কাজের গুণগত মান বজায় রাখতে ইমেইল ভেরিফিকেশন বাধ্যতামূলক।',
    },
    {
      qEn: 'What happens if a client does not review my submitted work?',
      qBn: 'ক্লায়েন্ট কাজ রিভিউ না করলে কী হবে?',
      aEn: 'Microjob BD features a 72-hour auto-approval policy. If the client does not inspect your submission within 72 hours, the system marks the work approved and releases the payment to your Earnings Wallet.',
      aBn: 'আমাদের প্ল্যাটফর্মে ৭২ ঘণ্টার অটো-অ্যাপ্রুভাল সুবিধা রয়েছে। ৭২ ঘণ্টার মধ্যে ক্লায়েন্ট কাজ রিভিউ না করলে স্বয়ংক্রিয়ভাবে কাজ অনুমোদিত হয়ে আপনার ওয়ালেটে টাকা জমা হয়ে যাবে।',
    },
    {
      qEn: 'Can I switch between Freelancer and Client modes?',
      qBn: 'আমি কি একই অ্যাকাউন্ট দিয়ে কাজ করতে এবং কাজ দিতে পারব?',
      aEn: 'Yes! A single user account can freely switch between Freelancer Mode (to complete tasks and earn) and Client Mode (to deposit funds and hire workers). Balances remain safely separated in their respective wallets.',
      aBn: 'হ্যাঁ! একই অ্যাকাউন্ট ব্যবহার করে আপনি ফ্রিল্যান্সার মোড এবং ক্লায়েন্ট মোডে পরিবর্তন করতে পারবেন। উভয় ওয়ালেটের ব্যালেন্স সম্পূর্ণ সুরক্ষিত ও আলাদা থাকবে।',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.qEn.toLowerCase().includes(search.toLowerCase()) ||
      f.qBn.toLowerCase().includes(search.toLowerCase()) ||
      f.aEn.toLowerCase().includes(search.toLowerCase()) ||
      f.aBn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs mb-3">
          <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {language === 'bn' ? 'সাধারণ জিজ্ঞাসা ও উত্তর' : 'Frequently Asked Questions'}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Everything you need to know about tasks, payments, deposits, and account safety.
        </p>

        {/* Search */}
        <div className="mt-6 relative max-w-md mx-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Accordion */}
      <div className="space-y-4">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
              >
                <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {language === 'bn' ? faq.qBn : faq.qEn}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-emerald-600' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-700 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {language === 'bn' ? faq.aBn : faq.aEn}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
