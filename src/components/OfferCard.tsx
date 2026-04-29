import React from 'react';
import { ArrowRight, Star, Zap, Clock, ShieldCheck, Coins } from 'lucide-react';
import { Offer } from '../types';
import { cn } from '../lib/utils';

interface OfferCardProps {
  offer: Offer;
  onStart?: (offer: Offer) => void;
}

export function OfferCard({ offer, onStart }: OfferCardProps) {
  const categoryColors = {
    Games: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Surveys: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Apps: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Videos: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };

  const difficultyIcons = {
    Easy: Zap,
    Medium: Clock,
    Hard: ShieldCheck,
  };

  const DifficultyIcon = difficultyIcons[offer.difficulty];

  return (
    <div className="bg-[#1b1b22] rounded-[2.5rem] border border-white/5 hover:border-emerald-500/30 transition-all duration-500 group overflow-hidden flex flex-col shadow-2xl hover:shadow-emerald-500/5">
      {/* Image Header */}
      <div className="h-48 relative overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b22] via-transparent to-transparent z-10" />
        <img 
          src={offer.imageUrl} 
          alt={offer.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-6 left-6 z-20">
          <span className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-md",
            categoryColors[offer.category]
          )}>
            {offer.category}
          </span>
        </div>
        <div className="absolute top-6 right-6 z-20">
          <div className="bg-[#111116]/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-2 group-hover:scale-110 transition-transform">
            <Coins className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-black text-white">{offer.reward}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 flex-1 flex flex-col relative">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Available Now</span>
          </div>
          <h4 className="text-xl font-black text-white mb-3 group-hover:text-emerald-400 transition-colors tracking-tight">
            {offer.title}
          </h4>
          <p className="text-sm text-zinc-500 line-clamp-2 mb-6 leading-relaxed font-medium">
            {offer.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
              <DifficultyIcon className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Difficulty</p>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-none">{offer.difficulty}</p>
            </div>
          </div>
          
          <button
            onClick={() => onStart?.(offer)}
            className="relative group/btn"
          >
            <div className="absolute -inset-1 bg-emerald-500/20 rounded-2xl blur-sm opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-2 bg-white text-zinc-950 px-6 py-3 rounded-2xl font-black text-xs hover:bg-emerald-500 hover:text-white transition-all shadow-xl">
              Start
              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
