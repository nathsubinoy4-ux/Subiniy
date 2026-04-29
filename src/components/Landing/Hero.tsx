import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const BRANDS = [
  { name: 'Spotify', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg' },
  { name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' },
  { name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
  { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
  { name: 'PlayStation', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg' },
  { name: 'Xbox', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Xbox_logo_2012.svg' },
  { name: 'Disney+', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg' },
  { name: 'Steam', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg' },
  { name: 'App Store', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg' },
];

export function Hero({ onGetStarted }: { onGetStarted?: () => void }) {
  const { settings } = useSiteSettings();
  const scrollToSignUp = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('signup-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-transparent pt-8 pb-4 lg:pt-2 lg:pb-2 lg:pl-4">
      {/* Background Visual - Floating Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#111116]/50 to-[#111116]" />
        <div 
          className="grid grid-cols-3 md:grid-cols-5 gap-8 p-8 transform -rotate-12 scale-125 translate-y-10"
          style={{ perspective: '1000px' }}
        >
          {[...Array(20)].map((_, i) => {
            const brand = BRANDS[i % BRANDS.length];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="aspect-square bg-zinc-900/50 border border-white/5 rounded-3xl p-6 flex items-center justify-center backdrop-blur-sm h-16"
              >
                <img 
                  src={brand.logo} 
                  alt={brand.name} 
                  style={{ width: '130px', height: '60px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full text-center lg:text-left lg:pr-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Join 100,000+ members</span>
          </div>
 
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.25rem] font-black tracking-tighter leading-[1.1] lg:leading-[1.05] mb-4 uppercase text-rgb-animated text-shine-overlay"
            data-text={settings.heroText || "Get paid to test Apps, Games & Surveys"}
            dangerouslySetInnerHTML={{ __html: settings.heroText || "Get paid to test Apps, Games & Surveys" }}
          />
 
          <p className="text-zinc-400 font-bold text-sm md:text-base mb-5 lg:mb-4 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Turn your free time into real money. Earn up to <span className="text-white">$250 per offer</span> and cash out instantly to <span className="text-white">PayPal, Crypto, or Gift Cards</span>.
          </p>
 
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 lg:gap-3">
            <button 
              onClick={scrollToSignUp}
              className="w-full sm:w-auto px-8 py-3.5 text-[#0a0f16] font-black uppercase tracking-widest text-base rounded-[20px] shadow-[0_0_25px_rgba(16,216,118,0.3)] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(16,216,118,0.5)] transition-all duration-300 flex items-center justify-center gap-3 group"
              style={{ backgroundColor: settings.heroBtnColor || '#10d876' }}
            >
              {settings.heroBtnText || "Start Earning Now"}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button 
              onClick={scrollToSignUp}
              className="w-full sm:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white font-black text-base rounded-[20px] border border-white/10 transition-all backdrop-blur-md"
            >
              View Rewards
            </button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#111116] to-transparent" />
    </div>
  );
}
