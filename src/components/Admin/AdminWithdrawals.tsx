import { safeFetch } from '../../lib/api';
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Wallet, 
  Check, 
  X, 
  Clock, 
  MoreVertical,
  Download,
  AlertCircle,
  ArrowUpRight,
  Copy,
  User,
  ExternalLink,
  History,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

const getFlagEmoji = (countryCode: string) => {
  if (!countryCode || countryCode === 'Unknown' || countryCode.length !== 2) return '🏳️';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return '🏳️';
  }
};

interface UserAuditModalProps {
  userId: string;
  onClose: () => void;
}

function UserAuditModal({ userId, onClose }: UserAuditModalProps) {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndHistory = async () => {
      try {
        const res = await safeFetch(`/api/admin_user_audit?uid=${userId}`);
        const data = await res.json();
        if (data.status === 'success') {
          setUserInfo(data.user);
          setHistory(data.history);
        }
      } catch (err) {
        console.error("Audit error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndHistory();
  }, [userId]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-[#0f1115] border border-white/10 rounded-[32px] overflow-hidden flex flex-col max-h-[85vh] shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <User className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">User Audit</h2>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-0.5">ID: {userId}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-colors border border-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
               <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Wallet className="w-3 h-3" /> Current Balance
                  </p>
                  <p className="text-2xl font-black text-white">{(userInfo?.balance || 0).toLocaleString()} <span className="text-xs text-emerald-500">Coins</span></p>
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" /> Lifetime Earnings
                  </p>
                  <p className="text-2xl font-black text-white">{(userInfo?.totalEarned || 0).toLocaleString()} <span className="text-xs text-amber-500">Coins</span></p>
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                    <History className="w-3 h-3" /> Total Referrals
                  </p>
                  <p className="text-2xl font-black text-white">{(userInfo?.referralCount || 0).toLocaleString()} <span className="text-xs text-indigo-500">Users</span></p>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                  Recent Earning Activity
                </h3>
                <div className="bg-[#121418] border border-white/5 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/5">
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Type</th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Description</th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Reward</th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {history.length > 0 ? history.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="px-6 py-4 px-6 py-4">
                            <span className={cn(
                              "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest",
                              tx.type === 'offer' ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                            )}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-white leading-none mb-1">{tx.name || tx.offerName}</p>
                            <p className="text-[10px] text-zinc-600 font-medium">{tx.network || 'Manual'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-black text-emerald-500">+{tx.reward.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{tx.time}</span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-zinc-600 text-xs font-bold uppercase tracking-widest">No earning history found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function AdminWithdrawals() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'credited' | 'rejected'>('all');
  const [auditUserId, setAuditUserId] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    try {
      const res = await safeFetch(`/api/admin_get_withdrawals?filter=${filter}`);
      const data = await res.json();
      if (data.status === 'success') {
        setWithdrawals(data.withdrawals);
      }
    } catch (err) {
      console.error("Fetch Withdrawals Error:", err);
      toast.error("Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  const handleAction = async (id: string, newStatus: 'credited' | 'rejected') => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this withdrawal?`)) return;
    try {
      const res = await safeFetch('/api/admin_update_transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success(`Withdrawal ${newStatus} successfully`);
        fetchWithdrawals();
      }
    } catch (error) {
       console.error("Update Transaction Error:", error);
       toast.error("Failed to update status");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {auditUserId && (
          <UserAuditModal 
            userId={auditUserId} 
            onClose={() => setAuditUserId(null)} 
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Withdrawal Requests</h1>
          <p className="text-zinc-500 font-medium">Review and process user cashout requests.</p>
        </div>
        <button className="bg-white/5 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all border border-white/5">
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'credited', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
              filter === f 
                ? "bg-emerald-500 text-zinc-950 border-emerald-500" 
                : "bg-[#121418] text-zinc-500 border-white/5 hover:text-white hover:border-white/10"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Withdrawals Table */}
      <div className="bg-[#121418] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">User Audit</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Net Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Method</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Payout Details (Copy)</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Client Info</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-6">
                      <div className="h-10 bg-white/5 rounded-xl w-full" />
                    </td>
                  </tr>
                ))
              ) : withdrawals.length > 0 ? (
                withdrawals.map((tx) => {
                  const isPayPal = tx.name?.toLowerCase().includes('paypal');
                  const methodology = tx.name?.replace(' Withdrawal', '') || 'Crypto';
                  const displayAmount = tx.netAmount || tx.reward; // Fallback to reward for old entries
                  
                  return (
                    <tr key={tx.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-5">
                        <button 
                          onClick={() => setAuditUserId(tx.userId)}
                          className="text-left group/user"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-bold text-white group-hover/user:text-emerald-500 transition-colors leading-none">{tx.username || 'Anonymous'}</p>
                            <ArrowUpRight className="w-3 h-3 text-zinc-600 group-hover/user:text-emerald-500 group-hover/user:translate-x-0.5 group-hover/user:-translate-y-0.5 transition-all" />
                          </div>
                          <p className="text-[10px] text-zinc-600 font-medium leading-none font-mono">ID: {tx.userId}</p>
                        </button>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <div className="flex items-center gap-2">
                             <span className={cn(
                               "text-sm font-black",
                               isPayPal ? "text-emerald-400" : "text-white"
                             )}>
                               {isPayPal 
                                 ? `$${((tx.netAmount || tx.reward) / 1000).toFixed(2)}`
                                 : displayAmount.toLocaleString()
                               }
                             </span>
                             {!isPayPal && <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Coins</span>}
                             <button 
                               onClick={() => copyToClipboard(isPayPal ? ((tx.netAmount || tx.reward) / 1000).toFixed(2) : displayAmount.toString(), 'Amount')}
                               className="p-1 hover:bg-white/10 rounded transition-colors"
                             >
                               <Copy className="w-3 h-3 text-zinc-500" />
                             </button>
                          </div>
                          {tx.netAmount && (
                            <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
                              Fee: {tx.fee?.toLocaleString()} ({tx.grossAmount?.toLocaleString()} Gross)
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <span className="bg-white/5 border border-white/5 px-3 py-1 rounded-lg text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            {methodology}
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                            tx.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                            tx.status === 'credited' ? "bg-emerald-500/10 text-emerald-500" :
                            "bg-red-500/10 text-red-500"
                          )}>
                            {tx.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-600 font-bold mt-1 uppercase tracking-widest">{tx.time}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="max-w-[200px] flex items-center gap-2 group/copy">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-white truncate" title={tx.payoutAddress}>{tx.payoutAddress || 'N/A'}</p>
                            <p className="text-[10px] text-zinc-500 font-medium truncate mt-0.5 opacity-60 flex items-center gap-1">
                              <span>{tx.deviceInfo || 'Unknown Device'}</span>
                            </p>
                          </div>
                          {tx.payoutAddress && (
                            <button 
                              onClick={() => copyToClipboard(tx.payoutAddress, 'Address')}
                              className="p-2 bg-white/5 border border-white/10 rounded-lg opacity-0 group-hover/copy:opacity-100 transition-all hover:bg-emerald-500 hover:text-zinc-950"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div>
                          <p className="text-xs font-black text-emerald-500/80">{tx.ipAddress || '0.0.0.0'}</p>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                            <span>{getFlagEmoji(tx.countryCode)}</span>
                            <span>{tx.location || 'Region Unknown'}</span>
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {tx.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleAction(tx.id, 'credited')}
                              className="w-9 h-9 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-500/20 hover:bg-emerald-500 hover:text-zinc-950 transition-all shadow-lg shadow-emerald-500/5"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleAction(tx.id, 'rejected')}
                              className="w-9 h-9 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                             <Check className="w-4 h-4 text-zinc-700" />
                             <span className="text-[8px] font-black text-zinc-800 uppercase tracking-widest">Completed</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-zinc-900/50 flex items-center justify-center border border-white/5">
                        <Wallet className="w-6 h-6 text-zinc-800" />
                      </div>
                      <p className="text-xs font-black text-zinc-600 uppercase tracking-widest">No withdrawals found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
