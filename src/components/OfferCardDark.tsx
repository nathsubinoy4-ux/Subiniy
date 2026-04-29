import { safeFetch } from '../lib/api';
import React, { useState } from 'react';
import { Smartphone, Apple, Monitor, Star, ArrowRight, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Offer } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface OfferCardDarkProps {
  offer: Offer;
  isFeatured?: boolean;
}

export function OfferCardDark({ offer }: OfferCardDarkProps) {
  const { user, addBalance } = useAuth();
  const navigate = useNavigate();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClick = async () => {
    if (offer.isFuture || isCompleting) return;
    if (!user) {
      navigate('/signup');
      return;
    }

    setIsCompleting(true);
    try {
      // Simulate completion for testing
      await addBalance(offer.reward);

      // record activity
      try {
        await safeFetch('/api/record_activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            username: user.displayName || 'Anonymous',
            userAvatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
            offerName: offer.title,
            reward: offer.reward,
            type: 'offer',
            network: 'Adscend'
          })
        });
      } catch (err) {
        console.error("Failed to record activity:", err);
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to complete offer:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "bg-[#111114] border border-white/5 rounded-[32px] overflow-hidden transition-all duration-500 group flex flex-col shrink-0 cursor-pointer relative",
        !offer.isFuture && "hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]",
        offer.isFuture && "opacity-60 cursor-not-allowed grayscale",
        "w-[180px] md:w-[220px] aspect-[3/4]"
      )}
    >
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-emerald-500/90 backdrop-blur-sm flex flex-col items-center justify-center text-zinc-950 p-4 text-center"
          >
            <Coins className="w-8 h-8 mb-2" />
            <p className="text-xs font-black uppercase tracking-widest">+{offer.reward} Coins</p>
            <p className="text-[10px] font-bold">Earned!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={offer.imageUrl} 
          alt={offer.title} 
          className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 p-5 h-full flex flex-col justify-between">
        {/* Top Section: Category & Device */}
        <div className="flex items-start justify-between">
          <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-emerald-400">
            {offer.category}
          </div>
          <div className="flex gap-1">
            <Smartphone className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
            <Apple className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
          </div>
        </div>

        {/* Bottom Section: Info & Action */}
        <div className="space-y-3">
          <div>
            <h4 className="text-sm md:text-base font-black text-white mb-1 line-clamp-1 group-hover:text-emerald-400 transition-colors">
              {offer.title}
            </h4>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              </div>
              <span className="text-sm font-black text-white tracking-tight">{offer.reward}</span>
            </div>
          </div>

          <button 
            disabled={offer.isFuture}
            className={cn(
              "w-full py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
              offer.isFuture 
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
            )}
          >
            {offer.category === 'Surveys' ? 'Start' : 'Play'}
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
