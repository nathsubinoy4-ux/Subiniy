import React, { useState } from 'react';
import { CashoutMethod } from '../../types';
import { cn } from '../../lib/utils';
import { ArrowRight } from 'lucide-react';

interface CashoutCardProps {
  method: CashoutMethod;
  userBalance: number;
  onClick: (method: CashoutMethod) => void;
}

export function CashoutCard({ method, userBalance, onClick }: CashoutCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate dynamic progress mapped strictly between 0 and 100%
  const progressPercentage = Math.min((userBalance / method.minPayout) * 100, 100);
  const isUnlocked = userBalance >= method.minPayout;

  return (
    <button
      onClick={() => {
        if (isUnlocked) {
          onClick(method);
        }
      }}
      disabled={!isUnlocked}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative flex flex-col items-center justify-center p-6 text-center rounded-3xl bg-[#121824] transition-all duration-300 w-full",
        isUnlocked ? "hover:-translate-y-1 cursor-pointer" : "opacity-80 cursor-not-allowed"
      )}
      style={{
        border: `1px solid ${isHovered && isUnlocked || isUnlocked ? method.brandColor : '#1e293b'}`,
        boxShadow: isHovered && isUnlocked || isUnlocked ? `0 0 20px ${method.brandColor}30` : 'none',
      }}
    >
      {/* Top Section Layout matching EarnPlay: Top-Left=Logo, Top-Right=Arrow */}
      <div className="w-full flex justify-between items-start mb-4">
        {/* Container for Logo & Blurred Glow */}
        <div className="relative flex items-center justify-center">
          {/* Blurred brand drop-shadow behind the logo */}
          <div 
            className="absolute inset-0 blur-xl opacity-60 rounded-full" 
            style={{ backgroundColor: method.brandColor }}
          />
          {/* Actual Logo Array */}
          <div className={cn(
            "relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center border border-white/5",
            method.name === 'PayPal' ? 'bg-white' : 'bg-[#161d2d]'
          )}>
            <img 
              src={method.logoUrl} 
              alt={method.name} 
              className={cn("object-contain", method.name === 'PayPal' ? "w-8 h-8 md:w-10 md:h-10" : "w-6 h-6 md:w-8 md:h-8")} 
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Unlock Arrow Indicator */}
        <div 
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500",
            isUnlocked 
              ? "bg-[#161d2d] text-white border border-white/10 shadow-lg" 
              : "bg-[#161d2d]/40 text-slate-600 border border-transparent"
          )}
          style={{
            boxShadow: isUnlocked ? `0 0 15px ${method.brandColor}40` : 'none',
            color: isUnlocked ? method.brandColor : undefined
          }}
        >
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Text Info */}
      <div className="w-full flex flex-col items-start text-left gap-1.5">
        <h3 className="text-base md:text-lg font-bold text-white tracking-wide">{method.name}</h3>
        <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">
          Min: {method.minPayout.toLocaleString()} COINS
        </p>
      </div>

      {/* Dynamic Progress Bar */}
      <div className="w-full mt-6">
        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
          <span>Progress</span>
          <span style={{ color: isUnlocked ? method.brandColor : undefined }}>
            {Math.floor(progressPercentage)}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-[#161d2d] rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out" 
            style={{ 
              width: `${progressPercentage}%`, 
              backgroundColor: isUnlocked ? method.brandColor : '#475569' 
            }}
          />
        </div>
      </div>
    </button>
  );
}
