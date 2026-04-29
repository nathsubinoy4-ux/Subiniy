import { safeFetch } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Loader2, ExternalLink, AlertCircle, Coins } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface AdlexyOffer {
  id: string;
  name: string;
  description: string;
  image: string;
  payout: number;
  url: string;
  instructions?: string;
}

export function AdlexyWall() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<AdlexyOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await safeFetch(`/api/fetch-adlexy?userId=${user.uid}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch offers');
        }

        const data = await response.json();
        
        // Adlexy can return a success object with data array, or just an array
        let offersList = [];
        if (Array.isArray(data)) {
          offersList = data;
        } else if (data.data && Array.isArray(data.data)) {
          offersList = data.data;
        } else if (data.offers && Array.isArray(data.offers)) {
          offersList = data.offers;
        }

        if (offersList.length > 0 || data.success || data.status === 'success') {
          setOffers(offersList);
        } else {
          setError('The offerwall is currently unavailable or returned an invalid format.');
        }
      } catch (err: any) {
        console.error('Adlexy Fetch Error:', err);
        setError(err.message || 'Unable to load offers at this time.');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-zinc-500 font-medium animate-pulse tracking-tight text-sm uppercase font-black opacity-50">Syncing Adlexy offers...</p>
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
          className="border-white/10 text-white hover:bg-white/5 h-12 px-8 rounded-xl font-bold"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border border-white/5">
          <Coins className="w-8 h-8 text-zinc-700" />
        </div>
        <p className="text-zinc-500 font-medium tracking-tight">No offers available in your region right now.</p>
        <p className="text-xs text-zinc-600 max-w-[200px]">Check back later or try a different offerwall.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-max gap-6">
        {offers.map((offer, index) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
            className={cn(
              "group relative flex flex-col justify-between overflow-hidden p-6 transition-all duration-500",
              // Bento Grid spanning logic
              index % 6 === 0 ? "md:col-span-2 md:row-span-1" : "col-span-1 row-span-1",
              // Glassmorphism
              "bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl",
              "hover:bg-white/10 hover:border-indigo-500/30 hover:shadow-indigo-500/10"
            )}
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />

            <div className="space-y-5 relative z-10">
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black/40 border border-white/10 p-1 flex-shrink-0 shadow-2xl">
                  <img 
                    src={offer.image} 
                    alt={offer.name}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${offer.name}`;
                    }}
                  />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-500/20">
                    ADLEXY
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className={cn(
                  "font-black text-white leading-tight transition-colors group-hover:text-indigo-400",
                  index % 6 === 0 ? "text-2xl" : "text-lg line-clamp-1"
                )}>
                  {offer.name}
                </h3>
                <p className={cn(
                  "text-zinc-400 font-medium leading-relaxed",
                  index % 6 === 0 ? "text-sm line-clamp-3" : "text-[11px] line-clamp-2"
                )}>
                  {offer.description || offer.instructions}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4 relative z-10">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                    <Coins className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-white tabular-nums leading-none">
                      {offer.payout}
                    </span>
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">Reward Coins</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => {
                  window.open(offer.url, '_blank', 'noopener,noreferrer');
                  toast.success(`Redirecting to ${offer.name}...`);
                }}
                className={cn(
                  "w-full bg-white text-black hover:bg-indigo-500 hover:text-white font-black h-14 rounded-2xl transition-all shadow-xl group/btn",
                  "border-none relative overflow-hidden"
                )}
              >
                <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] relative z-10 group-hover:text-white transition-colors">
                  Earn Reward
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
