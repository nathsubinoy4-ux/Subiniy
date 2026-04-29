import { safeFetch } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Edit2, 
  ShieldAlert, 
  EyeOff, 
  BarChart3, 
  CheckCircle2, 
  Users, 
  Wallet, 
  Clock, 
  ArrowRight, 
  Hourglass,
  DollarSign,
  User as UserIcon,
  AlertCircle,
  X,
  Shield,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCurrency } from '../context/CurrencyContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Transaction } from '../types';

export default function Profile() {
  const { user } = useAuth();
  const { isUsdMode, convertBalance } = useCurrency();
  const [activeTab, setActiveTab] = useState<'earnings' | 'withdrawals' | 'pending'>('earnings');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      const userId = user?.uid;
      if (!userId || userId === '{userid}' || userId === '{userId}' || userId === 'null' || userId === 'undefined') {
        return;
      }

      try {
        const apiUrl = `/api/get_user_data?uid=${encodeURIComponent(userId)}`;
        console.log('Profile Sync Mapping:', apiUrl);
        
        const res = await safeFetch(apiUrl);
        
        if (res.status === 500) {
          console.warn('Profile Sync: Server busy (500).');
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
              status: 'credited', // defaults to credited since they are completed
              type: tx.type === 'withdrawal' ? 'withdrawal' : 'earning',
              time: timeStr,
              rawDate: rawDate
            };
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
  }, [user]);

  if (!user) return null;

  const handleTogglePrivate = async () => {
    if (!user.uid) return;
    try {
      const res = await safeFetch('/api/update_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          isPrivate: !user.isPrivateProfile
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        // We need useAuth to provide a way to update the user local state
        // For now, it will refresh on next fetch if we had that set up.
        // Assuming refreshUserData exists in useAuth:
        window.dispatchEvent(new Event('refresh_user_data'));
        toast.success("Privacy updated!");
      }
    } catch (error) {
      console.error("Error updating privacy:", error);
      toast.error("Failed to update privacy");
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (activeTab === 'earnings') return t.type === 'earning';
    if (activeTab === 'withdrawals') return t.type === 'withdrawal';
    if (activeTab === 'pending') return t.status === 'pending';
    return false;
  });

  const earningsLast30Days = transactions
    .filter(t => {
      if (t.type !== 'earning') return false;
      if (!(t as any).rawDate) return true;
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      return (t as any).rawDate >= thirtyDaysAgo;
    })
    .reduce((sum, t) => sum + t.reward, 0);

  const totalEarnings = transactions
    .filter(t => t.type === 'earning' && t.status === 'credited')
    .reduce((sum, t) => sum + t.reward, 0);

  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === 'nathsubinoy4@gmail.com'.toLowerCase();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 px-4">
      {/* Admin Quick Access */}
      {isAdmin && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="w-6 h-6 text-zinc-950" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight">Admin Dashboard</h3>
              <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">Manage platform & offerwalls</p>
            </div>
          </div>
          <Link 
            to="/admin"
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all active:scale-95"
          >
            Open Panel
            <ExternalLink className="w-3 h-3" />
          </Link>
        </motion.div>
      )}

      {/* Section 1: Account Information Card */}
      <div className="bg-[#121418] rounded-2xl p-6 border border-white/5 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/5">
              <UserIcon className="w-4 h-4 text-zinc-400" />
            </div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Account Information</h2>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase tracking-widest rounded-lg transition-all">
            <Edit2 className="w-3 h-3" />
            Edit
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
          {/* Left: Avatar with Progress */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative p-1">
              {/* Circular Progress Border */}
              <svg className="w-32 h-32 absolute inset-0 -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-zinc-800"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={377}
                  strokeDashoffset={377 * (1 - 0.45)}
                  className="text-emerald-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="w-30 h-30 rounded-full overflow-hidden border-4 border-[#121418] relative z-10">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || ''} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <UserIcon className="w-12 h-12 text-zinc-600" />
                  </div>
                )}
              </div>
            </div>
            <div className="px-4 py-1 bg-purple-900/30 border border-purple-500/20 rounded-full">
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Level 1</span>
            </div>
          </div>

          {/* Right: User Details */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <p className="text-xs font-bold text-zinc-500">Joined 1 day ago</p>
            <h1 className="text-3xl font-black text-white tracking-tight">{user.displayName || 'User'}</h1>
            <div className="flex flex-col items-center md:items-start gap-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-sm font-medium text-zinc-400">{user.email}</span>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[9px] font-black text-red-500 uppercase tracking-widest">
                  <ShieldAlert className="w-3 h-3" />
                  Unverified
                </div>
              </div>
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => {
                navigator.clipboard.writeText(user.uid);
                console.log('User ID copied to clipboard!');
              }}>
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">ID: {user.uid}</span>
                <div className="w-4 h-4 rounded bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 className="w-2.5 h-2.5 text-zinc-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Private Toggle */}
        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-white/5">
              <EyeOff className="w-4 h-4 text-zinc-500" />
            </div>
            <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Private</span>
          </div>
          <button 
            onClick={handleTogglePrivate}
            className={cn(
              "w-10 h-5 rounded-full relative transition-colors duration-300",
              user.isPrivateProfile ? "bg-emerald-500" : "bg-zinc-800"
            )}
          >
            <div className={cn(
              "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300",
              user.isPrivateProfile ? "left-6" : "left-1"
            )} />
          </button>
        </div>
      </div>

      {/* Section 2: Stats Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/5">
            <BarChart3 className="w-4 h-4 text-zinc-400" />
          </div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Stats</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: CheckCircle2, value: user.offersCompleted || '0', label: 'Completed Offers', color: 'bg-emerald-500/10 text-emerald-500' },
            { icon: Users, value: user.usersInvited || '0', label: 'Users Referred', color: 'bg-purple-500/10 text-purple-500' },
            { icon: isUsdMode ? DollarSign : Wallet, value: convertBalance(totalEarnings), label: 'Total Earning', color: 'bg-emerald-500/10 text-emerald-500' },
            { icon: Clock, value: convertBalance(earningsLast30Days), label: 'Earnings last 30 days', color: 'bg-purple-500/10 text-purple-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#121418] border border-white/5 p-5 rounded-2xl flex flex-col items-center text-center space-y-3">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black text-white">{stat.value}</p>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Activity/History Tabs */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 p-1 bg-zinc-900/50 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveTab('earnings')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'earnings' ? "bg-emerald-500 text-black" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Wallet className="w-3 h-3" />
            Earnings
            <span className={cn(
              "px-1.5 py-0.5 rounded text-[8px]",
              activeTab === 'earnings' ? "bg-black/20" : "bg-zinc-800"
            )}>{transactions.filter(t => t.type === 'earning').length}</span>
          </button>
          <button 
            onClick={() => setActiveTab('withdrawals')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'withdrawals' ? "bg-emerald-500 text-black" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <ArrowRight className="w-3 h-3" />
            Withdrawals
            <span className={cn(
              "px-1.5 py-0.5 rounded text-[8px]",
              activeTab === 'withdrawals' ? "bg-black/20" : "bg-zinc-800"
            )}>{transactions.filter(t => t.type === 'withdrawal').length}</span>
          </button>
          <button 
            onClick={() => setActiveTab('pending')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'pending' ? "bg-emerald-500 text-black" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Hourglass className="w-3 h-3" />
            Pending
            <span className={cn(
              "px-1.5 py-0.5 rounded text-[8px]",
              activeTab === 'pending' ? "bg-black/20" : "bg-zinc-800"
            )}>{transactions.filter(t => t.status === 'pending').length}</span>
          </button>
        </div>

        <div className="bg-[#121418] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            <span className="w-1/3">Name</span>
            <span className="w-1/3 text-center">Time</span>
            <span className="w-1/3 text-right">Points</span>
          </div>
          
          <div className="divide-y divide-white/5">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-xs font-black text-zinc-600 uppercase tracking-[0.2em]">Loading activity...</p>
              </div>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <div key={tx.id} className="px-6 py-4 flex justify-between items-center hover:bg-white/[0.02] transition-colors">
                  <div className="w-1/3 flex flex-col">
                    <span className="text-sm font-bold text-white">{tx.name}</span>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      tx.status === 'credited' ? "text-emerald-500" : 
                      tx.status === 'pending' ? "text-amber-500" : "text-red-500"
                    )}>
                      {tx.status}
                    </span>
                  </div>
                  <span className="w-1/3 text-center text-[10px] font-bold text-zinc-500 uppercase">{tx.time}</span>
                  <div className="w-1/3 text-right flex items-center justify-end gap-3">
                    <span className={cn(
                      "text-sm font-black",
                      tx.type === 'earning' ? "text-emerald-500" : "text-red-500"
                    )}>
                      {tx.type === 'earning' ? '+' : '-'}{tx.reward.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-900/50 flex items-center justify-center border border-white/5">
                  <Clock className="w-6 h-6 text-zinc-800" />
                </div>
                <p className="text-xs font-black text-zinc-600 uppercase tracking-[0.2em]">No activity found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
