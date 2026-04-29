import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: Record<string, FAQItem[]> = {
  General: [
    {
      question: "What exactly is this platform?",
      answer: "We are a premium rewards platform that connects brands with real users. You earn money by completing tasks like testing new apps, playing games, and providing feedback through surveys."
    },
    {
      question: "Is it really free to join?",
      answer: "Yes, joining is 100% free. We will never ask you for a membership fee. Our goal is to pay you for your time and effort, not the other way around."
    },
    {
      question: "Which countries are supported?",
      answer: "We welcome members from all over the world. While offer availability may vary by region, there are always tasks available regardless of where you live."
    }
  ],
  Earn: [
    {
      question: "How much can I realistically earn?",
      answer: "Earnings vary based on the time you invest. Typical tasks pay between $1 and $10, while high-value offers can pay up to $250. Many of our top members earn over $500 monthly."
    },
    {
      question: "How many tasks can I do per day?",
      answer: "There is no cap on your earnings. You can complete as many available tasks as you want. New offers are added to the platform every hour."
    }
  ],
  Withdraw: [
    {
      question: "What is the minimum withdrawal amount?",
      answer: "You can request a payout as soon as you reach $5.00 in your balance. This low threshold makes it easy for new members to get their first payment quickly."
    },
    {
      question: "Which payout methods do you offer?",
      answer: "We support instant cash outs via PayPal, various Cryptocurrencies (Bitcoin, LTC, ETH), and the most popular Gift Cards (Amazon, Visa, Steam, etc.)."
    },
    {
      question: "How long does it take to get paid?",
      answer: "Standard withdrawals are processed within 24 hours. Once you reach 'Pro' status through consistent activity, you unlock instant processing for all your payouts."
    }
  ],
  Account: [
    {
      question: "Can I have multiple accounts?",
      answer: "No. To prevent fraud and ensure a fair environment for our partners, we strictly allow only one account per person, household, and IP address."
    },
    {
      question: "Is my personal data secure?",
      answer: "Security is our top priority. We use SSL encryption and follow strict data protection protocols. Your sensitive information is never shared with third parties without your consent."
    }
  ],
  Policies: [
    {
      question: "What happens if I use a VPN?",
      answer: "Use of VPNs, Proxies, or any other IP-altering software is strictly prohibited and will lead to an immediate and permanent account ban."
    },
    {
      question: "How do I contact support?",
      answer: "We offer 24/7 dedicated support. You can reach out to us via the 'Support' ticket system in your dashboard or through our official Discord community."
    }
  ]
};

export function FAQ() {
  const [activeCategory, setActiveCategory] = useState('General');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const categories = Object.keys(FAQ_DATA);

  return (
    <section className="py-12 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Support Center</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 uppercase">
            Frequently Asked <span className="text-emerald-500">Questions</span>
          </h2>
          <p className="text-zinc-500 font-bold text-sm max-w-xl mx-auto uppercase tracking-wide">
            Everything you need to know about earning, withdrawing, and managing your account.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setExpandedIndex(null);
                }}
                className={cn(
                  "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300",
                  isActive 
                    ? "bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.3)] scale-105" 
                    : "bg-slate-900 text-zinc-500 hover:text-zinc-300 border border-white/5"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Accordion Items */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {FAQ_DATA[activeCategory].map((item, i) => {
                const isExpanded = expandedIndex === i;
                return (
                  <div
                    key={i}
                    className={cn(
                      "rounded-3xl border transition-all duration-300 overflow-hidden",
                      isExpanded ? "bg-slate-900 border-white/10" : "bg-slate-900/40 border-white/5 hover:border-white/10"
                    )}
                  >
                    <button
                      onClick={() => setExpandedIndex(isExpanded ? null : i)}
                      className="w-full px-8 py-6 flex items-center justify-between text-left group"
                    >
                      <span className={cn(
                        "text-base md:text-lg font-bold transition-colors",
                        isExpanded ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                      )}>
                        {item.question}
                      </span>
                      <ChevronDown className={cn(
                        "w-5 h-5 text-zinc-500 transition-transform duration-300",
                        isExpanded ? "rotate-180 text-emerald-500" : ""
                      )} />
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="px-8 pb-6 text-zinc-500 font-medium leading-relaxed">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
    </section>
  );
}
