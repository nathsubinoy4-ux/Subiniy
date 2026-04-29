import { safeFetch } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, ArrowUp, ArrowDown, Minus, Wallet, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

interface LeaderboardUser {
  rank: number;
  username: string;
  avatar: string;
  balance: number;
  change: 'up' | 'down' | 'same';
  uid: string;
}

export function Leaderboard() {
  const { user: currentUser } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await safeFetch('/api/get_leaderboard');
        const data = await res.json();
        if (data.status === 'success') {
          setLeaderboardData(data.leaderboard.map((u: any) => ({
            ...u,
            change: 'same'
          })));
        }
      } catch (err) {
        console.error("Leaderboard API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const topThree = leaderboardData.slice(0, 3);
  const others = leaderboardData.slice(3);
  const currentUserRank = leaderboardData.findIndex(u => u.uid === currentUser?.uid) + 1;

  if (leaderboardData.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center justify-center py-20 text-center">
        <Sparkles className="w-12 h-12 text-zinc-700 mb-4" />
        <p className="text-zinc-500 font-black uppercase tracking-widest text-sm">
          No users on the leaderboard yet
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      {/* Rank Card (Emerald Themed) */}
      <div className="bg-[#121418] rounded-[2rem] p-5 flex items-center gap-5 mb-12 border border-emerald-500/10 shadow-xl shadow-emerald-900/5">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
          <Medal className="w-6 h-6 text-emerald-500" />
        </div>
        <div>
          <p className="text-[10px] font-black tracking-widest text-emerald-500/60 uppercase mb-0.5">Your Rank</p>
          <p className="text-2xl font-black text-white leading-none">
            {currentUserRank > 0 ? `#${currentUserRank}` : 'Unranked'}
          </p>
        </div>
      </div>

      {/* Top 3 Podium Section */}
      <div className="flex items-end justify-center gap-2 mt-20 mb-12 max-w-md mx-auto">
        {/* Rank 2 (Left) */}
        {topThree[1] && (
          <div className="relative flex-1 bg-gradient-to-b from-gray-400/20 to-transparent rounded-t-2xl border-t border-gray-400/30 pt-8 pb-4 text-center">
            <div className="relative inline-block mb-2">
              <div className="w-16 h-16 rounded-full border-2 border-gray-500 overflow-hidden">
                <img src={topThree[1].avatar} alt={topThree[1].username} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-[#0a0a0b]">
                #2
              </div>
            </div>
            <p className="text-white font-bold text-[10px] truncate px-1">{topThree[1].username}</p>
            <div className="flex items-center justify-center gap-1 text-[8px] text-gray-400 font-black">
              <Wallet className="w-2 h-2" />
              <span>{topThree[1].balance.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Rank 1 (Center) */}
        {topThree[0] && (
          <div className="relative flex-1 bg-gradient-to-b from-yellow-500/20 to-transparent rounded-t-3xl border-t border-yellow-500/30 pt-12 pb-6 text-center -mt-10 scale-110 z-10">
            {/* Floating Crown */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-yellow-400 p-2 rounded-xl rotate-[-12deg] shadow-lg shadow-yellow-400/20 z-20">
              <Crown className="w-5 h-5 text-black" />
            </div>
            <div className="relative inline-block mb-2">
              <div className="w-24 h-24 rounded-full border-4 border-yellow-500 overflow-hidden shadow-xl shadow-yellow-500/20">
                <img src={topThree[0].avatar} alt={topThree[0].username} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-black px-3 py-1 rounded-full border-2 border-[#0a0a0b]">
                #1
              </div>
            </div>
            <p className="text-white font-bold text-xs truncate px-1">{topThree[0].username}</p>
            <div className="flex items-center justify-center gap-1 text-[10px] text-yellow-500 font-black">
              <Wallet className="w-3 h-3" />
              <span>{topThree[0].balance.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Rank 3 (Right) */}
        {topThree[2] && (
          <div className="relative flex-1 bg-gradient-to-b from-orange-700/20 to-transparent rounded-t-2xl border-t border-orange-700/30 pt-8 pb-4 text-center">
            <div className="relative inline-block mb-2">
              <div className="w-16 h-16 rounded-full border-2 border-orange-700 overflow-hidden">
                <img src={topThree[2].avatar} alt={topThree[2].username} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-[#0a0a0b]">
                #3
              </div>
            </div>
            <p className="text-white font-bold text-[10px] truncate px-1">{topThree[2].username}</p>
            <div className="flex items-center justify-center gap-1 text-[8px] text-orange-700 font-black">
              <Wallet className="w-2 h-2" />
              <span>{topThree[2].balance.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="mt-8 space-y-3">
        {leaderboardData.slice(3).map((user) => {
          const isCurrentUser = user.uid === currentUser?.uid;
          return (
            <div 
              key={user.uid}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                isCurrentUser 
                  ? "bg-green-500/10 border-green-500/30 shadow-lg shadow-green-500/5" 
                  : "bg-[#121418] border-white/5"
              )}
            >
              <div className="w-8 text-center font-bold text-sm text-slate-400">
                #{user.rank}
              </div>
              <img 
                src={user.avatar} 
                alt={user.username} 
                className="w-10 h-10 rounded-full border border-white/10"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate text-base text-white">{user.username}</p>
                <div className="flex items-center gap-1.5">
                  {user.change === 'up' && <ArrowUp className="w-3 h-3 text-green-500" />}
                  {user.change === 'down' && <ArrowDown className="w-3 h-3 text-red-500" />}
                  {user.change === 'same' && <Minus className="w-3 h-3 text-zinc-600" />}
                  <span className="text-slate-500 text-xs tracking-widest uppercase font-bold">
                    - {user.change === 'same' ? 'Stable' : `Moved ${user.change}`}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-[#00d074] font-bold text-sm">
                  <Wallet className="w-4 h-4" />
                  <span>{user.balance.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
