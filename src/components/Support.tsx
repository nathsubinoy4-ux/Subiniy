import { safeFetch } from '../lib/api';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Mail, 
  Send, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  LifeBuoy, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface FAQ {
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    question: "How do I withdraw my earnings?",
    answer: "You can withdraw your earnings by heading to the 'Shop' page. Select your preferred cryptocurrency (Bitcoin, Litecoin, etc.), enter your wallet address, and click 'Withdraw'. Minimum payouts vary by method."
  },
  {
    question: "Why is my offer still pending?",
    answer: "Most offers credit within minutes, but some can take up to 24-48 hours to verify. This depends on the offer provider (AdGate, Offertoro, etc.). If it's been longer than 48 hours, please contact the offerwall support directly."
  },
  {
    question: "Is there a limit to how much I can earn?",
    answer: "Absolutely not! You can complete as many offers, surveys, and tasks as you like. The more active you are, the more you earn. Top earners often make over $500 per month."
  },
  {
    question: "Can I use a VPN or Proxy?",
    answer: "No. Using a VPN, Proxy, or any other method to hide your real location is strictly prohibited and will result in an immediate permanent ban of your account."
  },
  {
    question: "How does the referral program work?",
    answer: "When you invite a friend using your referral link, you'll earn a 10% commission on all their earnings for life. This doesn't affect their earnings; it's an extra bonus from us!"
  }
];

export function Support() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await safeFetch('/api/submit_support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user?.uid || 'guest',
          ...formData
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success("Support ticket submitted! We'll get back to you within 24 hours.");
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(data.message || "Failed to submit ticket");
      }
    } catch (error) {
      console.error("Support API Error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-500/10 rounded-[24px] flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <LifeBuoy className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Support Center</h1>
            <p className="text-zinc-500 font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
              We're here to help you 24/7.
            </p>
          </div>
        </div>

        <Link 
          to="/chat"
          className="bg-[#22c55e] hover:bg-[#22c55e]/90 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-3 transition-all shadow-xl shadow-[#22c55e]/20 group"
        >
          <MessageSquare className="w-5 h-5 transition-transform group-hover:scale-110" />
          Live Chat Support
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-[#111116] border border-white/5 rounded-[40px] p-8 md:p-10 shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-[#22c55e]/10 rounded-2xl flex items-center justify-center border border-[#22c55e]/20">
              <Mail className="w-5 h-5 text-[#22c55e]" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Contact Us</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest px-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#22c55e]/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest px-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="john@example.com"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#22c55e]/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-widest px-1">Subject</label>
              <input 
                type="text" 
                required
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="How can we help?"
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#22c55e]/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-widest px-1">Message</label>
              <textarea 
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Describe your issue in detail..."
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#22c55e]/50 transition-all resize-none"
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#22c55e] hover:bg-[#22c55e]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#22c55e]/20 group"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              )}
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* FAQ Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20">
              <HelpCircle className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <div 
                key={index}
                className="bg-[#111116] border border-white/5 rounded-3xl overflow-hidden shadow-lg"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-black text-white tracking-tight">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-[#22c55e]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-zinc-500" />
                  )}
                </button>
                
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-8 pb-8 text-zinc-400 font-bold leading-relaxed text-sm">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Link to="/earn" className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-all">
              <div className="flex items-center gap-4">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="font-black text-white text-xs uppercase tracking-widest">Offerwall Help</span>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </Link>
            <Link to="/profile" className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-all">
              <div className="flex items-center gap-4">
                <Wallet className="w-5 h-5 text-[#22c55e]" />
                <span className="font-black text-white text-xs uppercase tracking-widest">Payout Status</span>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
