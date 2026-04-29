import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { Mail, MessageSquare, Clock, Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export function ContactPage() {
  const { user, signOut } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
  };

  return (
    <Layout>
      <div className="bg-[#0a0a0b] min-h-screen">
        <div className="max-w-6xl mx-auto p-6 pb-24">
          <div className="mb-12">
            <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tight">Contact Us</h1>
            <p className="text-gray-400 font-medium">Have a question or need help? We're here for you.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-[#121418] rounded-[32px] border border-white/5 p-8 shadow-2xl relative overflow-hidden">
                {isSubmitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Message Sent!</h2>
                    <p className="text-gray-400 max-w-sm">
                      Thank you for reaching out. Our support team will get back to you within 24 hours.
                    </p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="mt-8 text-emerald-500 font-bold hover:underline uppercase tracking-widest text-xs"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Your Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                          className="w-full bg-black/50 border border-white/5 rounded-2xl px-5 py-3.5 text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                          className="w-full bg-black/50 border border-white/5 rounded-2xl px-5 py-3.5 text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Subject</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-black/50 border border-white/5 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium appearance-none"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Withdrawal Issue">Withdrawal Issue</option>
                        <option value="Offer Credit Issue">Offer Credit Issue</option>
                        <option value="Partnership">Partnership</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Message</label>
                      <textarea
                        required
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="How can we help you today?"
                        className="w-full bg-black/50 border border-white/5 rounded-2xl px-5 py-3.5 text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 transition-all font-medium resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Support Info */}
            <div className="space-y-6">
              <div className="bg-[#121418] rounded-[32px] border border-white/5 p-8">
                <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tight">Support Info</h3>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <Mail className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Email Us</p>
                      <p className="text-white font-bold">support@findejob.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/20">
                      <Clock className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Response Time</p>
                      <p className="text-white font-bold">Average 24 Hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0 border border-purple-500/20">
                      <MessageSquare className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Live Chat</p>
                      <p className="text-white font-bold">Available for VIPs</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-[32px] bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/10">
                <h4 className="text-white font-black uppercase tracking-tight mb-2">Pro Tip</h4>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Include your user ID and screenshots of completed offers for faster resolution of credit issues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
