import { safeFetch } from '../../lib/api';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Wallet, Hash, Info, CheckCircle2, AlertCircle, ArrowLeft, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UAParser } from 'ua-parser-js';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

interface CashoutViewProps {
  coinName: string;
  coinSymbol: string;
  onBack: () => void;
}

export function CashoutView({ coinName, coinSymbol, onBack }: CashoutViewProps) {
  const { user, addBalance } = useAuth();
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Configuration Constants
  const FEE_PERCENTAGE = 0.10; // 10% fee
  const COIN_TO_USD = 0.001; // 1000 coins = $1.00 base value

  // Method-specific Rates (in USD)
  const CRYPTO_RATES: Record<string, number> = {
    'LTC': 55.702,
    'BNB': 601.45,
    'BTC': 64820.10,
    'TRX': 0.118,
    'DOGE': 0.158,
    'USD': 1.00 // For PayPal
  };

  // Method-specific Minimum Withdrawals (in Units of Coins)
  const MIN_WITHDRAWALS: Record<string, number> = {
    'PayPal': 50000, // $50.00
    'Litecoin': 500,
    'Binance': 1000,
    'Tron': 100,
    'Bitcoin': 5000,
    'Dogecoin': 100
  };

  const currentRate = coinName === 'Binance' ? 1.0 : (CRYPTO_RATES[coinSymbol] || 1.0);
  const displaySymbol = coinName === 'Binance' ? 'USD' : coinSymbol;
  const minWithdrawal = MIN_WITHDRAWALS[coinName] || 500;
  
  // Real-time Calculations
  const calculatedFee = Math.round(amount * FEE_PERCENTAGE);
  const netAmount = Math.max(0, amount - calculatedFee);
  
  // Calculate how many crypto coins or USD the user gets
  // Formula: (Net Coins * $0.001 per coin) / (Rate of Asset in USD)
  const youReceive = (netAmount * COIN_TO_USD) / currentRate;

  const isValidAmount = amount >= minWithdrawal;
  const hasEnoughBalance = (user?.balance || 0) >= amount;
  const isValidAddress = address.trim().length >= 3;
  const canWithdraw = isValidAmount && hasEnoughBalance && isValidAddress;

  const addressLabel = coinName === 'PayPal' ? "PayPal Email Address" : 
                      coinName === 'Binance' ? "Binance Email or Binance ID" : 
                      "Wallet Address";
  const addressPlaceholder = coinName === 'PayPal' ? "Enter your PayPal email" : 
                            coinName === 'Binance' ? "Enter Binance Email or ID" : 
                            "Enter recipient address";

  const handleWithdraw = async () => {
    if (!canWithdraw || !user) return;
    setIsSubmitting(true);
    setStatus(null);

    try {
      // 1. Fetch IP Address & Geolocation
      let ipAddress = 'Unknown';
      let location = 'Unknown';
      let countryCode = 'Unknown';
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();
        ipAddress = ipData.ip || 'Unknown';
        location = ipData.country_name || 'Unknown';
        countryCode = ipData.country_code || 'Unknown';
      } catch (e) {
        console.error("Failed to fetch IP/Geo:", e);
      }

      // 2. Parse User Agent
      const parser = new UAParser();
      const result = parser.getResult();
      const browserName = result.browser.name || 'Unknown Browser';
      const osName = result.os.name || 'Unknown OS';
      const deviceInfo = `${browserName} on ${osName}`;
      
      const userAgent = navigator.userAgent;
      const username = user.displayName || 'Anonymous';
      const payoutAddress = address.trim();

      if (!user || !user.uid || user.uid === '{userid}') {
        console.error('UID is missing or invalid before withdrawal:', user?.uid);
        throw new Error('User not found or invalid session. Please re-login.');
      }

      console.log('Sending UID (Withdraw):', user.uid);
      // Hit API
      const response = await safeFetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: String(user.uid),
          amount: amount,
          method: coinName,
          address: payoutAddress
        })
      });

      let data;
      try {
        data = await response.json();
      } catch (err) {
        throw new Error(`Invalid JSON response from server. Status: ${response.status}`);
      }

      if (data.status === 'error' || data.success === false) {
        throw new Error(data.message || data.error || 'Withdrawal failed on server.');
      }
      if (data.status !== 'success' && data.status !== 'OK' && data.success !== true) {
        throw new Error(data.message || data.error || `Withdrawal failed on server: ${response.status}`);
      }

      // Deduct balance locally (the API also deducts it in DB)
      // Since polling is active, it'll sync up, but we can optimistically deduct
      await addBalance(-amount);
      
      window.dispatchEvent(new Event('refresh_balance'));
      window.dispatchEvent(new Event('refresh_live_feed'));

      // record activity
      try {
        await safeFetch('/api/record_activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            username,
            userAvatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
            offerName: `${coinName} Withdrawal`,
            reward: amount,
            type: 'withdrawal',
            network: 'System'
          })
        });
      } catch (err) {
        console.error("Failed to record activity:", err);
      }
      
      setStatus({
        type: 'success',
        message: `Payout requested! ${amount.toLocaleString()} coins have been sent to queue for ${coinName}.`
      });
      toast.success('Request Sent!');
      setAddress('');
      setAmount(100);
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Withdrawal failed. Please check your connection.'
      });
      toast.error(error instanceof Error ? error.message : 'Withdrawal failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-black uppercase tracking-widest">Back to Shop</span>
      </button>

      {/* Main Card Wrapper */}
      <div className="bg-[#121418] rounded-[24px] p-5 md:p-8 border border-white/5 shadow-2xl relative overflow-hidden">
        {/* Decorative Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -z-10" />
        
        {/* Card Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-black text-white tracking-tight">{coinName}</h1>
          <div className="bg-white/5 text-zinc-400 rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-widest border border-white/5">
            {coinName === 'PayPal' ? 'Direct Payout' : 'Direct Wallet'}
          </div>
        </div>

        {/* Compact Balance Display */}
        <div className="bg-[#1a1d24] px-4 py-3 rounded-xl flex items-center justify-between border border-white/5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Coins className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-zinc-500 text-[8px] font-black uppercase tracking-widest leading-none mb-1">Available</p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-white leading-none">{user?.balance?.toLocaleString() || 0}</span>
                <span className="text-[10px] font-bold text-emerald-500/80 tracking-tight">
                  ≈ ${((user?.balance || 0) * COIN_TO_USD).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Info Badge */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border mb-6",
          !isValidAmount && amount > 0 ? "bg-red-500/5 border-red-500/20" : "bg-zinc-900/40 border-white/5"
        )}>
          <Info className={cn("w-3.5 h-3.5 shrink-0", !isValidAmount && amount > 0 ? "text-red-500" : "text-zinc-500")} />
          <p className={cn("text-[10px] leading-none", !isValidAmount && amount > 0 ? "text-red-400 font-bold" : "text-zinc-400")}>
            Minimum withdrawal for {coinName}: <span className="text-white font-bold">{minWithdrawal.toLocaleString()} coins</span> (${(minWithdrawal * COIN_TO_USD).toFixed(2)})
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Wallet Address Input */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">
              {addressLabel}
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-focus-within:border-emerald-500/50 transition-colors">
                <Wallet className="w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input 
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={addressPlaceholder}
                className="w-full bg-[#1a1d24] border border-white/5 rounded-xl pl-13 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all h-12"
              />
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-end px-1">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                Withdraw Amount
              </label>
              <span className="text-[9px] font-bold text-emerald-500/60 uppercase">
                {coinName === 'Binance' 
                  ? `1000 Coins = $1.00 USD` 
                  : `1 ${displaySymbol} = $${currentRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: (currentRate < 1 ? 4 : 2) })}`}
              </span>
            </div>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-focus-within:border-emerald-500/50 transition-colors">
                <Hash className="w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-[#1a1d24] border border-white/5 rounded-xl pl-13 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all h-12"
              />
              <button 
                onClick={() => setAmount(user?.balance || 0)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded hover:bg-emerald-500/20 transition-colors"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Compact Fee & Receive Summary Row */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center justify-between border-r border-white/10 pr-3">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Fee (10%)</span>
              <div className="flex items-center gap-1.5">
                <Coins className="w-3 h-3 text-amber-500" />
                <span className="text-xs font-black text-white">{calculatedFee.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pl-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">You Get</span>
              <div className="text-right">
                <p className="text-xs font-black text-emerald-500 leading-none">
                  {youReceive.toLocaleString(undefined, { maximumFractionDigits: (displaySymbol === 'USD' ? 2 : 8) })} {displaySymbol}
                </p>
                <p className="text-[8px] font-bold text-zinc-600 mt-0.5">
                  ≈ ${(netAmount * COIN_TO_USD).toFixed(2)} USD
                </p>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <AnimatePresence mode="wait">
            {status && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                  "p-3 rounded-xl flex items-start gap-3 border",
                  status.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                )}
              >
                {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <p className="text-[10px] font-bold leading-tight">{status.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Withdraw Button */}
          <button
            onClick={handleWithdraw}
            disabled={!canWithdraw || isSubmitting}
            className={cn(
              "w-full h-14 rounded-xl font-black text-base transition-all shadow-xl relative overflow-hidden group mt-2",
              canWithdraw && !isSubmitting
                ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 active:scale-[0.98]"
                : "bg-white/5 text-zinc-600 cursor-not-allowed border border-white/5"
            )}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-4 h-4 border-2 border-zinc-950/20 border-t-zinc-950 rounded-full animate-spin" />
                <span className="text-sm">Processing...</span>
              </div>
            ) : (
              "Withdraw Now"
            )}
            {canWithdraw && !isSubmitting && (
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
            )}
          </button>

          {/* Error Hints */}
          <div className="space-y-1 text-center">
            {!hasEnoughBalance && amount > 0 && (
              <p className="text-[9px] font-black text-red-500/60 uppercase tracking-[0.2em]">
                Insufficient balance
              </p>
            )}
            {isValidAmount && !isValidAddress && address.length > 0 && (
              <p className="text-[9px] font-black text-amber-500/60 uppercase tracking-[0.2em]">
                Invalid {addressLabel}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Security Badges */}
      <div className="mt-8 flex items-center justify-center gap-8 opacity-30 grayscale">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">SSL Secure</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Verified Payouts</span>
        </div>
      </div>
    </div>
  );
}
