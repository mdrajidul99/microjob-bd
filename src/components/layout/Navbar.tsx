import React, { useState, useEffect, useRef } from 'react';
import {
  Briefcase,
  Globe,
  Sun,
  Moon,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  PlusCircle,
  ShieldCheck,
  ArrowRightLeft,
  Wallet as WalletIcon,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../lib/i18n';
import { Logo } from '../common/Logo';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../services/db';
import { PlatformNotification } from '../../types';

interface NavbarProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentRoute }) => {
  const { currentUser, profile, wallet, isAdmin, activeRole, switchActiveRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  useEffect(() => {
    if (!currentUser) return;
    getUserNotifications(currentUser.uid)
      .then(setNotifications)
      .catch((err) => console.warn('Could not load notifications:', err));
  }, [currentUser, currentRoute]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(notifications);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = async (notif: PlatformNotification) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
    }
    setNotificationsOpen(false);
    if (notif.link) {
      onNavigate(notif.link);
    }
  };

  const navLinks = [
    { label: t('nav.home'), route: '/' },
    { label: t('nav.browseJobs'), route: '/jobs' },
    { label: t('nav.howItWorks'), route: '/how-it-works' },
    { label: t('nav.categories'), route: '/categories' },
    { label: t('nav.contact'), route: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Logo size="md" onClick={() => onNavigate('/')} />

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center ml-8 gap-1">
              {navLinks.map((link) => {
                const isActive = currentRoute === link.route;
                return (
                  <button
                    key={link.route}
                    onClick={() => onNavigate(link.route)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Authenticated Controls */}
            {currentUser ? (
              <>
                {/* Active Workspace Pill / Switcher */}
                <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => {
                      switchActiveRole('freelancer');
                      onNavigate('/freelancer/dashboard');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeRole === 'freelancer'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{t('nav.switchFreelancer')}</span>
                  </button>

                  <button
                    onClick={() => {
                      switchActiveRole('client');
                      onNavigate('/client/dashboard');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeRole === 'client'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{t('nav.switchClient')}</span>
                  </button>
                </div>

                {/* Quick Post Job for Client */}
                {activeRole === 'client' && (
                  <button
                    onClick={() => onNavigate('/client/post-job')}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{t('nav.postJob')}</span>
                  </button>
                )}

                {/* Quick Wallet Balance Badge */}
                <button
                  onClick={() =>
                    onNavigate(activeRole === 'client' ? '/client/deposits' : '/freelancer/withdrawals')
                  }
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 cursor-pointer transition-colors"
                  title="View Wallet"
                >
                  <WalletIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {activeRole === 'client'
                      ? `৳${wallet?.clientDepositBalance?.toLocaleString() || 0}`
                      : `৳${wallet?.freelancerEarningsBalance?.toLocaleString() || 0}`}
                  </span>
                </button>

                {/* Admin Badge */}
                {isAdmin && (
                  <button
                    onClick={() => onNavigate('/admins')}
                    className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-600/20 cursor-pointer transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Admin</span>
                  </button>
                )}

                {/* Notification Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Popover */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Notifications ({unreadCount} new)
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${
                                !n.isRead ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                  {language === 'bn' ? n.titleBn : n.titleEn}
                                </p>
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                                {language === 'bn' ? n.messageBn : n.messageEn}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    {profile?.photoURL ? (
                      <img
                        src={profile.photoURL}
                        alt="Avatar"
                        className="w-7 h-7 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                        {profile?.displayName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {profile?.displayName || 'User'}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {currentUser.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigate(
                              activeRole === 'client'
                                ? '/client/dashboard'
                                : '/freelancer/dashboard'
                            );
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2"
                        >
                          <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t('nav.dashboard')}</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigate('/profile');
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2"
                        >
                          <User className="w-3.5 h-3.5 text-sky-600" />
                          <span>Profile Settings</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigate('/transactions');
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2"
                        >
                          <WalletIcon className="w-3.5 h-3.5 text-amber-600" />
                          <span>Transaction Ledger</span>
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onNavigate('/admins');
                            }}
                            className="w-full px-4 py-2 text-left text-xs text-purple-700 dark:text-purple-300 font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                            <span>{t('admin.title')}</span>
                          </button>
                        )}
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-700 pt-1">
                        <button
                          onClick={async () => {
                            setUserDropdownOpen(false);
                            await logout();
                            onNavigate('/');
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>{t('nav.logout')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Logged out buttons
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('/login')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {t('nav.login')}
                </button>
                <button
                  onClick={() => onNavigate('/register')}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  {t('nav.register')}
                </button>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2">
          {currentUser && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-500">Current Workspace:</span>
              <button
                onClick={() => {
                  const target = activeRole === 'freelancer' ? 'client' : 'freelancer';
                  switchActiveRole(target);
                  onNavigate(target === 'client' ? '/client/dashboard' : '/freelancer/dashboard');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>
                  Switch to {activeRole === 'freelancer' ? 'Client' : 'Freelancer'}
                </span>
              </button>
            </div>
          )}

          {navLinks.map((link) => (
            <button
              key={link.route}
              onClick={() => {
                onNavigate(link.route);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {link.label}
            </button>
          ))}

          {currentUser && (
            <>
              <button
                onClick={() => {
                  onNavigate(activeRole === 'client' ? '/client/dashboard' : '/freelancer/dashboard');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              >
                {t('nav.dashboard')}
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    onNavigate('/admins');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                >
                  {t('admin.title')}
                </button>
              )}

              <button
                onClick={async () => {
                  await logout();
                  setMobileMenuOpen(false);
                  onNavigate('/');
                }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                {t('nav.logout')}
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
