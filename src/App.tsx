/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Layout } from './components/Layout';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthGuard } from './components/AuthGuard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SEOUpdater } from './components/SEOUpdater';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from './components/ui/sonner';
import { useSiteSettings } from './hooks/useSiteSettings';
import { Ban } from 'lucide-react';

// Lazy load heavy components
const Dashboard = lazy(() => import('./components/Dashboard'));
const Rewards = lazy(() => import('./components/Rewards').then(m => ({ default: m.Rewards })));
const Leaderboard = lazy(() => import('./components/Leaderboard').then(m => ({ default: m.Leaderboard })));
const Profile = lazy(() => import('./components/Profile'));
const ChatPage = lazy(() => import('./components/ChatPage').then(m => ({ default: m.ChatPage })));
const ShopPage = lazy(() => import('./components/Shop/ShopPage').then(m => ({ default: m.ShopPage })));
const Referrals = lazy(() => import('./components/Referrals').then(m => ({ default: m.Referrals })));
const Support = lazy(() => import('./components/Support').then(m => ({ default: m.Support })));
const LandingPage = lazy(() => import('./components/Landing/LandingPage').then(m => ({ default: m.LandingPage })));

// Pages
const SignInPage = lazy(() => import('./pages/SignInPage').then(m => ({ default: m.SignInPage })));
const SignUpPage = lazy(() => import('./pages/SignUpPage').then(m => ({ default: m.SignUpPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const FAQPage = lazy(() => import('./pages/FAQPage').then(m => ({ default: m.FAQPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));

// Admin
const AdminLayout = lazy(() => import('./components/Admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminOfferwalls = lazy(() => import('./components/Admin/AdminOfferwalls').then(m => ({ default: m.AdminOfferwalls })));
const AdminUsers = lazy(() => import('./components/Admin/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminWithdrawals = lazy(() => import('./components/Admin/AdminWithdrawals').then(m => ({ default: m.AdminWithdrawals })));
const AdminSettings = lazy(() => import('./components/Admin/AdminSettings').then(m => ({ default: m.AdminSettings })));
const AdminAppearance = lazy(() => import('./components/Admin/AdminAppearance').then(m => ({ default: m.AdminAppearance })));
const AdminPromoCodes = lazy(() => import('./components/Admin/AdminPromoCodes').then(m => ({ default: m.AdminPromoCodes })));
const AdminAuthGuard = lazy(() => import('./components/Admin/AdminAuthGuard').then(m => ({ default: m.AdminAuthGuard })));

// Loading placeholder for Suspense
const RouteLoader = () => {
  const { settings, error, retry } = useSiteSettings();
  
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-[#0a0a0b] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ 
            scale: [0.9, 1.05, 1],
            opacity: 1,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative px-8"
        >
          {settings.headerLogo ? (
            <motion.img 
              src={settings.headerLogo} 
              alt="Logo" 
              className="h-16 md:h-20 w-auto object-contain"
              animate={{
                filter: ["brightness(1) contrast(1)", "brightness(1.2) contrast(1.1)", "brightness(1) contrast(1)"],
                scale: [1, 1.03, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl" />
              <div className="w-32 h-6 bg-white/10 rounded-lg animate-pulse" />
            </div>
          )}
        </motion.div>

        {error ? (
          <div className="flex flex-col items-center gap-4">
            <span className="text-red-400 font-bold px-4 py-2 bg-red-500/10 rounded border border-red-500/20">
              Connection Failed
            </span>
            <button 
              onClick={retry}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 text-sm tracking-wide uppercase"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-64">
            <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden relative">
              <motion.div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600"
                initial={{ left: "-100%", width: "50%" }}
                animate={{ left: "100%" }}
                transition={{ 
                  duration: 1.0, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 bg-emerald-500 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
              <span className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.4em]">
                Initializing Experience
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function AppContent() {
  const { user, signOut, loading: authLoading } = useAuth();
  const [minLoadingDone, setMinLoadingDone] = React.useState(false);
  
  // Capture referral code and handle minimum loading time
  React.useEffect(() => {
    // 1s minimum display time
    const timer = setTimeout(() => setMinLoadingDone(true), 1000);

    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('referrerUid', ref);
    }

    return () => clearTimeout(timer);
  }, []);

  if (authLoading || !minLoadingDone) {
    return <RouteLoader />;
  }

  if (user?.isBanned) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
          <Ban className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight mb-4 uppercase">Account Restricted</h1>
        <p className="text-zinc-500 font-medium max-w-md mb-8 leading-relaxed">
          Your account has been suspended for violating our terms of service. If you believe this is a mistake, please contact our support team.
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={() => signOut()}
            className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl border border-white/5 transition-all active:scale-95 uppercase tracking-widest text-xs"
          >
            Sign Out
          </button>
          <a 
            href="mailto:support@findejob.com" 
            className="text-emerald-500 font-black uppercase tracking-widest text-[10px] hover:underline"
          >
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Router>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/signin" element={user ? <Navigate to="/" replace /> : <SignInPage />} />
            <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignUpPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              user ? (
                <Layout onSignOut={signOut}>
                  <Dashboard />
                </Layout>
              ) : (
                <LandingPage />
              )
            } />

            <Route path="/chat" element={
              <Layout onSignOut={signOut}>
                <ChatPage />
              </Layout>
            } />

            <Route path="/shop" element={
              <AuthGuard>
                <Layout onSignOut={signOut}>
                  <ShopPage />
                </Layout>
              </AuthGuard>
            } />

            <Route path="/rewards" element={
              <AuthGuard>
                <Layout onSignOut={signOut}>
                  <Rewards />
                </Layout>
              </AuthGuard>
            } />

            <Route path="/leaderboard" element={
              <AuthGuard>
                <Layout onSignOut={signOut}>
                  <Leaderboard />
                </Layout>
              </AuthGuard>
            } />

            <Route path="/referrals" element={
              <AuthGuard>
                <Layout onSignOut={signOut}>
                  <Referrals />
                </Layout>
              </AuthGuard>
            } />

            <Route path="/support" element={
              <AuthGuard>
                <Layout onSignOut={signOut}>
                  <Support />
                </Layout>
              </AuthGuard>
            } />

            <Route path="/profile" element={
              <AuthGuard>
                <Layout onSignOut={signOut}>
                  <Profile />
                </Layout>
              </AuthGuard>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminAuthGuard>
                <AdminLayout />
              </AdminAuthGuard>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="withdrawals" element={<AdminWithdrawals />} />
              <Route path="offerwalls" element={<AdminOfferwalls />} />
              <Route path="appearance" element={<AdminAppearance />} />
              <Route path="promocodes" element={<AdminPromoCodes />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <AuthProvider>
          <CurrencyProvider>
            <SEOUpdater />
            <AppContent />
            <Toaster position="top-right" expand={false} richColors />
          </CurrencyProvider>
        </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
