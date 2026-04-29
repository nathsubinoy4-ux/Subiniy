import { safeFetch } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Loader2, ExternalLink, AlertCircle, Coins } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface AdBlueMediaOffer {
  offer_id: string;
  title: string;
  description: string;
  payout: string;
  url: string;
  image_url?: string;
}

export function AdBlueMediaWall() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<AdBlueMediaOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await safeFetch(`/api/fetch-adbluemedia?userId=${user.uid}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch offers');
        }

        const data = await response.json();
        setOffers(data.offers || []);
      } catch (err) {
        console.error('AdBlueMedia Fetch Error:', err);
        setError('Unable to load offers at this time. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-zinc-500 font-medium animate-pulse">Fetching latest offers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
        <div className="p-3 bg-red-500/10 rounded-full">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-zinc-400 max-w-xs">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="border-white/10 text-white hover:bg-white/5"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
        <p className="text-zinc-500 font-medium">No offers available in your region right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-max gap-6">
        {offers.map((offer, index) => (
          <motion.div
            key={offer.offer_id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
            className={cn(
              "group relative flex flex-col justify-between overflow-hidden p-6 transition-all duration-500",
              // Bento Grid spanning logic - alternate larger cards for visual rhythm
              index % 5 === 0 ? "md:col-span-2 md:row-span-1" : "col-span-1 row-span-1",
              // Glassmorphism Recipe
              "bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl",
              "hover:bg-white/10 hover:border-emerald-500/30 hover:shadow-emerald-500/10"
            )}
          >
            {/* Background Accent Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-700" />

            <div className="space-y-5 relative z-10">
              {offer.image_url && (
                <div className="w-full aspect-video rounded-3xl overflow-hidden bg-black/40 border border-white/10 shadow-inner">
                  <img 
                    src={offer.image_url} 
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/20">
                    ADBLUEMEDIA
                  </span>
                </div>
                <h3 className={cn(
                  "font-black text-white leading-tight transition-colors group-hover:text-emerald-400",
                  index % 5 === 0 ? "text-2xl" : "text-lg line-clamp-2"
                )}>
                  {offer.title}
                </h3>
                <p className={cn(
                  "text-zinc-400 font-medium leading-relaxed",
                  index % 5 === 0 ? "text-sm line-clamp-3" : "text-[11px] line-clamp-2"
                )}>
                  {offer.description}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4 relative z-10">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 shadow-lg">
                    <Coins className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-white tabular-nums leading-none">
                      {offer.payout}
                    </span>
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">Reward Units</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => {
                  window.open(offer.url, '_blank', 'noopener,noreferrer');
                }}
                className={cn(
                  "w-full bg-white text-black hover:bg-emerald-500 hover:text-white font-black h-14 rounded-2xl transition-all shadow-xl group/btn",
                  "border-none relative overflow-hidden"
                )}
              >
                <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] relative z-10">
                  Earn {offer.payout}
                  <ExternalLink className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </div>
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
