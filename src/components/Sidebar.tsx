import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Trophy, 
  User, 
  LogOut, 
  Wallet,
  Zap,
  ChevronRight,
  MessageSquare,
  Gift,
  Users,
  LifeBuoy,
  X,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { useCurrency } from '../context/CurrencyContext';

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user } = useAuth();
  const { convertBalance } = useCurrency();
  const sections = [
    {
      label: 'Main',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
      ]
    },
    {
      label: 'Earn',
      items: [
        { icon: Zap, label: 'Offerwalls', path: '/offerwalls' },
        { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
        { icon: Users, label: 'Referrals', path: '/referrals' },
      ]
    },
    {
      label: 'Rewards',
      items: [
        { icon: Wallet, label: 'Cash Out', path: '/shop' },
        { icon: Sparkles, label: 'Bonus', path: '/rewards' },
      ]
    },
    {
      label: 'Other',
      items: [
        { icon: MessageSquare, label: 'Chat', path: '/chat' },
        { icon: LifeBuoy, label: 'Support', path: '/support' },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full bg-[#121824]">
      {/* Scrollable Middle */}
      <nav className="flex-1 overflow-y-auto hide-scrollbar p-3 space-y-6 mt-2">
        {sections.map((section) => (
          <div key={section.label} className="space-y-1">
            <h3 className="px-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">
              {section.label}
            </h3>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-2.5 transition-all duration-200 group relative",
                  isActive 
                    ? "text-emerald-500 font-bold" 
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn(
                      "w-5 h-5 transition-colors shrink-0",
                      isActive ? "text-emerald-500" : "group-hover:text-emerald-500"
                    )} />
                    <span className="flex-1 text-sm">{item.label}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="sidebar-active-pill"
                        className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Fixed Profile Box (Bottom) */}
      <div className="flex-shrink-0 w-full bg-[#0d121d] border-t border-white/5 p-4">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-500/30 shrink-0">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-black text-sm uppercase">
                  {(user?.displayName || 'U').charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-white truncate">{user?.displayName || 'Anonymous'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-black text-emerald-500">{convertBalance(user?.balance || 0)}</span>
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
