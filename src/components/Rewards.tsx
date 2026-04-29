import { safeFetch } from '../lib/api';
import React, { useState, useEffect, useCallback } from 'react';
import { Ticket, Trophy, Coins, Zap, UserPlus, Gift, History, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';

export function Rewards() {
  const [promoCode, setPromoCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isClaimed, setIsClaimed] = useState(true);
  const { user, addBalance, refreshUserData } = useAuth();

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const lastClaimDate = localStorage.getItem(`dailyBonusClaimed_${user.uid}`);
    if (lastClaimDate === today) {
      setIsClaimed(true);
    } else {
      setIsClaimed(false);
    }
  }, [user]);

  const QUESTS = [
    {
      id: 'q1',
      title: 'Earn 5,000 Coins',
      description: 'Complete offers and surveys to reach 5,000 total coins earned.',
      progress: 65,
      reward: 500,
      icon: Coins,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500',
      lightBg: 'bg-yellow-500/10'
    },
    {
      id: 'q2',
      title: 'Complete 10 Offers',
      description: 'Successfully complete any 10 offers from our partners.',
      progress: 20,
      reward: 1000,
      icon: Zap,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500',
      lightBg: 'bg-emerald-500/10'
    },
    {
      id: 'q3',
      title: 'Invite 5 Friends',
      description: 'Get 5 friends to sign up using your referral link.',
      progress: 80,
      reward: 2000,
      icon: UserPlus,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500',
      lightBg: 'bg-blue-500/10'
    },
    {
      id: 'q4',
      title: 'Reach Level 10',
      description: 'Keep earning consistently to increase your account level.',
      progress: 45,
      reward: 5000,
      icon: Trophy,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500',
      lightBg: 'bg-purple-500/10'
    }
  ];

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeInput = promoCode.trim().toUpperCase();
    if (!codeInput || !user) return;
    
    setIsRedeeming(true);
    try {
      const res = await safeFetch('/api/redeem_promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          code: codeInput
        })
      });
      
      const data = await res.json();
      if (data.status === 'success') {
        toast.success(`Successfully claimed ${data.reward.toLocaleString()} coins!`);
        setPromoCode('');
        await refreshUserData();
        window.dispatchEvent(new Event('refresh_balance'));
        window.dispatchEvent(new Event('refresh_live_feed'));
      } else {
        toast.error(data.message || 'Failed to redeem code.');
      }
    } catch (error) {
      console.error("Error redeeming code:", error);
      toast.error("Failed to redeem code. Please try again.");
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleClaimDaily = async () => {
    if (isClaimed || !user) return;
    
    // 1. Strict Validation: Ensure UID is valid and not a placeholder
    const userId = user?.uid;
    if (!userId || userId === '{userId}' || userId === '{userid}' || userId === 'null' || userId === 'undefined') {
      console.error('CRITICAL: Invalid UID detected before Daily Bonus claim:', userId);
      toast.error('Session error: Invalid User ID. Please log out and log back in.');
      return;
    }
    
    // UI Feedback: Start claiming process
    setIsClaimed(true);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`dailyBonusClaimed_${userId}`, today);

    try {
      // 2. Add Delay (User Requested 1s)
      console.log('Daily Bonus: Waiting 1s for user state to stabilize...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Correct URL Construction & Logging for Debugging
      const apiUrl = `/api/daily_bonus?uid=${encodeURIComponent(userId)}`;
      console.log('--- DEBUG: Daily Bonus Claim ---');
      console.log('Sending request to API with UID:', userId);
      console.log('Target URL:', apiUrl);
      
      // 4. Fetch with Explicit Headers (even for GET)
      const response = await safeFetch(apiUrl, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // 5. Robust Status Check (User requested specific message for non-200)
      if (response.status !== 200) {
        console.warn(`Server returned status ${response.status}`);
        throw new Error('Server is updating, please try again in 5 seconds');
      }

      let data;
      try {
        const text = await response.text();
        console.log('Raw API Response:', text);
        data = JSON.parse(text);
      } catch (err) {
        throw new Error('Server returned an invalid response format (Expected JSON).');
      }

      // 6. Validate Response success fields
      if (data.success !== true && data.status !== 'success') {
        throw new Error(data.message || data.error || 'The server denied the claim or an error occurred.');
      }

      // 7. Force Refresh Balance & History
      console.log('Claim Success! Triggering data refresh...');
      await refreshUserData();
      
      // Notify other components
      window.dispatchEvent(new Event('refresh_balance'));
      window.dispatchEvent(new Event('refresh_live_feed'));
      
      toast.success('Daily Bonus Claimed! 50 Coins added to your balance.');
    } catch (e: any) {
      console.error('Daily Bonus Error Handled:', e);
      // Revert local claim state if it failed
      setIsClaimed(false);
      localStorage.removeItem(`dailyBonusClaimed_${userId}`);
      
      const errorMessage = e instanceof Error ? e.message : 'Claim failed. Check your connection or try again later.';
      toast.error(errorMessage, { duration: 5000 });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f16] pb-24 pt-8 md:pt-12">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
            <span className="text-white">Rewards </span>
            <span className="text-[#00d074]">Hub</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-md">
            Claim your daily bonuses, enter promo codes, and complete achievements to earn extra coins.
          </p>
        </motion.div>

        {/* Daily Bonus Card - Compact Version */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-[#121824] rounded-3xl p-4 md:p-5 border border-slate-800 flex flex-col items-center text-center mb-6 shadow-xl"
        >
          <div className="bg-[#0a0f16] p-2 md:p-3 rounded-2xl text-[#00d074] mb-3 shadow-inner border border-white/5">
            <Gift className="w-7 h-7" />
          </div>
          <h2 className="text-white text-xl font-bold mb-1">Daily Bonus</h2>
          <p className="text-slate-400 text-sm mb-4 max-w-[250px]">
            Come back every 24 hours to claim your free reward!
          </p>
          
          <div className="flex items-center justify-center bg-[#0a0f16] px-5 py-2.5 rounded-2xl border border-slate-800">
            <Coins className="w-5 h-5 text-yellow-500 mr-2 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
            <span className={cn("text-2xl font-black", !isClaimed ? "text-[#00d074]" : "text-slate-400")}>+50</span>
            <span className="text-slate-500 text-xs font-bold ml-1.5 uppercase tracking-widest mt-1">COINS</span>
          </div>

          <button 
            onClick={handleClaimDaily}
            disabled={isClaimed}
            className={cn(
              "font-bold tracking-widest uppercase py-3 rounded-2xl w-full mt-4 transition-all",
              !isClaimed 
                ? "bg-[#00d074] text-[#0a0f16] hover:brightness-110 active:scale-[0.98] shadow-[0_0_20px_rgba(0,208,116,0.2)]" 
                : "bg-slate-800/80 text-slate-500 border border-slate-700 cursor-not-allowed"
            )}
          >
            {isClaimed ? 'CLAIMED ✓' : 'CLAIM REWARD'}
          </button>
        </motion.div>

        {/* Promo Code Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#121824] rounded-3xl p-5 md:p-6 border border-slate-800/80 shadow-2xl mb-10"
        >
          <div className="flex flex-col gap-1 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
              <Ticket className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Promo Code</h2>
            <p className="text-sm text-slate-400 font-medium">Found a secret code? Enter it below to redeem your bonus.</p>
          </div>

          <form onSubmit={handleRedeem} className="flex flex-col">
            <input 
              type="text" 
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="ENTER CODE HERE" 
              className="bg-[#0a0f16] border border-slate-800 rounded-xl p-4 text-sm font-bold tracking-widest text-center uppercase text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            <button 
              type="submit"
              disabled={!promoCode.trim() || isRedeeming}
              className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl p-4 font-bold tracking-widest uppercase mt-3 w-full transition-colors active:scale-[0.98]"
            >
              {isRedeeming ? 'Verifying...' : 'Redeem Code'}
            </button>
          </form>
        </motion.div>

        {/* Available Quests Header */}
        <div className="flex justify-between items-end mb-4 px-1">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Available Quests</h2>
          </div>
          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{QUESTS.length} ACTIVE QUESTS</span>
        </div>

        {/* Quest Cards List */}
        <div className="flex flex-col gap-4 mb-12">
          {QUESTS.map((quest, index) => (
            <motion.div 
              key={quest.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#121824] rounded-3xl p-5 border border-slate-800 flex flex-row items-center gap-4 transition-transform hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-lg"
            >
              {/* Left Icon Block */}
              <div className="bg-[#0a0f16] w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center border border-slate-800/50">
                <div className={cn("p-2 rounded-xl", quest.lightBg)}>
                  <quest.icon className={cn("w-6 h-6", quest.color)} />
                </div>
              </div>

              {/* Middle/Right Content */}
              <div className="flex flex-col flex-grow min-w-0">
                {/* Title & Badge */}
                <div className="flex justify-between items-start mb-1 gap-2">
                  <h3 className="text-white font-bold truncate leading-tight">{quest.title}</h3>
                  <div className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-1 rounded-full text-xs font-black flex-shrink-0 flex items-center gap-1 shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                    +{quest.reward} <Coins className="w-3 h-3" />
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-500 text-xs mb-3 truncate pr-4">{quest.description}</p>

                {/* Progress Bar Container */}
                <div className="w-full">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 tracking-widest mb-1.5 uppercase">
                    <span>Progress</span>
                    <span className={quest.color}>{quest.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#0a0f16] rounded-full overflow-hidden border border-slate-800/50">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000", quest.bgColor)} 
                      style={{ width: `${quest.progress}%` }} 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Rewards List */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-[#121824] rounded-3xl p-6 border border-slate-800/80 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-500/10 p-2 rounded-xl text-blue-500">
              <History className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Recent Rewards</h2>
          </div>

          <RecentRewardsList userId={user?.uid} />
        </motion.div>

      </div>
    </div>
  );
}

function RecentRewardsList({ userId }: { userId?: string }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!userId || 
        userId === '{userid}' || 
        userId === '{userId}' || 
        userId === 'null' || 
        userId === 'undefined') {
      return;
    }

    try {
      const apiUrl = `/api/get_user_data?uid=${encodeURIComponent(userId)}`;
      console.log('Rewards Page Mapping:', apiUrl);
      
      const res = await safeFetch(apiUrl);
      
      if (res.status === 500) {
        console.warn('Rewards Table Sync: Server busy (500).');
        return;
      }

      if (!res.ok) throw new Error('Fetch failed');
      
      const data = await res.json();
      if (data.status === 'success') {
        // Map history properly from the API response
        const raw = data.history || data.user_transactions || [];
        setTransactions(raw.slice(0, 5)); // Just the last 5
      }
    } catch (err) {
      console.error('History Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
    
    // Listen for manual refreshes
    const handleRefresh = () => {
      console.log('Rewards Page: Refreshing history list...');
      fetchHistory();
    };
    window.addEventListener('refresh_live_feed', handleRefresh);
    window.addEventListener('refresh_balance', handleRefresh);

    return () => {
      window.removeEventListener('refresh_live_feed', handleRefresh);
      window.removeEventListener('refresh_balance', handleRefresh);
    };
  }, [fetchHistory]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-[#0a0f16] rounded-2xl animate-pulse border border-white/5" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 bg-[#0a0f16] rounded-2xl border border-dashed border-slate-800">
        <p className="text-slate-500 text-sm">No recent rewards found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {transactions.map((tx, idx) => {
        const isEarning = tx.type !== 'withdrawal';
        const date = new Date(tx.createdAt);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return (
          <motion.div
            key={tx.id || idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center justify-between p-3 bg-[#0a0f16] rounded-2xl border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                isEarning ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
              )}>
                {isEarning ? <Coins className="w-5 h-5" /> : <ArrowRight className="rotate-45 w-5 h-5" />}
              </div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-bold truncate max-w-[150px]">
                  {tx.offerName || 'Daily Bonus'}
                </span>
                <span className="text-slate-500 text-[10px] uppercase tracking-wider">{timeStr}</span>
              </div>
            </div>
            <div className={cn(
              "text-sm font-black flex items-center gap-1",
              isEarning ? "text-emerald-500" : "text-red-500"
            )}>
              {isEarning ? '+' : '-'}{tx.reward}
              <Coins className={cn("w-3.5 h-3.5", isEarning ? "text-yellow-500" : "text-red-400")} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
