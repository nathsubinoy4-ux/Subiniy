import { safeFetch } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { 
  Trophy, Star, StarHalf, Flame, LayoutGrid, Zap, Sparkles, Crown, Medal, 
  Wallet, ArrowUp, ArrowDown, Minus, Coins,
  ShieldCheck, ExternalLink, X, AlertCircle
} from 'lucide-react';
import { Footer } from './Footer';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { OfferwallViewer } from './OfferwallViewer';
import { OfferwallModal } from './OfferwallModal';
import { GLOBAL_OFFERWALLS } from '../config/offerwalls';

export function EarnPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSettings, setActiveSettings] = useState<Record<string, any>>({});
  const [offerwallsData, setOfferwallsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await safeFetch('/api/get_offerwalls');
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error("Invalid JSON from get_offerwalls.php:", text);
          throw e; // skip the rest if invalid
        }
        
        let networks: any[] = [];
        if (Array.isArray(data)) {
          networks = data;
        } else if (data.offerwalls && Array.isArray(data.offerwalls)) {
          networks = data.offerwalls;
        } else if (data.data && Array.isArray(data.data)) {
          networks = data.data;
        }
        
        setOfferwallsData(networks);
      } catch (err) {
        console.error("EarnPage API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [user]);

  if (!user) return null;

  // Use dynamic partners from DB, filter active
  const displayedPartners = offerwallsData.filter(p => !('is_active' in p) || p.is_active == 1 || p.is_active === true || p.isActive === true);

  const handlePartnerClick = (partnerObj: any) => {
    const pId = partnerObj.id || partnerObj.name?.toLowerCase().replace(/\s+/g, '');
    let color = '#4ade80';
    // Match with existing global config for brand colors if possible
    const existing = GLOBAL_OFFERWALLS.find(g => g.id === pId);
    if (existing && existing.color) {
      color = existing.color;
    }
    
    setSelectedPartner({
      ...partnerObj,
      id: pId,
      logoUrl: partnerObj.image_url || partnerObj.logoUrl,
      color: color
    });
  };

  return (
    <div className="pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-8 pt-0 relative z-10">
        
        {/* 1. Profile Welcome Card */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121824] rounded-2xl px-5 py-[10px] border border-slate-800 mb-6 flex items-center gap-4 shadow-xl h-auto"
        >
          <div className="flex-shrink-0">
            <img 
              src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
              alt={user.displayName || 'User'} 
              className="w-11 h-11 rounded-full border border-emerald-500/20 object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-baseline gap-1.5">
              <span className="text-zinc-400 text-xs font-medium">Welcome back,</span>
              <h2 className="text-base font-black text-white leading-tight tracking-tight">
                {user.displayName || 'User'}!
              </h2>
            </div>
            <p className="text-[#00d074] text-[10px] font-black uppercase tracking-widest mt-0.5">
              Ready to earn more today?
            </p>
          </div>
        </motion.div>

        {/* 2. Available Networks Header */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-6"
        >
          <LayoutGrid className="w-6 h-6 text-[#00d074]" />
          <h2 className="text-xl font-bold text-white tracking-tight">Available Networks</h2>
        </motion.div>

        {/* 3. Offerwall Grid Cards */}
        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#00d074]/20 border-t-[#00d074] rounded-full animate-spin" />
          </div>
        ) : displayedPartners.length > 0 ? (
          <motion.div 
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.05 }
              }
            }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5"
          >
            {displayedPartners.map((partner, index) => {
              const pId = partner.id || index;
              const pColor = GLOBAL_OFFERWALLS.find(g => g.id === (partner.id || partner.name?.toLowerCase().replace(/\s+/g, '')))?.color || '#3b82f6';
              const pLogo = partner.image_url || partner.logoUrl;
              const pRating = typeof partner.rating === 'number' ? partner.rating : parseFloat(partner.rating) || 4.5;
              const pIsHot = partner.is_hot == 1 || partner.isHot;
              
              return (
              <motion.button
                key={pId}
                variants={{
                  hidden: { opacity: 0, scale: 0.95, y: 15 },
                  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } }
                }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePartnerClick(partner)}
                className="relative rounded-[26px] p-[2px] bg-gradient-to-r from-red-500 via-green-500 to-blue-500 bg-[length:200%_200%] animate-rgb-border hover:shadow-[0_0_20px_rgba(0,255,0,0.3)] transition-all duration-300 group overflow-hidden"
              >
                <div className="w-full h-full bg-[#121824] rounded-[24px] p-4 md:p-5 flex flex-col items-center justify-between relative z-10 overflow-hidden">
                  {/* Background ambient glow based on brand color */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-[0.15] transition-opacity duration-500 rounded-2xl pointer-events-none"
                    style={{ background: `radial-gradient(circle at center, ${pColor} 0%, transparent 80%)` }}
                  />

                  {/* Top row: Status dot + Hot badge */}
                  <div className="w-full flex justify-between items-start mb-2 relative z-10">
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                      <span className="text-emerald-500 text-[9px] font-bold uppercase tracking-wider">Active</span>
                    </div>
                    {pIsHot && (
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                        <Flame className="w-3 h-3 drop-shadow-md" /> HOT
                      </div>
                    )}
                  </div>

                  {/* Logo Area */}
                  <div className="relative flex-1 flex items-center justify-center w-full py-5">
                    {/* Glow behind logo */}
                    <div 
                      className="absolute inset-0 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                      style={{ backgroundColor: pColor, transform: 'scale(0.8)' }}
                    />
                    {pLogo ? (
                      <img 
                        src={pLogo} 
                        alt={partner.name} 
                        className="relative z-10 w-auto h-10 md:h-12 object-contain drop-shadow-lg group-hover:scale-110 group-hover:rotate-1 transition-transform duration-500" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="relative z-10 text-2xl font-black text-white">{partner.name}</div>
                    )}
                  </div>

                  {/* Title & Rating */}
                  <div className="w-full flex flex-col items-center gap-1 mt-2 relative z-10">
                    <h3 className="text-white font-bold uppercase tracking-wide text-sm md:text-base text-center w-full truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-colors">
                      {partner.name}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                      <span className="text-xs text-slate-400 font-medium">
                        {pRating.toFixed(1)} <span className="text-slate-600">/ 5.0</span>
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
              );
            })}
          </motion.div>
        ) : (
          <div className="py-12 bg-[#121824] rounded-3xl border border-slate-800 text-center">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active offerwalls found.</p>
          </div>
        )}
      </div>

      {/* Professional Modal System */}
      <OfferwallModal 
        isOpen={!!selectedPartner} 
        onClose={() => setSelectedPartner(null)} 
        partner={selectedPartner} 
      />
    </div>
  );
}
