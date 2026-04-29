import { safeFetch } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

interface Partner {
  id: string;
  name: string;
  logoUrl: string | null;
  gradient: string;
  textColor: string;
}

const offerPartners: Partner[] = [
  { 
    id: 'notik', 
    name: 'NOTIK', 
    logoUrl: 'https://i.ibb.co/wFXR620x/Notik.png', 
    gradient: 'bg-gradient-to-br from-gray-200 to-gray-400', 
    textColor: 'text-black' 
  },
  { 
    id: 'radientwall', 
    name: 'RADIENTWALL', 
    logoUrl: 'https://i.ibb.co/fdHv9nM7/Radientwall.png', 
    gradient: 'bg-gradient-to-br from-gray-100 to-gray-300', 
    textColor: 'text-black' 
  },
  { 
    id: 'revtoo', 
    name: 'REVTOO', 
    logoUrl: 'https://i.ibb.co/Pvr8W5pj/Revtoo.jpg', 
    gradient: 'bg-gradient-to-br from-indigo-600 to-indigo-800', 
    textColor: 'text-white' 
  },
  { 
    id: 'offery', 
    name: 'OFFERY', 
    logoUrl: 'https://i.ibb.co/hJgyx5NT/Offery.png', 
    gradient: 'bg-gradient-to-br from-neutral-900 to-black', 
    textColor: 'text-white' 
  },
  { 
    id: 'vortexwall', 
    name: 'VORTEXWALL', 
    logoUrl: 'https://i.ibb.co/HLzhDGVW/Vortexwall.png', 
    gradient: 'bg-gradient-to-br from-blue-600 to-blue-800', 
    textColor: 'text-white' 
  },
  { 
    id: 'gemiad', 
    name: 'GEMIAD', 
    logoUrl: 'https://i.ibb.co/rRXFKhF7/Gemi-Ad.png', 
    gradient: 'bg-gradient-to-br from-[#e879f9] to-[#86198f]', 
    textColor: 'text-white' 
  },
  { 
    id: 'pixylabs', 
    name: 'PIXYLABS', 
    logoUrl: 'https://i.ibb.co/TM7zGYbz/Pixy-Labs.png', 
    gradient: 'bg-gradient-to-br from-amber-400 to-orange-500', 
    textColor: 'text-black' 
  },
  { 
    id: 'monlix', 
    name: 'MONLIX', 
    logoUrl: 'https://i.ibb.co/wFXR620x/Notik.png', 
    gradient: 'bg-gradient-to-br from-emerald-600 to-emerald-900', 
    textColor: 'text-white' 
  },
  { 
    id: 'cpxresearch', 
    name: 'CPX RESEARCH', 
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=CPX', 
    gradient: 'bg-gradient-to-br from-zinc-400 to-zinc-600', 
    textColor: 'text-white' 
  },
  { 
    id: 'ayetstudios', 
    name: 'AYETSTUDIOS', 
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=AYET', 
    gradient: 'bg-gradient-to-br from-pink-500 to-pink-700', 
    textColor: 'text-white' 
  },
  { 
    id: 'lootably', 
    name: 'LOOTABLY', 
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=LOOT', 
    gradient: 'bg-gradient-to-br from-cyan-500 to-cyan-700', 
    textColor: 'text-white' 
  },
  { 
    id: 'bitlabs', 
    name: 'BITLABS', 
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=BIT', 
    gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-700', 
    textColor: 'text-white' 
  },
];

interface PartnerCardProps {
  partner: Partner;
  onClick: () => void;
}

function PartnerCard({ partner, onClick }: PartnerCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, translateY: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative w-[160px] h-[190px] rounded-[24px] flex-none snap-start overflow-hidden flex flex-col items-center justify-between bg-gradient-to-br border border-white/10 shadow-2xl shadow-black transition-all duration-300 p-4 group",
        partner.gradient
      )}
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Logo Container */}
      <div className="flex-1 flex items-center justify-center w-full h-16">
        {partner.logoUrl ? (
          <img
            src={partner.logoUrl}
            alt={partner.name}
            style={{ width: '130px', height: '60px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={cn("text-4xl font-black tracking-tighter drop-shadow-lg", partner.textColor)}>
            {partner.name.substring(0, 1)}
          </div>
        )}
      </div>
      
      {/* Partner Name */}
      <div className="w-full">
        <p className={cn(
          "text-center font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] drop-shadow-md",
          partner.textColor
        )}>
          {partner.name}
        </p>
        <div className="h-0.5 w-8 bg-white/30 mx-auto mt-2 rounded-full group-hover:w-12 transition-all" />
      </div>
    </motion.button>
  );
}

export function HomePartners() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSettings, setActiveSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await safeFetch('/api/get_offerwalls');
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error("Invalid JSON from get_offerwalls.php:", text);
          return;
        }
        
        let networks: any[] = [];
        if (Array.isArray(data)) {
          networks = data;
        } else if (data.offerwalls && Array.isArray(data.offerwalls)) {
          networks = data.offerwalls;
        } else if (data.data && Array.isArray(data.data)) {
          networks = data.data;
        }
        setActiveSettings(networks);
      } catch (err) {
        console.error("HomePartners API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Filter partners. Default to true if not explicitly set to false in the database.
  // We use the fetched data if present.
  const displayedPartnersRaw = activeSettings.length > 0 ? activeSettings.filter((p: any) => p.is_active == 1 || p.isActive === true) : offerPartners;
  
  // Map back to Partner structure
  const displayedPartners: Partner[] = displayedPartnersRaw.map((p: any, idx: number) => {
    const pId = p.id || p.name?.toLowerCase().replace(/\s+/g, '') || String(idx);
    const existing = offerPartners.find(o => o.id === pId);
    return {
      id: pId,
      name: p.name,
      logoUrl: p.image_url || p.logoUrl || existing?.logoUrl || null,
      gradient: existing?.gradient || 'bg-gradient-to-br from-gray-200 to-gray-400',
      textColor: existing?.textColor || 'text-black'
    };
  });

  const handlePartnerClick = (partnerId: string) => {
    if (!user) {
      navigate('/signup');
      return;
    }
    navigate(`/offerwalls?partner=${partnerId}`);
  };

  if (user && loading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (user && displayedPartners.length === 0 && !loading) {
    return null; // Or show a message
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-emerald-500" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight uppercase">Offer Partners</h2>
        </div>
        <button 
          onClick={() => navigate(user ? '/offerwalls' : '/signup')}
          className="text-[10px] font-black text-zinc-500 hover:text-emerald-500 uppercase tracking-widest transition-colors"
        >
          View All
        </button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-6 -mx-4 px-4 md:mx-0 md:px-0">
        {displayedPartners.map((partner) => (
          <PartnerCard 
            key={partner.id} 
            partner={partner} 
            onClick={() => handlePartnerClick(partner.id)}
          />
        ))}
      </div>
    </div>
  );
}
