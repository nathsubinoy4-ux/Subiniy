import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import { OfferwallViewer } from './OfferwallViewer';
import { cn } from '../lib/utils';

interface OfferwallModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: {
    id: string;
    name: string;
    logoUrl: string;
    color: string;
  } | null;
}

export function OfferwallModal({ isOpen, onClose, partner }: OfferwallModalProps) {
  // Prevent background scroll and hide global UI
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('offerwall-modal-open');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('offerwall-modal-open');
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('offerwall-modal-open');
    };
  }, [isOpen]);

  if (!partner) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/80 backdrop-blur-md p-0 md:p-4 overflow-hidden"
        >
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={onClose} />

          <div
            className={cn(
              "relative z-[1000001] w-full h-full md:w-[90vw] md:max-w-[1000px] md:h-[90vh] bg-[#0a0a0b] flex flex-col overflow-hidden shadow-[0_50px_120px_rgba(0,0,0,1)] border border-emerald-500/20 md:rounded-[32px]",
              "before:absolute before:inset-0 before:bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] before:opacity-[0.02] before:pointer-events-none"
            )}
          >
            {/* Pulsing Emerald Edge Border */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent animate-pulse pointer-events-none" />

            {/* Modal Header - Refined look */}
            <div className="flex items-center justify-between px-5 py-4 md:px-8 md:py-5 border-b border-white/5 bg-[#0f0f12] relative z-10">
              <div className="flex items-center gap-4">
                {/* Logo Circle */}
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/5 flex items-center justify-center p-2 border border-white/10 shadow-inner overflow-hidden">
                  <img 
                    src={partner.logoUrl} 
                    alt={partner.name} 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm md:text-lg font-black text-white tracking-tight uppercase">
                      {partner.name}
                    </h2>
                    <div className="bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Verified Provider</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none">
                      SECURE GATEWAY ENCRYPTION ACTIVE
                    </p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={onClose}
                className="p-3 bg-white/5 hover:bg-red-500/10 rounded-xl transition-all text-zinc-500 hover:text-red-500 group active:scale-95"
              >
                <X className="w-6 h-6 transition-transform group-hover:rotate-90 duration-300" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative bg-[#0a0a0b] overflow-hidden flex flex-col">
              {/* Iframe */}
              <div className="flex-1 w-full h-full relative z-10 flex flex-col">
                <OfferwallViewer partnerId={partner.id} />
              </div>
            </div>

            {/* Bottom Accent */}
            <div className="h-2 w-full bg-[#0f0f12] border-t border-white/5 flex items-center justify-center">
              <div className="w-24 h-[3px] bg-white/10 rounded-full" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
