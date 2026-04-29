import React from 'react';
import { Trophy, Wallet, Home, Gift, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BottomNavProps {
  onItemClick: (label: string) => void;
  activeItem?: string;
}

export function BottomNav({ onItemClick, activeItem = 'Home' }: BottomNavProps) {
  const items = [
    { icon: Trophy, label: 'Ranking' },
    { icon: Wallet, label: 'Cash Out' },
    { icon: Home, label: 'Home', isCenter: true },
    { icon: Gift, label: 'Rewards' },
    { icon: MessageSquare, label: 'Chat' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100]">
      {/* Background with Blur */}
      <div className="bg-[#0f1115]/95 backdrop-blur-xl border-t border-white/5 px-2 py-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex items-center justify-between relative h-20">
        {items.map((item) => {
          const isActive = activeItem === item.label || (item.label === 'Ranking' && activeItem === 'Leaderboard');
          
          return (
            <button
              key={item.label}
              onClick={() => onItemClick(item.label)}
              className={cn(
                "flex flex-col items-center justify-center transition-all duration-300 relative z-10",
                item.isCenter 
                  ? "w-16 h-16 -mt-12 bg-emerald-500 rounded-full shadow-[0_8px_20px_rgba(16,185,129,0.4)] text-zinc-950 border-4 border-[#0f1115] active:scale-90" 
                  : "flex-1 h-12 active:scale-95"
              )}
            >
              <item.icon className={cn(
                item.isCenter ? "w-7 h-7" : "w-5 h-5",
                isActive && !item.isCenter ? "text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "text-zinc-500",
                !isActive && !item.isCenter && "group-hover:text-white"
              )} />
              
              {!item.isCenter && (
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest mt-1.5",
                  isActive ? "text-emerald-500" : "text-zinc-500"
                )}>
                  {item.label}
                </span>
              )}

              {/* Active Indicator Dot */}
              {isActive && !item.isCenter && (
                <div className="absolute -bottom-1 w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
              )}
            </button>
          );
        })}

        {/* Center Glow Effect */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 w-20 h-20 bg-emerald-500/20 blur-2xl rounded-full pointer-events-none" />
      </div>
    </nav>
  );
}
