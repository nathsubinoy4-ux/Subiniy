import { safeFetch } from '../../lib/api';
import React, { useState, useEffect } from 'react';
import { 
  Ticket, Plus, Trash2, Power, PowerOff, ShieldCheck, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

interface PromoCode {
  id: string; // The ID in MySQL
  code: string;
  rewardAmount: number;
  isActive: boolean;
  createdAt: any;
}

export function AdminPromoCodes() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [newCode, setNewCode] = useState('');
  const [newReward, setNewReward] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCodes = async () => {
    try {
      const res = await safeFetch('/api/admin_promo_codes');
      const data = await res.json();
      if (data.status === 'success') {
        setPromoCodes(data.promoCodes);
      }
    } catch (err) {
      console.error("Fetch Codes Error:", err);
      toast.error("Failed to load promo codes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newReward) return;

    const formattedCode = newCode.trim().toUpperCase();
    const rewardAmount = parseInt(newReward, 10);

    if (isNaN(rewardAmount) || rewardAmount <= 0) {
      toast.error("Reward amount must be a positive number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await safeFetch('/api/admin_promo_codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          code: formattedCode,
          rewardAmount
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success(`Promo code ${formattedCode} created!`);
        setNewCode('');
        setNewReward('');
        fetchCodes();
      } else {
        toast.error(data.message || "Failed to create promo code");
      }
    } catch (error: any) {
      console.error("Error creating promo code:", error);
      toast.error("Failed to create promo code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await safeFetch('/api/admin_promo_codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle',
          id,
          isActive: !currentStatus
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success(`Promo code ${currentStatus ? 'deactivated' : 'activated'}.`);
        fetchCodes();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this code?")) return;
    try {
       const res = await safeFetch(`/api/admin_promo_codes?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success("Promo code deleted.");
        fetchCodes();
      }
    } catch (error) {
      console.error("Error deleting code:", error);
      toast.error("Failed to delete promo code.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Loading Promo Codes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(0,208,116,0.1)]">
            <Ticket className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Promo Codes</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Reward Distribution System</p>
          </div>
        </div>
        <p className="text-slate-400 font-medium max-w-2xl text-sm leading-relaxed">
          Create and manage promotional codes. Users can redeem these codes once to instantly receive a specified coin balance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Form (Left Col on large screens) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-[#121824] border border-slate-800 rounded-[32px] p-6 md:p-8 sticky top-28">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Plus className="w-5 h-5 text-emerald-500" />
              Create New Code
            </h2>
            
            <form onSubmit={handleCreateCode} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Promo Code</Label>
                <div className="relative">
                  <Input 
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                    placeholder="e.g. SUMMER26"
                    className="bg-black/40 border-slate-800 focus:border-emerald-500 h-14 rounded-2xl text-white px-5 uppercase font-mono tracking-widest"
                    maxLength={20}
                    required
                  />
                  <ShieldCheck className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Reward Amount (Coins)</Label>
                <Input 
                  type="number"
                  min="1"
                  step="1"
                  value={newReward}
                  onChange={(e) => setNewReward(e.target.value)}
                  placeholder="e.g. 1000"
                  className="bg-black/40 border-slate-800 focus:border-emerald-500 h-14 rounded-2xl text-white px-5"
                  required
                />
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting || !newCode || !newReward}
                className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Save Promo Code"}
              </Button>
            </form>
          </div>
        </motion.div>

        {/* Management Table (Right Col) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <div className="bg-[#121824] border border-slate-800 rounded-[32px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Code</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Reward</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {promoCodes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                          No promo codes found. Create one to get started!
                        </td>
                      </tr>
                    ) : (
                      promoCodes.map((promo) => (
                        <motion.tr 
                          key={promo.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span className="font-mono font-bold text-white bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 tracking-widest">
                              {promo.code}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 font-bold text-yellow-500">
                              <span>{promo.rewardAmount.toLocaleString()}</span>
                              <span className="text-[10px] uppercase tracking-widest text-slate-500 mt-0.5">Coins</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                              promo.isActive 
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                : "bg-red-500/10 text-red-500 border-red-500/20"
                            )}>
                              {promo.isActive ? 'Active' : 'Inactive'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleStatus(promo.id, promo.isActive)}
                                className={cn(
                                  "p-2 rounded-xl transition-all hover:scale-110",
                                  promo.isActive 
                                    ? "bg-slate-800 text-slate-400 hover:text-amber-500" 
                                    : "bg-emerald-500/10 text-emerald-500"
                                )}
                                title={promo.isActive ? "Deactivate Code" : "Activate Code"}
                              >
                                {promo.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleDelete(promo.id)}
                                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all hover:scale-110"
                                title="Delete Code"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
