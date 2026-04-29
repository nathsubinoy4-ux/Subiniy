import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Flame, Star, Users, TrendingUp } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { cn } from '../../lib/utils';

export function LiveStats() {
  const { settings } = useSiteSettings();
  const [totalPaid, setTotalPaid] = useState(38142.25);
  const [coins, setCoins] = useState(268450); // 1000 coins = $1

  // Real-time day logic
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayRaw = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  const currentDayIndex = (todayRaw + 6) % 7; // Convert to Monday-start index (0-6)

  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly increment coins (e.g., 50 to 500 coins)
      const coinIncrement = Math.floor(Math.random() * 450) + 50;
      const dollarIncrement = coinIncrement / 1000;
      
      setCoins(prev => prev + coinIncrement);
      setTotalPaid(prev => prev + dollarIncrement);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(num);
  };

  const todaysEarnings = coins / 1000;

  return (
    <section className="py-12 relative overflow-hidden bg-[#0a0f16]">
      {/* Background Particles Decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-emerald-500/10 blur-xl animate-float-slow"
            style={{
              width: `${Math.random() * 80 + 40}px`,
              height: `${Math.random() * 80 + 40}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${Math.random() * 8 + 8}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          {/* Top Card: Total Paid Out - Slim & Horizontal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative p-[1px] rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,255,136,0.1)] overflow-hidden lg:col-span-1"
          >
            <div className="bg-[#0f172a]/80 backdrop-blur-xl p-6 md:p-8 rounded-[23px] flex flex-col lg:items-start justify-between gap-4 h-full">
              <div className="text-left">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)] flex-shrink-0" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live Feed</span>
                </div>
                <h3 className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Total Paid Out</h3>
                <div className="text-2xl md:text-3xl font-black text-white tracking-tighter tabular-nums">
                  {formatCurrency(totalPaid)}
                </div>
              </div>

              <div className="w-full">
                <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-4 flex flex-col items-start w-full">
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Today's Payout</span>
                  <div className="text-xl font-black text-emerald-500 tabular-nums">
                    +{formatCurrency(todaysEarnings)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom Left: Daily Streak */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group relative p-[1px] rounded-3xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(251,191,36,0.1)] overflow-hidden"
          >
            <div className="bg-[#0f172a]/80 backdrop-blur-xl p-6 md:p-8 rounded-[23px] h-full flex flex-col items-start text-left">
              <div className="flex flex-col items-start gap-3 mb-6 w-full">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <Flame className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-zinc-500 text-[8px] font-black uppercase tracking-widest">Rewards</h3>
                    <p className="text-sm md:text-base font-black text-white uppercase tracking-tight">Daily Streak</p>
                  </div>
                </div>
                <div className="text-xl md:text-2xl font-black text-amber-400">{currentDayIndex + 1} Days</div>
              </div>

              <div className="space-y-3 w-full mt-auto">
                <div className="flex justify-between text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                  <span>Weekly Goal</span>
                  <span className="text-amber-500">{currentDayIndex + 1} / 7</span>
                </div>
                <div className="h-2.5 bg-zinc-900 border border-white/5 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.25)] transition-all duration-1000"
                    style={{ width: `${((currentDayIndex + 1) / 7) * 100}%` }}
                  />
                </div>
                <div className="flex gap-1">
                  {days.map((day, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 gap-1">
                      <div 
                        className={cn(
                          "h-1 w-full rounded-full transition-colors duration-500",
                          i <= currentDayIndex ? "bg-amber-500 shadow-[0_0_5px_rgba(251,191,36,0.3)]" : "bg-white/5"
                        )} 
                      />
                      <span className={cn(
                        "text-[7px] font-black",
                        i <= currentDayIndex ? "text-amber-500" : "text-zinc-700"
                      )}>{day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom Right: Top Offer */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group relative p-[1px] rounded-3xl bg-white/5 border border-white/10 hover:border-brand-500/30 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(16,185,129,0.1)] overflow-hidden"
          >
            <div className="bg-[#0f172a]/80 backdrop-blur-xl p-6 md:p-8 rounded-[23px] h-full flex flex-col items-start text-left">
              <div className="flex flex-col items-start gap-3 mb-6 w-full">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-brand-500" />
                  </div>
                  <div>
                    <h3 className="text-zinc-500 text-[8px] font-black uppercase tracking-widest">Offers</h3>
                    <p className="text-sm md:text-base font-black text-white uppercase tracking-tight">Top Offer</p>
                  </div>
                </div>
                <div className="text-xl md:text-2xl font-black text-emerald-500">$50.00</div>
              </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 w-full mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img 
                        src={settings.topOfferIcon || "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/bc/b2/9c/bcb29cc9-435c-4e27-b14c-1a927cce74f3/AppIcon-0-0-1x_U007emarketing-0-6-0-85-220.png/512x512bb.jpg"} 
                        alt={settings.topOfferName || "Top Offer"} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-black text-[9px] uppercase leading-tight">{settings.topOfferName || "Dice Dream"}</h4>
                      <p className="text-zinc-600 text-[7px] font-bold uppercase tracking-widest">Featured</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-400">
                    <Users className="w-2.5 h-2.5 text-emerald-500" />
                    <span className="text-[9px] font-black">{settings.topOfferCompletions || "1.2K"}</span>
                  </div>
                </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
