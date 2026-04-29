import React, { useState } from 'react';
import { CashoutMethod } from '../../types';
import { X, Wallet, ArrowRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface WithdrawModalProps {
  method: CashoutMethod | null;
  userBalance: number;
  onClose: () => void;
  onWithdraw: (address: string) => void;
}

export function WithdrawModal({ method, userBalance, onClose, onWithdraw }: WithdrawModalProps) {
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!method) return null;

  const canWithdraw = userBalance >= method.minPayout;
  const isValidAddress = address.length > 10; // Basic validation

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWithdraw || !isValidAddress) return;
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      onWithdraw(address);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-[#111116] border border-white/5 rounded-[40px] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className={cn("p-8 flex items-center justify-between", method.bgColor)}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                <img 
                  src={method.logoUrl} 
                  alt={method.name} 
                  className="w-8 h-8 object-contain brightness-0 invert" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Withdraw {method.name}</h2>
                <p className="text-white/60 text-xs font-black uppercase tracking-widest">Network: {method.currency}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Your Balance</p>
                <p className="text-xl font-black text-white">{userBalance} Coins</p>
              </div>
              <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Min. Payout</p>
                <p className="text-xl font-black text-[#22c55e]">{method.minPayout} Coins</p>
              </div>
            </div>

            {/* Warning if balance low */}
            {!canWithdraw && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-red-500 leading-relaxed">
                  You need at least {method.minPayout - userBalance} more coins to withdraw via {method.name}.
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest px-1">
                  Wallet Address
                </label>
                <div className="relative">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={`Enter your ${method.currency} address`}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#22c55e]/50 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!canWithdraw || !isValidAddress || isSubmitting}
                className={cn(
                  "w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl",
                  canWithdraw && isValidAddress
                    ? "bg-[#22c55e] text-white hover:bg-[#22c55e]/90 shadow-[#22c55e]/20"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Withdraw Now
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
