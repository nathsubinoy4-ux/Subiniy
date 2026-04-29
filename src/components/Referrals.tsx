import { safeFetch } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { Users, Copy, Check, Share2, TrendingUp, Wallet, History, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

interface ReferralHistory {
  id: string;
  username: string;
  date: string;
  status: 'Active' | 'Pending';
  earned: number;
}

const MOCK_HISTORY: ReferralHistory[] = [
  { id: '1', username: 'CryptoKing', date: '2024-03-15', status: 'Active', earned: 450 },
  { id: '2', username: 'Sarah_Earns', date: '2024-03-14', status: 'Active', earned: 120 },
  { id: '3', username: 'Mike_T', date: '2024-03-12', status: 'Pending', earned: 0 },
  { id: '4', username: 'ElenaV', date: '2024-03-10', status: 'Active', earned: 890 },
];

export function Referrals() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [referralHistory, setReferralHistory] = useState<ReferralHistory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const referralCode = user?.uid ? user.uid.slice(0, 8).toUpperCase() : "PAIDNOVA-777";
  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await safeFetch(`/api/get_referrals?uid=${encodeURIComponent(user.uid)}`);
        const data = await res.json();
        if (data.status === 'success') {
          setReferralHistory(data.referrals);
        }
      } catch (err) {
        console.error("Referrals API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReferrals();
  }, [user]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-[40px] p-8 md:p-12 shadow-2xl shadow-[#22c55e]/20">
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-6">
              <Users className="w-4 h-4 text-white" />
              <span className="text-xs font-black text-white uppercase tracking-widest">Referral Program</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-6">
              Invite Friends & <br />
              <span className="text-zinc-900">Earn 10% Lifetime</span>
            </h1>
            <p className="text-white/80 font-bold text-lg max-w-lg leading-relaxed">
              Share your link with friends and earn 10% of everything they earn, forever. No limits, no catches.
            </p>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-20 pointer-events-none hidden lg:block">
          <Users className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* Stats & Link Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Referral Link Box */}
        <div className="lg:col-span-2 bg-[#111116] border border-white/5 rounded-[40px] p-8 shadow-xl">
          <h3 className="text-xl font-black text-white tracking-tight mb-6 flex items-center gap-3">
            <Share2 className="w-6 h-6 text-[#22c55e]" />
            Your Referral Link
          </h3>
          
          <div className="space-y-6">
            <div className="relative">
              <input 
                type="text" 
                readOnly 
                value={referralLink}
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 text-zinc-400 font-bold text-sm pr-32 focus:outline-none"
              />
              <button 
                onClick={handleCopy}
                className={cn(
                  "absolute right-2 top-2 bottom-2 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2",
                  copied ? "bg-[#22c55e] text-white" : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Referral Code</span>
                <span className="text-lg font-black text-white tracking-tighter">{referralCode}</span>
              </div>
              <div className="flex items-center gap-4">
                <button className="flex-1 bg-[#1877f2] hover:bg-[#1877f2]/90 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all">Facebook</button>
                <button className="flex-1 bg-[#0088cc] hover:bg-[#0088cc]/90 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all">Telegram</button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Column */}
        <div className="space-y-4">
          <div className="bg-[#111116] border border-white/5 rounded-[40px] p-8 shadow-xl">
            <div className="w-12 h-12 bg-[#22c55e]/10 rounded-2xl flex items-center justify-center border border-[#22c55e]/20 mb-4">
              <Users className="w-6 h-6 text-[#22c55e]" />
            </div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Referrals</p>
            <p className="text-3xl font-black text-white tracking-tighter">{referralHistory.length}</p>
          </div>

          <div className="bg-[#111116] border border-white/5 rounded-[40px] p-8 shadow-xl">
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20 mb-4">
              <TrendingUp className="w-6 h-6 text-orange-500" />
            </div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Earnings</p>
            <div className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-[#22c55e]" />
              <p className="text-3xl font-black text-white tracking-tighter">12,450</p>
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
              <History className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Referral History</h2>
          </div>
          <div className="h-px flex-1 bg-white/5 mx-8 hidden md:block" />
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Recent Joins</p>
        </div>

        <div className="bg-[#111116] border border-white/5 rounded-[40px] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">User</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Date Joined</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Earned</th>
                </tr>
              </thead>
          <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : referralHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs">
                      No referrals yet
                    </td>
                  </tr>
                ) : (
                  referralHistory.map((ref) => (
                    <tr key={ref.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-zinc-500" />
                          </div>
                          <span className="font-black text-white tracking-tight">{ref.username}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold text-zinc-500">{new Date(ref.date).toLocaleDateString()}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                          ref.status === 'Active' 
                            ? "bg-green-500/10 text-green-500 border-green-500/20" 
                            : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                        )}>
                          {ref.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 text-[#22c55e] font-black">
                          <Wallet className="w-4 h-4" />
                          <span>{ref.earned}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
