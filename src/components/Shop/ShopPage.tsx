import React, { useState } from 'react';
import { ShoppingCart, Bitcoin, Wallet, ArrowRight, Zap, Trophy, Gift } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { CASHOUT_METHODS } from '../../lib/mockData';
import { CashoutCard } from './CashoutCard';
import { CashoutView } from './CashoutView';
import { CashoutMethod } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export function ShopPage() {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<CashoutMethod | null>(null);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pb-24">
      <AnimatePresence mode="wait">
        {!selectedMethod ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="max-w-6xl mx-auto px-4 py-12 space-y-12"
          >
            {/* Header */}
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Cash Out</h1>
              <p className="text-slate-400 text-sm md:text-base font-medium">
                Choose your preferred withdrawal method.
              </p>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {CASHOUT_METHODS.map((method, index) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CashoutCard 
                    method={method} 
                    userBalance={user?.balance || 0}
                    onClick={(m) => setSelectedMethod(m)} 
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CashoutView 
              coinName={selectedMethod.name}
              coinSymbol={selectedMethod.currency}
              onBack={() => setSelectedMethod(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
