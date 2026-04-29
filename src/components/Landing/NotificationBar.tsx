import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

const ACTIVITIES = [
  { user: 'Mamurbeta689', amount: 1782, time: '4 hours ago' },
  { user: 'CryptoKing', amount: 450, time: '2 mins ago' },
  { user: 'Sarah_99', amount: 1200, time: '1 hour ago' },
  { user: 'OfferHunter', amount: 85, time: '30 mins ago' },
  { user: 'GamerPro', amount: 3200, time: '5 hours ago' },
];

export function NotificationBar() {
  return (
    <div className="bg-zinc-900 border-b border-white/5 py-2 overflow-hidden whitespace-nowrap relative">
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ 
          duration: 30, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="flex gap-12 items-center"
      >
        {[...ACTIVITIES, ...ACTIVITIES].map((activity, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px] font-bold">
            <span className="text-zinc-400">{activity.user}</span>
            <span className="text-brand-500 flex items-center gap-1">
              earned {activity.amount.toLocaleString()} coins
              <Sparkles className="w-3 h-3" />
            </span>
            <span className="text-zinc-600">{activity.time}</span>
          </div>
        ))}
      </motion.div>
      
      {/* Gradients for fade effect */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-zinc-900 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-zinc-900 to-transparent z-10" />
    </div>
  );
}
