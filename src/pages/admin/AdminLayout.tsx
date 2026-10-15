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
  Trash2,
  ShieldAlert,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminOverview } from './AdminOverview';
import { AdminUsers } from './AdminUsers';
import { AdminJobs } from './AdminJobs';
import { AdminCategories } from './AdminCategories';
import { AdminDeposits } from './AdminDeposits';
import { AdminWithdrawals } from './AdminWithdrawals';
import { AdminContacts } from './AdminContacts';
import { AdminSettings } from './AdminSettings';
import { AdminAudit } from './AdminAudit';
import { AdminRecycleBin } from './AdminRecycleBin';
import { AdminSecurity } from './AdminSecurity';

export type AdminTab =
  | 'overview'
  | 'deposits'
  | 'withdrawals'
  | 'jobs'
  | 'users'
  | 'recycle'
  | 'security'
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
  const { isAdmin, currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Hard authorization security check
  const isVerifiedAdmin =
    currentUser &&
    (currentUser.uid === ADMIN_UID ||
      currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
      isAdmin) &&
    currentUser.emailVerified;

  // If not authenticated or email unverified, display dedicated Admin Login page
  if (!isVerifiedAdmin) {
    return <AdminLoginPage onNavigate={onNavigate} onSuccess={() => {}} />;
  }

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'deposits', label: 'Deposits', icon: <ArrowDownLeft className="w-4 h-4" /> },
    { id: 'withdrawals', label: 'Withdrawals', icon: <ArrowUpRight className="w-4 h-4" /> },
    { id: 'jobs', label: 'Job Moderation', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'users', label: 'User Directory', icon: <Users className="w-4 h-4" /> },
    { id: 'recycle', label: 'Recycle Bin', icon: <Trash2 className="w-4 h-4 text-rose-500" /> },
    { id: 'security', label: 'Anti-Abuse Sentinel', icon: <ShieldAlert className="w-4 h-4 text-amber-500" /> },
    { id: 'categories', label: 'Categories', icon: <Layers className="w-4 h-4" /> },
    { id: 'contacts', label: 'Contact Inbox', icon: <Mail className="w-4 h-4" /> },
    { id: 'settings', label: 'Platform & Gateway', icon: <Settings className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Trail', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Admin Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <Logo size="md" showText={false} onClick={() => onNavigate('/')} />
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight truncate">
                Microjob BD — Admin Control Center
              </h1>
              <div className="text-[11px] text-purple-400 font-mono break-all leading-tight">
                Admin: {currentUser?.email} &bull; UID: {ADMIN_UID}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-slate-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </button>
            <button
              onClick={async () => {
                await logout();
                onNavigate('/admins');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-colors cursor-pointer border border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/80'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab View */}
        <div className="min-w-0">
          {activeTab === 'overview' && <AdminOverview onSelectTab={setActiveTab} />}
          {activeTab === 'deposits' && <AdminDeposits />}
          {activeTab === 'withdrawals' && <AdminWithdrawals />}
          {activeTab === 'jobs' && <AdminJobs />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'recycle' && <AdminRecycleBin />}
          {activeTab === 'security' && <AdminSecurity />}
          {activeTab === 'categories' && <AdminCategories />}
          {activeTab === 'contacts' && <AdminContacts />}
          {activeTab === 'settings' && <AdminSettings />}
          {activeTab === 'audit' && <AdminAudit />}
        </div>
      </div>
    </div>
  );
};
