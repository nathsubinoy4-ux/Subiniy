import { safeFetch } from '../../lib/api';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Wallet, 
  LayoutGrid, 
  TrendingUp, 
  Check, 
  X, 
  Clock, 
  ArrowUpRight,
  MoreVertical,
  Filter,
  Download,
  Zap,
  Shield,
  BarChart3,
  LineChart as LineChartIcon,
  ShoppingBag,
  ArrowDownRight,
  ChevronRight,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  Cell
} from 'recharts';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: any;
  color: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  pulse?: boolean;
}

function StatCard({ title, value, subValue, icon: Icon, color, trend, pulse }: StatCardProps) {
  return (
    <div className="bg-[#121418]/60 backdrop-blur-xl border border-white/5 p-6 rounded-[28px] shadow-2xl relative overflow-hidden group">
      <div className={cn("absolute top-0 right-0 w-32 h-32 blur-[80px] -z-10 opacity-30", color)} />
      
      {pulse && (
        <div className="absolute top-4 right-4 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div className={cn(
          "p-3.5 rounded-2xl border transition-all duration-500 group-hover:scale-110", 
          color.replace('bg-', 'border-').replace('/20', '/30'), 
          color.replace('bg-', 'bg-').replace('/20', '/10')
        )}>
          <Icon className={cn("w-6 h-6", color.replace('bg-', 'text-').replace('/20', ''))} />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-black px-2.5 py-1.5 rounded-full",
            trend.isUp ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
          )}>
            {trend.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend.value}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
          {subValue && <span className="text-xs font-bold text-zinc-600">{subValue}</span>}
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f1115] border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <p className="text-sm font-bold text-white">
              {entry.name}: <span className="text-emerald-500">{entry.value.toLocaleString()}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function AdminDashboard() {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    userGrowth: '+0%',
    totalRevenue: 0,
    revenueGrowth: '+0%',
    totalPaidUSD: 0,
    paidGrowth: '+0%',
    pendingCount: 0,
    activeOfferwalls: 0
  });

  const [offerwallStats, setOfferwallStats] = useState<{name: string, value: number, fill: string}[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [topOffers, setTopOffers] = useState<any[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await safeFetch('/api/admin_stats');
        const data = await res.json();
        if (data.status === 'success') {
          setStats(prev => ({ ...prev, ...data.stats }));
          setDailyData(data.dailyData);
          setOfferwallStats(data.offerwallStats);
          setTopOffers(data.topOffers);
          setWithdrawals(data.withdrawals);
        }
      } catch (err) {
        console.error("Dashboard Stats Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-6 h-6 text-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* SaaS Styled Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 w-fit px-3 py-1 rounded-full border border-emerald-500/20">
            <Zap className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">System Operational</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-zinc-500 font-medium">Real-time performance metrics and network insights.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#121418] border border-white/5 flex p-1 rounded-xl">
             <button className="px-4 py-2 text-[10px] font-black text-white bg-white/5 rounded-lg">Real-time</button>
             <button className="px-4 py-2 text-[10px] font-black text-zinc-500 hover:text-white transition-colors">Historical</button>
          </div>
          <button 
            onClick={() => setShowDebug(!showDebug)} 
            className="p-3.5 bg-white/5 hover:bg-white/10 text-zinc-400 rounded-xl transition-all border border-white/5"
          >
            <Shield className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showDebug && (
          <motion.div 
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="bg-[#121418] border border-emerald-500/20 rounded-3xl p-8 font-mono text-xs overflow-hidden"
          >
            <h3 className="text-emerald-500 font-black uppercase tracking-widest mb-4">System Nodes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-zinc-400">
               <div className="space-y-1">
                 <p>MySQL: <span className="text-emerald-400">CONNECTED</span></p>
                 <p>Region: <span className="text-white">europe-west1</span></p>
               </div>
               <div className="space-y-1">
                 <p>Users: <span className="text-white">{stats.totalUsers}</span></p>
                 <p>Pending: <span className="text-white">{stats.pendingCount}</span></p>
               </div>
               <div className="space-y-1">
                 <p>Auth: <span className="text-white">{authUser?.email}</span></p>
                 <p>Role: <span className="text-amber-500">ADMINISTRATOR</span></p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers.toLocaleString()} 
          icon={Users} 
          color="bg-blue-500/20" 
          trend={{ value: "+14.2%", isUp: true }}
        />
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
          subValue="Gross USD"
          icon={TrendingUp} 
          color="bg-emerald-500/20" 
          trend={{ value: "+8.4%", isUp: true }}
        />
        <StatCard 
          title="Total Payouts" 
          value={`$${stats.totalPaidUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
          subValue="Distributed"
          icon={ShoppingBag} 
          color="bg-purple-500/20" 
          trend={{ value: "+21.1%", isUp: true }}
        />
        <StatCard 
          title="Pending Queue" 
          value={stats.pendingCount} 
          icon={Clock} 
          color="bg-red-500/20" 
          pulse={stats.pendingCount > 0}
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Daily Performance Line Chart */}
        <div className="bg-[#121418]/60 backdrop-blur-xl border border-white/5 p-8 rounded-[32px] shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <LineChartIcon className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Growth & Revenue</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Last 7 Days Snapshot</p>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="Revenue" 
                  name="Revenue ($)"
                  stroke="#10b981" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="ActiveUsers" 
                  name="Active Users"
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Offerwall Performance Bar Chart */}
        <div className="bg-[#121418]/60 backdrop-blur-xl border border-white/5 p-8 rounded-[32px] shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <BarChart3 className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Offerwall Performance</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Completions by Provider</p>
              </div>
            </div>
            <button className="text-zinc-500 hover:text-white p-2">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={offerwallStats} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#fff', fontSize: 10, fontWeight: 900 }}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Completions" barSize={24}>
                  {offerwallStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Converting Offers */}
        <div className="lg:col-span-2 bg-[#121418]/60 backdrop-blur-xl border border-white/5 rounded-[32px] shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                 <Zap className="w-5 h-5 text-indigo-500" />
               </div>
               <h3 className="text-xl font-black text-white tracking-tight">Top Converting Offers</h3>
             </div>
             <button className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">See Analytics</button>
          </div>
          <div className="p-4 overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                   <th className="px-6 py-4">Offer Name</th>
                   <th className="px-6 py-4 text-center">Completions</th>
                   <th className="px-6 py-4 text-right">Total Revenue</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {topOffers.map((offer, i) => (
                    <tr key={i} className="group hover:bg-white/[0.02] transition-colors rounded-xl overflow-hidden">
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-zinc-400 border border-white/5 group-hover:border-emerald-500/30 transition-colors">
                             #{i+1}
                           </div>
                           <p className="text-sm font-bold text-white transition-colors">{offer.name}</p>
                         </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-500/20">
                          {offer.count} Done
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-white">
                        ${(offer.reward * 0.001).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {topOffers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-20 text-center text-zinc-700 text-xs font-black uppercase tracking-widest">No transaction data</td>
                    </tr>
                  )}
               </tbody>
             </table>
          </div>
        </div>

        {/* Offerwall Status List */}
        <div className="bg-[#121418]/60 backdrop-blur-xl border border-white/5 p-8 rounded-[32px] shadow-2xl flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/5">
              <Globe className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Active Networks</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{stats.activeOfferwalls} Status Online</p>
            </div>
          </div>
          <div className="space-y-4 flex-1">
             {offerwallStats.map((wall, i) => (
               <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: wall.fill }}></div>
                    <span className="text-[10px] font-black text-white tracking-wider">{wall.name}</span>
                 </div>
                 <div className="flex items-center gap-2 text-zinc-500 group-hover:text-emerald-500 transition-colors">
                    <span className="text-[9px] font-bold uppercase">Manage</span>
                    <ChevronRight className="w-4 h-4" />
                 </div>
               </div>
             ))}
             {offerwallStats.length === 0 && (
               <div className="flex flex-col items-center justify-center h-40 opacity-20">
                 <LayoutGrid className="w-10 h-10 mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-center">No Active Providers</p>
               </div>
             )}
          </div>
          <button className="w-full mt-6 py-4 rounded-2xl bg-emerald-500 text-zinc-950 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10 active:scale-[0.98]">
             Configure All Nodes
          </button>
        </div>
      </div>
    </div>
  );
}
