import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageContext, translations, Language } from './lib/i18n';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { EmailVerificationBanner } from './components/common/EmailVerificationBanner';
import { HomePage } from './pages/HomePage';
import { BrowseJobsPage } from './pages/BrowseJobsPage';
import { JobDetailsView } from './pages/freelancer/JobDetailsView';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { ContactUsPage } from './pages/ContactUsPage';
import { FaqPage } from './pages/FaqPage';
import { PolicyPage } from './pages/PolicyPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { FreelancerDashboard } from './pages/freelancer/FreelancerDashboard';
import { MySubmissions } from './pages/freelancer/MySubmissions';
import { WithdrawalPage } from './pages/freelancer/WithdrawalPage';
import { ClientDashboard } from './pages/client/ClientDashboard';
import { DepositPage } from './pages/client/DepositPage';
import { PostJobPage } from './pages/client/PostJobPage';
import { ManageJobsPage } from './pages/client/ManageJobsPage';
import { TransactionHistoryPage } from './pages/shared/TransactionHistoryPage';
import { ProfilePage } from './pages/shared/ProfilePage';
import { JobChatModal } from './pages/shared/JobChatModal';
import { AdminLayout } from './pages/admin/AdminLayout';
import { getPlatformSettings } from './services/db';
import { PlatformSettings } from './types';
import { BellRing, AlertTriangle } from 'lucide-react';

const getNormalizedPath = (pathname: string): string => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  let p = pathname;
  if (base && p.startsWith(base)) {
    p = p.slice(base.length);
  }
  if (!p.startsWith('/')) {
    p = '/' + p;
  }
  if (p.length > 1 && p.endsWith('/')) {
    p = p.slice(0, -1);
  }
  return p || '/';
};

