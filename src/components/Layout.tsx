import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { BottomNav } from './Landing/BottomNav';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProfilePanel } from './Profile/ProfilePanel';
import { useAuth } from '../hooks/useAuth';
import { GlobalHeader } from './GlobalHeader';
import { LiveActivityTicker } from './LiveActivityTicker';
import { PublicProfileModal } from './Profile/PublicProfileModal';
import { FloatingChat } from './FloatingChat';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  onSignOut?: () => void;
}

export function Layout({ children, onSignOut }: LayoutProps) {
  // Default to true on desktop (md/lg), false on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedPublicUserId, setSelectedPublicUserId] = useState<string | null>(null);
  const [isPublicProfileOpen, setIsPublicProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Sync balance on every navigation
  React.useEffect(() => {
    if (user?.uid && user.uid !== '{userid}') {
      console.log('Navigation Refresh - Triggering Balance Sync');
      window.dispatchEvent(new Event('refresh_balance'));
    }
  }, [location.pathname, user?.uid]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const getActiveItem = () => {
    const path = location.pathname;
    if (path === '/') return 'Home';
    if (path === '/shop') return 'Cash Out';
    if (path === '/rewards') return 'Rewards';
    if (path === '/leaderboard') return 'Ranking';
    if (path === '/chat') return 'Chat';
    return 'Home';
  };

  const isChatPage = location.pathname === '/chat';

  return (
    <div 
      className="min-h-screen bg-[#0a0a0f] flex flex-col relative overflow-x-hidden"
      style={{ '--sidebar-width': isSidebarOpen ? '256px' : '0px' } as React.CSSProperties}
    >
      {/* Global Sophisticated Emerald/Teal Light Fields */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed top-1/4 right-0 w-[400px] h-[400px] bg-teal-500/5 blur-[100px] rounded-full pointer-events-none z-0" />

      {/* Top Fixed Header - Enforced Height 70px per user request */}
      <div className="header-container shadow-2xl shadow-black/50">
        <GlobalHeader 
          onToggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen} 
        />
      </div>

      {/* Collapsible Sidebar - Starts below header (top-[70px]) */}
      <div className={cn(
        "fixed left-0 top-[70px] bottom-0 z-40 bg-[#121824] border-r border-white/5 transition-all duration-300 ease-in-out",
        isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden"
      )}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Area - Strictly starts below header (pt-[70px]) */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 relative z-10 pt-[70px] transition-all duration-300 ease-in-out",
        isSidebarOpen ? "lg:ml-64" : "lg:ml-0"
      )}>
        <div className="mt-0 mb-0">
          <LiveActivityTicker onUserClick={(userId) => {
            console.log("Opening public profile for:", userId);
            setSelectedPublicUserId(userId);
            setIsPublicProfileOpen(true);
          }} />
        </div>

        <main className={cn(
          "flex-1 w-full",
          isChatPage ? "p-0" : "px-4 lg:px-8 pb-4 lg:pb-8 pt-0 max-w-7xl mx-auto"
        )}>
          {children}
        </main>

        {!isChatPage && <Footer />}
      </div>

      {/* Mobile Sidebar Overlay (only for mobile if open) */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth < 1024 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

        {/* Mobile Bottom Nav */}
        {user && (
          <BottomNav 
            activeItem={getActiveItem()}
            onItemClick={(label) => {
              if (label === 'Home') navigate('/');
              if (label === 'Rewards') navigate('/rewards');
              if (label === 'Ranking') navigate('/leaderboard');
              if (label === 'Cash Out') navigate('/shop');
              if (label === 'Chat') navigate('/chat');
            }} 
          />
        )}

      {/* Profile Panel */}
      <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Public Profile Modal */}
      <PublicProfileModal 
        isOpen={isPublicProfileOpen} 
        onClose={() => setIsPublicProfileOpen(false)} 
        userId={selectedPublicUserId} 
      />

      {/* Floating Chat UI */}
      <FloatingChat />
    </div>
  );
}
