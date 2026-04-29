import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Shield, 
  Mail, 
  HelpCircle, 
  Facebook, 
  Send, 
  Star, 
  Wallet 
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Footer() {
  return (
    <footer className="bg-[#0b1120] bg-none relative z-10 border-t border-slate-800 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 items-start text-center lg:text-left mb-12">
          {/* Branding Column */}
          <div className="flex flex-col items-center lg:items-start">
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs transition-colors hover:text-zinc-400">
              The ultimate platform to earn rewards by completing simple remote tasks, surveys, and playing games.
            </p>
          </div>

          {/* About Column */}
          <div className="flex flex-col items-center lg:items-start">
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6 border-b border-emerald-500/30 pb-1">About Us</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/terms" className="text-zinc-500 hover:text-emerald-500 transition-colors flex items-center gap-3 text-sm font-medium justify-center lg:justify-start">
                  <FileText className="w-4 h-4" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-zinc-500 hover:text-emerald-500 transition-colors flex items-center gap-3 text-sm font-medium justify-center lg:justify-start">
                  <Shield className="w-4 h-4" />
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="flex flex-col items-center lg:items-start">
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6 border-b border-emerald-500/30 pb-1">Support</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/contact" className="text-zinc-500 hover:text-emerald-500 transition-colors flex items-center gap-3 text-sm font-medium justify-center lg:justify-start">
                  <Mail className="w-4 h-4" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-zinc-500 hover:text-emerald-500 transition-colors flex items-center gap-3 text-sm font-medium justify-center lg:justify-start">
                  <HelpCircle className="w-4 h-4" />
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Column */}
          <div className="flex flex-col items-center lg:items-start">
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6 border-b border-emerald-500/30 pb-1">Join Community</h4>
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <a 
                href="https://facebook.com/findejob" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 hover:bg-emerald-500 hover:text-white text-zinc-400 rounded-xl flex items-center justify-center transition-all border border-white/10 group active:scale-95"
              >
                <Facebook className="w-5 h-5 transition-transform group-hover:scale-110" />
              </a>
              <a 
                href="https://t.me/findejobofficials" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 hover:bg-emerald-500 hover:text-white text-zinc-400 rounded-xl flex items-center justify-center transition-all border border-white/10 group active:scale-95"
              >
                <Send className="w-5 h-5 transition-transform group-hover:scale-110" />
              </a>
            </div>
            <p className="mt-4 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Follow for updates</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-zinc-600 text-[11px] font-bold uppercase tracking-wider">
            findejob.com | All rights reserved © 2026
          </p>
          <div className="flex items-center gap-8">
            <span className="hidden sm:inline-block text-zinc-700 text-[9px] uppercase tracking-[0.3em] font-black">Verified Secure</span>
            <div className="flex items-center gap-5">
              {/* PayPal */}
              <svg className="h-4 w-auto text-zinc-600 hover:text-white transition-all duration-300 cursor-pointer fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.067 8.478c.492.88.556 2.014.307 3.292-.572 2.934-2.456 4.944-5.155 4.944H12.54c-.437 0-.794.351-.841.786l-.582 5.334c-.012.11-.103.193-.21.193H8.292a.215.215 0 0 1-.21-.242l1.05-9.627c.046-.425.408-.744.835-.744h3.3c2.158 0 4.102-1.061 4.803-3.592.138-.498.227-.983.227-1.441 0-.481-.1-.926-.28-1.337L20.067 8.478zM17.644 4.127c.054.19.085.39.085.61 0 1.294-.416 2.49-1.157 3.434-.813 1.039-2.011 1.71-3.372 1.71h-3.3c-.437 0-.794.351-.841.786l-.582 5.334c-.012.11-.103.193-.21.193H5.667a.215.215 0 0 1-.21-.242l1.61-14.76c.046-.425.408-.744.835-.744h5.226c1.479 0 2.758.346 3.663 1.033.63.48.993 1.145 1.053 1.886.01.12.015.24.015.36 0 .44-.067.85-.185 1.23z"/>
              </svg>
              {/* Bitcoin */}
              <svg className="h-4 w-auto text-zinc-600 hover:text-white transition-all duration-300 cursor-pointer fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.638 14.904c-1.391 5.589-7.078 8.992-12.664 7.601-5.585-1.39-8.991-7.077-7.602-12.666C4.763 4.251 10.449.844 16.035 2.236c5.587 1.391 8.993 7.078 7.603 12.668zm-6.351-5.232c.302-2.022-1.235-3.11-3.337-3.834l.682-2.735-1.664-.415-.665 2.668c-.437-.11-.886-.213-1.331-.319l.67-2.688-1.665-.414-.682 2.735c-.363-.083-.717-.162-1.063-.246l.002-.008-2.299-.573-.443 1.78s1.237.283 1.211.3.675.169.797.617.777.974l-.778 3.123c.046.012.107.027.173.051-.073-.019-.15-.038-.228-.057l-1.09 4.37c-.082.205-.292.514-.763.397.02.028-1.211-.302-1.211-.302l-.828 1.91 2.169.541c.404.1.8.204 1.19.303l-.688 2.76 1.664.415.683-2.74c.455.123.899.24 1.335.352l-.677 2.716 1.665.415.688-2.759c2.844.539 4.985.321 5.886-2.251.727-2.072.035-3.27-1.462-4.056.724-.167 1.269-.645 1.415-1.627zm-2.537 4.436c-.516 2.072-4.008.952-5.14.669l.917-3.682c1.132.282 4.758.841 4.223 3.013zm.517-4.462c-.47 1.885-3.378.928-4.321.693l.832-3.342c.943.236 3.98.676 3.489 2.649z"/>
              </svg>
              {/* Litecoin */}
              <svg className="h-4 w-auto text-zinc-600 hover:text-white transition-all duration-300 cursor-pointer fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm-1.037-11.458l.714-2.857H8.81l.428-1.714h2.857l.714-2.857h2.143l-.714 2.857H16.4l-.428 1.714h-2.143l-.714 2.857h3.571l-.428 1.714H9.524l.714-2.857h.725z"/>
              </svg>
              {/* Visa */}
              <svg className="h-4 w-auto text-zinc-600 hover:text-white transition-all duration-300 cursor-pointer fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.191 14.718l1.644-10.233h2.615l-1.644 10.233h-2.615zm9.29-10.233c-.507 0-.934.295-1.138.784l-3.977 9.449h2.735l.544-1.504h3.322l.314 1.504h2.41l-2.21-10.233h-2zm-1.048 6.225l1.355-3.733.776 3.733h-2.131zm-15.341-6.225l-2.545 7.021-.272-1.357c-.466-1.583-1.907-3.292-3.515-4.152l2.278 8.721h2.748l4.096-10.233h-2.79zm-1.902 0h-4.19l-.042.2c3.259.83 5.412 2.832 6.304 5.257l-.914-4.457c-.156-.773-.713-1.001-1.158-1.001z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
