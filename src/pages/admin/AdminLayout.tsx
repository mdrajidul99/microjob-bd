import React, { useState } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Briefcase,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Mail,
  Settings,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';
import { AdminOverview } from './AdminOverview';
import { AdminUsers } from './AdminUsers';
import { AdminJobs } from './AdminJobs';
import { AdminCategories } from './AdminCategories';
import { AdminDeposits } from './AdminDeposits';
import { AdminWithdrawals } from './AdminWithdrawals';
import { AdminContacts } from './AdminContacts';
import { AdminSettings } from './AdminSettings';
import { AdminAudit } from './AdminAudit';

export type AdminTab =
  | 'overview'
  | 'deposits'
  | 'withdrawals'
  | 'jobs'
  | 'users'
  | 'categories'
  | 'contacts'
  | 'settings'
  | 'audit';

interface AdminLayoutProps {
  onNavigate: (route: string) => void;
}

const ADMIN_UID = 'YG8glv1gg4XXYUkSUMZtyBcT1fu2';
const ADMIN_EMAIL = 'mrs.engineers.bd26@gmail.com';

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onNavigate }) => {
  const { isAdmin, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Hard authorization security check
  const isVerifiedAdmin =
    currentUser &&
    (currentUser.uid === ADMIN_UID ||
      currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
      isAdmin);

  if (!isVerifiedAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
        <Logo size="lg" showText={false} className="mx-auto mb-2" />
        <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-xs">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          Access Restricted: Administrator Privileges Required
        </h2>
        <div className="bg-slate-100 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
          <div className="font-semibold text-slate-700 dark:text-slate-300">
            Designated Platform Administrator:
          </div>
          <div className="text-slate-500 font-mono text-[11px] break-all">
            Email: {ADMIN_EMAIL}
            <br />
            UID: {ADMIN_UID}
          </div>
          {currentUser && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 font-medium">
              Currently signed in as: {currentUser.email} (UID: {currentUser.uid}) — Not authorized.
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          {!currentUser ? (
            <button
              onClick={() => onNavigate('/login')}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Sign In as Administrator
            </button>
          ) : (
            <button
              onClick={() => onNavigate('/login')}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors shadow-sm"
            >
              Switch Account
            </button>
          )}
          <button
            onClick={() => onNavigate('/')}
            className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'deposits', label: 'Deposit Requests', icon: <ArrowDownLeft className="w-4 h-4" /> },
    { id: 'withdrawals', label: 'Withdrawal Queue', icon: <ArrowUpRight className="w-4 h-4" /> },
    { id: 'jobs', label: 'Job Moderation', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'users', label: 'User Directory', icon: <Users className="w-4 h-4" /> },
    { id: 'categories', label: 'Categories', icon: <Layers className="w-4 h-4" /> },
    { id: 'contacts', label: 'Contact Inbox', icon: <Mail className="w-4 h-4" /> },
    { id: 'settings', label: 'Platform & Gateway', icon: <Settings className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Trail', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Logo size="md" showText={false} onClick={() => onNavigate('/')} />
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Microjob BD — Admin Control Center
            </h1>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold block">
              Authenticated Admin: {currentUser?.email} (UID: {ADMIN_UID})
            </span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/')}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
        >
          View Public Marketplace →
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      <div>
        {activeTab === 'overview' && <AdminOverview onSelectTab={setActiveTab} />}
        {activeTab === 'deposits' && <AdminDeposits />}
        {activeTab === 'withdrawals' && <AdminWithdrawals />}
        {activeTab === 'jobs' && <AdminJobs />}
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'categories' && <AdminCategories />}
        {activeTab === 'contacts' && <AdminContacts />}
        {activeTab === 'settings' && <AdminSettings />}
        {activeTab === 'audit' && <AdminAudit />}
      </div>
    </div>
  );
};
