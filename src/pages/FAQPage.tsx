import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const FAQS = [
  {
    question: "How do I start earning coins?",
    answer: "To start earning, simply head to the 'Earn' or 'Offerwalls' section. Choose a task that interests you—this could be a survey, a game to play, or an app to test. Follow the instructions carefully, and once the partner verifies your completion, coins will be added to your account."
  },
  {
    question: "How do I withdraw my earnings?",
    answer: "Once you've reached the minimum withdrawal threshold, go to the 'Shop' section. Select your preferred payout method (e.g., Litecoin, PayPal, or Gift Cards), enter the required details, and submit your request. Most payouts are processed within 24 hours."
  },
  {
    question: "When do I get paid?",
    answer: "Payout times vary depending on the method chosen. Crypto withdrawals are typically processed within a few hours, while PayPal and Gift Cards may take up to 24-48 hours for security verification. You can track your withdrawal status in your profile."
  },
  {
    question: "Why is my offer still pending?",
    answer: "Some offers require a verification period by the advertiser to ensure the task was completed correctly. This can take anywhere from a few minutes to a few days. If an offer remains pending for more than 7 days, please contact the specific offerwall's support team."
  },
  {
    question: "Can I use a VPN or Proxy?",
    answer: "No. The use of VPNs, proxies, or any other location-masking tools is strictly prohibited. Our security systems and those of our partners will detect these tools, leading to immediate account suspension and forfeiture of all earnings."
  },
  {
    question: "How does the referral system work?",
    answer: "You can find your unique referral link in the 'Referrals' section. Share this link with your friends. When they sign up and start earning, you'll receive a percentage of their earnings as a bonus, without affecting their own rewards!"
  }
];

function FAQItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-white/5 rounded-2xl overflow-hidden bg-[#121418] transition-all hover:border-emerald-500/30">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
      >
        <span className={cn(
          "text-lg font-bold transition-colors",
          isOpen ? "text-emerald-500" : "text-white"
        )}>
          {question}
        </span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-emerald-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQPage() {
  const { user, signOut } = useAuth();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Layout>
      <div className="bg-[#0a0a0b] min-h-screen">
        <div className="max-w-4xl mx-auto p-6 pb-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <HelpCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tight">Frequently Asked Questions</h1>
            <p className="text-gray-400 font-medium max-w-xl mx-auto">
              Everything you need to know about earning, withdrawals, and how findejob.com works.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <FAQItem 
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>

          <div className="mt-16 p-8 rounded-[32px] bg-emerald-500/5 border border-emerald-500/10 text-center">
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Still have questions?</h3>
            <p className="text-gray-400 mb-6">Can't find the answer you're looking for? Please chat with our friendly team.</p>
            <button className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