function MainRouter() {
  const { currentUser, activeRole, loading } = useAuth();
  const [route, setRoute] = useState<string>(() => getNormalizedPath(window.location.pathname));
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Chat modal state
  const [chatInfo, setChatInfo] = useState<{
    jobId: string;
    clientId: string;
    freelancerId?: string;
    jobTitle: string;
  } | null>(null);

  // Platform announcement settings
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  useEffect(() => {
    getPlatformSettings().then(setSettings);

    const handlePopState = () => {
      setRoute(getNormalizedPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    // Parse query params if any
    const [path, query] = to.split('?');
    if (query) {
      const params = new URLSearchParams(query);
      if (params.get('category')) setSelectedCategory(params.get('category')!);
      if (params.get('q')) setSearchQuery(params.get('q')!);
    } else {
      setSelectedCategory('all');
      setSearchQuery('');
    }

    const normPath = getNormalizedPath(path);
    setRoute(normPath);

    // Build the full path respecting Vite base path (e.g. /microjob-bd/admins)
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    const fullPath = `${base}${normPath}${query ? `?${query}` : ''}`;
    window.history.pushState({}, '', fullPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenChat = (
    jobId: string,
    otherPartyId: string,
    jobTitle: string,
    isFreelancerRecipient = false
  ) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setChatInfo({
      jobId,
      clientId: isFreelancerRecipient ? currentUser.uid : otherPartyId,
      freelancerId: isFreelancerRecipient ? otherPartyId : currentUser.uid,
      jobTitle,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-500 tracking-wider">
            Loading Microjob BD...
          </span>
        </div>
      </div>
    );
  }

  // Render current page
  const renderPage = () => {
    // If a job detail is opened
    if (selectedJobId) {
      return (
        <JobDetailsView
          jobId={selectedJobId}
          onBack={() => setSelectedJobId(null)}
          onOpenChat={(jId, cId, title) => handleOpenChat(jId, cId, title)}
          onViewSubmissions={() => {
            setSelectedJobId(null);
            navigate('/freelancer/submissions');
          }}
        />
      );
    }

    if (route === '/' || route === '/home') {
      return (
        <HomePage
          onNavigate={navigate}
          onSelectJob={(id) => {
            setSelectedJobId(id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      );
    }

    if (route === '/jobs') {
      return (
        <BrowseJobsPage
          initialCategory={selectedCategory}
          initialQuery={searchQuery}
          onSelectJob={(id) => {
            setSelectedJobId(id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      );
    }

    if (route === '/how-it-works') {
      return <HowItWorksPage onNavigate={navigate} />;
    }

    if (route === '/categories') {
      return <CategoriesPage onNavigate={navigate} />;
    }

    if (route === '/about') {
      return <AboutUsPage />;
    }

    if (route === '/contact') {
      return <ContactUsPage />;
    }

    if (route === '/faq') {
      return <FaqPage />;
    }

    if (route.startsWith('/policy/')) {
      const key = route.replace('/policy/', '');
      return <PolicyPage policyKey={key} onNavigate={navigate} />;
    }

    if (route === '/login') {
      return (
        <LoginPage
          onNavigate={navigate}
          onSuccess={() => {
            navigate(activeRole === 'client' ? '/client/dashboard' : '/freelancer/dashboard');
          }}
        />
      );
    }

    if (route === '/register') {
      return (
        <RegisterPage
          onNavigate={navigate}
          onSuccess={() => {
            navigate(activeRole === 'client' ? '/client/dashboard' : '/freelancer/dashboard');
          }}
        />
      );
    }

    // Protected: Freelancer Routes
    if (route === '/freelancer/dashboard') {
      return (
        <FreelancerDashboard
          onNavigate={navigate}
          onSelectJob={(id) => setSelectedJobId(id)}
        />
      );
    }

    if (route === '/freelancer/submissions') {
      return (
        <MySubmissions
          onOpenChat={(jId, cId, title) => handleOpenChat(jId, cId, title)}
          onNavigate={navigate}
        />
      );
    }

    if (route === '/freelancer/withdrawals') {
      return <WithdrawalPage />;
    }

    // Protected: Client Routes
    if (route === '/client/dashboard') {
      return (
        <ClientDashboard
          onNavigate={navigate}
          onManageJobSubmissions={(id) => {
            navigate(`/client/manage-jobs?job=${id}`);
          }}
        />
      );
    }

    if (route === '/client/deposits') {
      return <DepositPage />;
    }

    if (route === '/client/post-job') {
      return (
        <PostJobPage
          onNavigate={navigate}
          onJobCreated={(id) => navigate('/client/manage-jobs')}
        />
      );
    }

    if (route === '/client/manage-jobs') {
      const urlParams = new URLSearchParams(window.location.search);
      const jId = urlParams.get('job');
      return (
        <ManageJobsPage
          selectedJobId={jId}
          onNavigate={navigate}
          onOpenChat={(jId, fId, title) => handleOpenChat(jId, fId, title, true)}
        />
      );
    }

    // Protected: Shared Account Routes
    if (route === '/profile') {
      return <ProfilePage />;
    }

    if (route === '/transactions') {
      return <TransactionHistoryPage />;
    }

    // Protected: Admin Panel - exact "/admins" route (also supports "/admin")
    if (route === '/admins' || route === '/admin') {
      return <AdminLayout onNavigate={navigate} />;
    }

    // 404 Fallback
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <h2 className="text-6xl font-black text-slate-300 dark:text-slate-700">404</h2>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Page Not Found</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          The requested marketplace route does not exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer shadow-md"
        >
          Return to Home
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans selection:bg-emerald-500 selection:text-white">
      {/* Platform Global Announcement Banner if active */}
      {settings?.announcementEn && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2 shadow-xs">
          <BellRing className="w-3.5 h-3.5 shrink-0 animate-pulse" />
          <span>{settings.announcementEn}</span>
        </div>
      )}

      {/* Email Verification Banner */}
      <EmailVerificationBanner />

      {/* Navigation Bar */}
      <Navbar onNavigate={navigate} currentRoute={route} />

      {/* Main Content Area */}
      <main className="flex-1">{renderPage()}</main>

      {/* Footer */}
      <Footer onNavigate={navigate} />

      {/* Text-Only Job Chat Modal */}
      {chatInfo && (
        <JobChatModal
          jobId={chatInfo.jobId}
          clientId={chatInfo.clientId}
          freelancerId={chatInfo.freelancerId}
          jobTitle={chatInfo.jobTitle}
          onClose={() => setChatInfo(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('microjob_lang');
    return saved === 'bn' || saved === 'en' ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem('microjob_lang', lang);
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const dict = translations[language] as Record<string, string>;
    if (dict && dict[key]) {
      return dict[key];
    }
    const fallback = translations.en as Record<string, string>;
    return fallback[key] || key;
  };

  return (
    <ThemeProvider>
      <LanguageContext.Provider value={{ language, setLanguage, t }}>
        <AuthProvider>
          <MainRouter />
        </AuthProvider>
      </LanguageContext.Provider>
    </ThemeProvider>
  );
}
