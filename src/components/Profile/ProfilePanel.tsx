import { safeFetch } from '../../lib/api';
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wallet, 
  Trophy, 
  Users, 
  TrendingUp, 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertCircle,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import { Transaction } from '../../types';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'earning' | 'withdrawal' | 'chargeback'>('earning');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isOpen) return;

    const fetchHistory = async () => {
      const userId = user?.uid;
      if (!userId || userId === '{userid}' || userId === '{userId}' || userId === 'null' || userId === 'undefined') {
        return;
      }

      try {
        const apiUrl = `/api/get_user_data?uid=${encodeURIComponent(userId)}`;
        console.log('ProfilePanel Sync Mapping:', apiUrl);
        
        const res = await safeFetch(apiUrl);
        
        if (res.status === 500) {
          console.warn('ProfilePanel Sync: Server busy (500).');
          return;
        }

        if (!res.ok) {
          console.error(`HTTP Error: ${res.status} ${res.statusText}`);
          return;
        }
        
        const data = await res.json();
        
        if (data.status === 'success') {
          const rawHistory = data.history || data.user_transactions || [];
          const txs = rawHistory.map((tx: any) => {
            const rawDate = new Date(tx.createdAt);
            let timeStr = 'Just now';
            const now = new Date();
            const diffInMinutes = Math.floor((now.getTime() - rawDate.getTime()) / 60000);
            if (diffInMinutes < 1) timeStr = 'Just now';
            else if (diffInMinutes < 60) timeStr = `${diffInMinutes}m ago`;
            else if (diffInMinutes < 1440) timeStr = `${Math.floor(diffInMinutes / 60)}h ago`;
            else timeStr = `${Math.floor(diffInMinutes / 1440)}d ago`;

            return {
              id: tx.id,
              name: tx.offerName,
              reward: tx.reward,
              status: 'credited',
              type: tx.type === 'withdrawal' ? 'withdrawal' : 'earning',
              time: timeStr
            } as Transaction;
          });
          setTransactions(txs);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setLoading(false);
      }
    };

    fetchHistory();
    const intervalId = setInterval(fetchHistory, 15000);

    const handleForceRefresh = () => fetchHistory();
    window.addEventListener('refresh_live_feed', handleForceRefresh);
    window.addEventListener('refresh_balance', handleForceRefresh);

    return () => {
      window.removeEventListener('refresh_live_feed', handleForceRefresh);
      window.removeEventListener('refresh_balance', handleForceRefresh);
      clearInterval(intervalId);
    };
  }, [user, isOpen]);

  if (!user) return null;

  const stats = [
    { label: 'Offers Completed', value: user.offersCompleted || 0, icon: Trophy, color: 'text-blue-500' },
    { label: 'Surveys Completed', value: user.surveysCompleted || 0, icon: History, color: 'text-purple-500' },
    { label: 'Current Balance', value: user.balance.toFixed(2), icon: Wallet, color: 'text-emerald-500' },
    { label: 'Referee Name', value: user.refereeName || 'None', icon: Users, color: 'text-orange-500' },
    { label: 'Referral Earnings', value: (user.referralEarnings || 0).toFixed(2), icon: TrendingUp, color: 'text-pink-500' },
    { label: 'Users Invited', value: user.usersInvited || 0, icon: Users, color: 'text-indigo-500' },
  ];

  const filteredTransactions = transactions.filter(t => t.type === activeTab);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-xl bg-[#0a0a0b] z-[110] shadow-2xl border-l border-white/5 overflow-y-auto"
          >
            {/* Header */}
            <div className="p-8 flex items-center justify-between border-b border-white/5 sticky top-0 bg-[#0a0a0b]/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`} 
                    alt={user.displayName || 'User'} 
                    className="w-16 h-16 rounded-3xl border-2 border-white/10 shadow-xl"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-lg border-2 border-[#0a0a0b]">
                    <span className="text-[10px] font-black leading-none">😊</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-2">{user.displayName}</h2>
                  <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <Wallet className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-black text-emerald-500">{user.balance.toFixed(2)} Coins</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-zinc-500 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-12">
              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-[#111116] border border-white/5 p-6 rounded-[32px] group hover:border-white/10 transition-all">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-white/5", stat.color)}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-xl font-black text-white tracking-tight">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Transaction Tabs */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 p-1.5 bg-[#111116] rounded-2xl border border-white/5">
                  {(['earning', 'withdrawal', 'chargeback'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeTab === tab 
                          ? "bg-white/10 text-white shadow-lg" 
                          : "text-zinc-500 hover:text-white"
                      )}
                    >
                      {tab}s
                    </button>
                  ))}
                </div>

                {/* Transaction Table */}
                <div className="bg-[#111116] border border-white/5 rounded-[32px] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Name</th>
                          <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Reward</th>
                          <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {loading ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center gap-3">
                                <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                                <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Loading transactions...</p>
                              </div>
                            </td>
                          </tr>
                        ) : filteredTransactions.length > 0 ? (
                          filteredTransactions.map((tx) => (
                            <tr key={tx.id} className="group hover:bg-white/[0.02] transition-colors">
                              <td className="px-6 py-5">
                                <span className="text-sm font-bold text-white tracking-tight">{tx.name}</span>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-1.5 font-black text-sm">
                                  {tx.type === 'earning' ? (
                                    <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <ArrowDownLeft className="w-3 h-3 text-red-500" />
                                  )}
                                  <span className={tx.type === 'earning' ? "text-emerald-500" : "text-red-500"}>
                                    {tx.reward}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                  tx.status === 'credited' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                  tx.status === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                  "bg-red-500/10 text-red-500 border-red-500/20"
                                )}>
                                  {tx.status}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase">{tx.time}</span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center gap-3">
                                <AlertCircle className="w-8 h-8 text-zinc-700" />
                                <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">No transactions found</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="space-y-4">
                <button 
                  onClick={signOut}
                  className="w-full flex items-center justify-between p-6 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-[32px] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                      <LogOut className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-white text-sm">Sign Out</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Securely log out</p>
                    </div>
                  </div>
                  <X className="w-5 h-5 text-zinc-700 group-hover:text-red-500 transition-colors" />
                </button>
              </div>

              {/* Branding Footer */}
              <div className="pt-12 border-t border-white/5 text-center space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-black text-white italic">"Remote Work, Real Rewards."</p>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">findejob.com | All rights reserved © 2026</p>
                </div>
                <div className="flex items-center justify-center gap-6">
                  <a href="#" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">Terms of Service</a>
                  <a href="#" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">Privacy Policy</a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
