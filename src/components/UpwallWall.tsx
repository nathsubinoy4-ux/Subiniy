import { safeFetch } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Loader2, ExternalLink, AlertCircle, Coins } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface UpwallOffer {
  offer_id: string;
  title: string;
  description: string;
  icon: string;
  payout: string;
  link: string;
  conversion: string;
  multi_event?: boolean;
}

export function UpwallWall() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<UpwallOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await safeFetch(`/api/fetch-upwall?userId=${user.uid}`);
        
        // Use helper to handle response parsing safely
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');

        if (!response.ok) {
          if (isJson) {
            const errorData = await response.json();
            console.error('[UPWALL] API 500 Details:', errorData);
            // Include details in the error message if they exist
            const errorMessage = errorData.details 
              ? `${errorData.error}: ${errorData.details}` 
              : (errorData.error || `Server Error: ${response.status}`);
            throw new Error(errorMessage);
          } else {
            const errorText = await response.text();
            console.error('[UPWALL] API Raw Error:', errorText);
            throw new Error(`Upwall Service Unavailable (${response.status})`);
          }
        }

        if (!isJson) {
          const text = await response.text();
          console.error('[UPWALL] Unexpected Non-JSON Response:', text);
          throw new Error('Received invalid data format from server');
        }

        const data = await response.json();
        
        if (data.success || data.offers) {
          // Some versions of the API might return offers directly or wrapped in success
          setOffers(data.offers || []);
        } else {
          console.warn('[UPWALL] API returned success:false or missing offers:', data);
          setError(data.error || 'The offerwall is currently unavailable.');
        }
      } catch (err: any) {
        console.error('UPWALL Component Fetch Error:', err);
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
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="text-zinc-500 font-medium animate-pulse tracking-tight text-sm uppercase font-black opacity-50">Syncing UPWALL offers...</p>
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
      {/* Container is handled by layout with pt-16, but adding another safety check if needed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-max gap-6">
        {offers.map((offer, index) => (
          <motion.div
            key={offer.offer_id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
            className={cn(
              "group relative flex flex-col justify-between overflow-hidden p-6 transition-all duration-500",
              // Bento Grid spanning logic
              index % 7 === 0 ? "md:col-span-2 md:row-span-2" : "col-span-1 row-span-1",
              // Glassmorphism
              "bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl",
              "hover:bg-white/10 hover:border-cyan-500/30 hover:shadow-cyan-500/10"
            )}
          >
            {/* Background Accent Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700" />

            <div className="space-y-5 relative z-10">
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black/40 border border-white/10 p-1 flex-shrink-0 shadow-2xl">
                  <img 
                    src={offer.icon} 
                    alt={offer.title}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${offer.title}`;
                    }}
                  />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[10px] font-black text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-cyan-500/20">
                    NETWORK
                  </span>
                  {offer.multi_event && (
                    <span className="text-[9px] font-black text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg uppercase tracking-wider">
                      Multi-Step
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className={cn(
                  "font-black text-white leading-tight transition-colors group-hover:text-cyan-400",
                  index % 7 === 0 ? "text-2xl" : "text-lg line-clamp-1"
                )}>
                  {offer.title}
                </h3>
                <p className={cn(
                  "text-zinc-400 font-medium leading-relaxed",
                  index % 7 === 0 ? "text-sm line-clamp-3" : "text-[11px] line-clamp-2"
                )}>
                  {offer.description || offer.conversion}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4 relative z-10">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
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
                  window.open(offer.link, '_blank', 'noopener,noreferrer');
                  toast.success(`Redirecting to ${offer.title}...`);
                }}
                className={cn(
                  "w-full bg-white text-black hover:bg-cyan-500 hover:text-white font-black h-14 rounded-2x transition-all shadow-xl group/btn",
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
