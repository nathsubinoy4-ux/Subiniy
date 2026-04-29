import React from 'react';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { Offer } from '../types';
import { OfferCardDark } from './OfferCardDark';
import { cn } from '../lib/utils';

interface OfferSectionProps {
  title: string;
  icon: LucideIcon;
  iconColorClass: string;
  offers: Offer[];
  isFeatured?: boolean;
  onViewAll?: () => void;
}

export function OfferSection({ 
  title, 
  icon: Icon, 
  iconColorClass, 
  offers, 
  isFeatured,
  onViewAll 
}: OfferSectionProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center border",
            iconColorClass
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">{title}</h3>
        </div>
        <button 
          onClick={onViewAll}
          className="text-sm font-bold text-zinc-500 hover:text-brand-500 transition-colors flex items-center gap-1 group"
        >
          View All <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Mobile: Horizontal Scroll | Desktop: Grid */}
      <div className="relative">
        <div className={cn(
          "flex md:grid gap-4 md:gap-6 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 scrollbar-hide",
          isFeatured 
            ? "md:grid-cols-2 lg:grid-cols-3" 
            : "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        )}>
          {offers.map((offer) => (
            <OfferCardDark 
              key={offer.id} 
              offer={offer} 
              isFeatured={isFeatured} 
            />
          ))}
        </div>
        
        {/* Mobile Scroll Indicator Gradient */}
        <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-[#0a0a0b] to-transparent pointer-events-none md:hidden" />
      </div>
    </section>
  );
}
