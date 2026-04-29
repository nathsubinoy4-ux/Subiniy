import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { LiveActivityTicker } from '../LiveActivityTicker';
import { Hero } from './Hero';
import { Footer } from '../Footer';
import { SignUpForm } from '../Auth/SignUpForm';
import { OfferwallPartners } from './OfferwallPartners';
import { LiveStats } from './LiveStats';
import { FAQ } from './FAQ';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#111116] selection:bg-brand-500 selection:text-white relative overflow-x-hidden">
      {/* Global Dotted Grid Background */}
      <div className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:40px_40px]" />
      <Header />
      <LiveActivityTicker onUserClick={() => navigate('/signup')} />
      
      {/* Combined Hero and Sign Up Section for Side-by-Side Desktop Layout */}
      <section className="relative px-6 md:px-16 lg:px-24 pb-12 pt-8 lg:py-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-12 items-center relative z-10">
          <Hero />
          
          <div id="signup-section" className="w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <SignUpForm embedded />
            </div>
          </div>
        </div>
      </section>

      <OfferwallPartners />

      <LiveStats />

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fast Payouts */}
          <div className="p-8 md:p-10 rounded-[32px] bg-zinc-900/50 border border-white/5 flex flex-col md:flex-row lg:flex-col items-center lg:items-start gap-6 w-full text-center md:text-left lg:text-left">
            <div className="text-5xl md:text-6xl lg:text-5xl flex-shrink-0 animate-bounce-slow">⚡</div>
            <div>
              <h3 className="text-2xl md:text-3xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                Fast Payouts
              </h3>
              <p className="text-zinc-500 font-medium leading-relaxed">
                Withdraw your earnings via PayPal, Crypto, or Gift Cards instantly.
              </p>
            </div>
          </div>

          {/* Highest Rates */}
          <div className="p-8 md:p-10 rounded-[32px] bg-zinc-900/50 border border-white/5 flex flex-col md:flex-row lg:flex-col items-center lg:items-start gap-6 w-full text-center md:text-left lg:text-left">
            <div className="text-5xl md:text-6xl lg:text-5xl flex-shrink-0 animate-pulse-slow">📈</div>
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-3">Highest Rates</h3>
              <p className="text-zinc-500 font-medium leading-relaxed">
                We offer the best payout rates in the industry for every task.
              </p>
            </div>
          </div>
          
          {/* 24/7 Support */}
          <div className="p-8 md:p-10 rounded-[32px] bg-zinc-900/50 border border-white/5 flex flex-col md:flex-row lg:flex-col items-center lg:items-start gap-6 w-full text-center md:text-left lg:text-left">
            <div className="text-5xl md:text-6xl lg:text-5xl flex-shrink-0">🤝</div>
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-3">24/7 Support</h3>
              <p className="text-zinc-500 font-medium leading-relaxed">
                Our dedicated team is always here to help you succeed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FAQ />

      <Footer />
    </div>
  );
}
