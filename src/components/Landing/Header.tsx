import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Sparkles, User, Users, LogOut, ChevronRight, DollarSign } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCurrency } from '../../context/CurrencyContext';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Header() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isUsdMode, toggleUsdMode, convertBalance } = useCurrency();
  const { settings } = useSiteSettings();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [dropdownAvatarError, setDropdownAvatarError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignUpClick = (e: React.MouseEvent) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById('signup-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSignInClick = (e: React.MouseEvent) => {
    // keeping standard navigation for sign in
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-white/5 flex items-center">
      <div className="px-4 py-4 md:pt-5 md:pb-4 flex items-center justify-between relative max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="relative cursor-pointer flex items-center h-10" onClick={() => navigate('/')}>
            {settings.headerLogo && (
              <img 
                src={settings.headerLogo} 
                alt="Site Logo" 
                className="h-full w-auto object-contain" 
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {user ? (
            <>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5 min-w-[80px] justify-center">
                  {isUsdMode ? (
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                  <span className="text-base font-black text-white">{convertBalance(user.balance)}</span>
                </div>
              </div>

              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-8 h-8 rounded-full border-2 border-emerald-500/30 p-0.5 bg-black hover:border-emerald-500 transition-all overflow-hidden"
                >
                  {!avatarError ? (
                    <img 
                      src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName || 'User'}`} 
                      alt={user.displayName || ''} 
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-emerald-500 flex items-center justify-center text-black font-black text-sm">
                      {user.displayName?.charAt(0) || 'S'}
                    </div>
                  )}
                </button>
{/* ... rest of dropdown logic ... */}

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-14 right-0 z-50 w-64 bg-[#121418] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                    >
                      {/* Dropdown Content */}
                      <div className="p-6 flex flex-col items-center border-b border-white/5">
                        <div className="relative mb-4">
                          <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 p-1 bg-black overflow-hidden">
                            {!dropdownAvatarError ? (
                              <img 
                                src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName || 'User'}`} 
                                alt={user.displayName || ''} 
                                className="w-full h-full rounded-full object-cover"
                                referrerPolicy="no-referrer"
                                onError={() => setDropdownAvatarError(true)}
                              />
                            ) : (
                              <div className="w-full h-full rounded-full bg-emerald-500 flex items-center justify-center text-black font-black text-2xl">
                                {user.displayName?.charAt(0) || 'S'}
                              </div>
                            )}
                          </div>
                          <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#121418]" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-4">{user.displayName || 'User'}</h3>
                        
                        {/* Level Progress */}
                        <div className="w-full space-y-2">
                          <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                            <span>lvl 1</span>
                            <span>lvl 2</span>
                          </div>
                          <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-emerald-500 w-[45%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <button 
                          onClick={() => { navigate('/profile'); setIsProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-emerald-500 hover:bg-white/5 transition-all group"
                        >
                          <User className="w-5 h-5" />
                          <span className="text-sm font-bold">Profile</span>
                          <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <button 
                          onClick={() => { navigate('/referrals'); setIsProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-emerald-500 hover:bg-white/5 transition-all group"
                        >
                          <Users className="w-5 h-5" />
                          <span className="text-sm font-bold">Affiliates</span>
                          <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <button 
                          onClick={() => { signOut(); setIsProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/5 transition-all group"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="text-sm font-bold">Logout</span>
                        </button>
                      </div>

                      {/* Footer Toggle */}
                      <div className="p-4 bg-black/20 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Show USD</span>
                        <button 
                          onClick={toggleUsdMode}
                          className={cn(
                            "w-10 h-5 rounded-full relative transition-colors duration-300",
                            isUsdMode ? "bg-emerald-500" : "bg-zinc-800"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300",
                            isUsdMode ? "left-6" : "left-1"
                          )} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                to="/signin"
                onClick={handleSignInClick}
                className="text-xs font-black text-zinc-400 hover:text-white uppercase tracking-[0.15em] transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/signup"
                onClick={handleSignUpClick}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-black uppercase tracking-[0.15em] rounded-xl transition-all shadow-lg shadow-emerald-500/10 active:scale-95 whitespace-nowrap"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
