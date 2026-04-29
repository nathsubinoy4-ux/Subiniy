import { safeFetch } from '../../lib/api';
import React, { useState, useEffect } from 'react';
import { GLOBAL_OFFERWALLS } from '../../config/offerwalls';

export function OfferwallPartners() {
  const [activeSettings, setActiveSettings] = useState<any[]>([]);
  
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
        console.error("Offerwalls API Error:", err);
      }
    };
    fetchSettings();
  }, []);

  // Show inactive partners too on the landing page for visual appeal, but use custom logos if set
  // If backend returned none, fallback to GLOBAL_OFFERWALLS
  const displayedPartners = activeSettings.length > 0 ? activeSettings : GLOBAL_OFFERWALLS;

  if (displayedPartners.length === 0) return null;

  // Double the list for seamless marquee
  const marqueeItems = [...displayedPartners, ...displayedPartners];

  return (
    <section className="py-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-10 text-center">
        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Our Trusted Partners</h3>
      </div>

      <div className="flex overflow-hidden relative group">
        <div className="flex animate-marquee hover:[animation-play-state:paused] gap-6 whitespace-nowrap">
          {marqueeItems.map((partner, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-48 h-24 p-[2px] rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient relative overflow-hidden"
            >
              {/* Inner container for contrast */}
              <div className="w-full h-16 bg-slate-900/95 backdrop-blur-sm rounded-[14px] flex items-center justify-center p-6">
                <img
                  src={partner.image_url || partner.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${partner.name}`}
                  alt={partner.name}
                  style={{ width: '130px', height: '60px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Gradient Overlays for smooth edges */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#111116] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#111116] to-transparent z-10 pointer-events-none" />
      </div>
    </section>
  );
}
