import React, { useState } from 'react';
import { Rocket, Eye, EyeOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialMode = 'signup' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { email, password, rememberMe, mode });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#111116]/90 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-[92%] max-w-[440px] z-10"
          >
            {/* Form Card */}
            <div className="bg-[#1e293b] border border-slate-700 rounded-[32px] overflow-hidden shadow-2xl shadow-[#00ff88]/10 relative">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                  {mode === 'signin' ? 'Sign In' : 'Sign Up'}
                </h2>
                <button 
                  onClick={onClose}
                  className="text-zinc-500 hover:text-white transition-colors p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 md:p-10">
                {/* Navigation Toggles */}
                <div className="flex items-center bg-[#111114] p-1.5 rounded-2xl gap-1 mb-10">
                  <button
                    onClick={() => setMode('signin')}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-black transition-all uppercase tracking-widest",
                      mode === 'signin' 
                        ? "bg-brand-500 text-zinc-950 shadow-lg" 
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setMode('signup')}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-black transition-all uppercase tracking-widest",
                      mode === 'signup' 
                        ? "bg-brand-500 text-zinc-950 shadow-lg" 
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    Sign Up
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-slate-900 border border-slate-600 rounded-2xl px-5 py-4 text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500/50 transition-all font-medium"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Password</label>
                      {mode === 'signin' && (
                        <button type="button" className="text-xs font-bold text-brand-500 hover:underline">
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-600 rounded-2xl px-5 py-4 text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500/50 transition-all font-medium pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me / Terms Checkbox */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 border-2 border-slate-700 rounded-md bg-slate-900 peer-checked:bg-[#00ff88] peer-checked:border-[#00ff88] transition-all flex items-center justify-center">
                        <svg className="w-3 h-3 text-zinc-950 opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-zinc-400 group-hover:text-zinc-300 transition-colors">
                      {mode === 'signup' ? 'I agree to the terms and conditions' : 'Remember Me'}
                    </span>
                  </label>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-[#00ff88] hover:bg-[#00ffa2] text-black font-black py-4 rounded-2xl transition-all shadow-xl shadow-[#00ff88]/20 active:scale-[0.98] text-lg uppercase tracking-tight"
                  >
                    {mode === 'signup' ? 'Register' : 'Login'}
                  </button>

                  {/* Footer Links */}
                  <div className="text-center pt-2">
                    <p className="text-sm font-medium text-zinc-500">
                      {mode === 'signup' ? (
                        <>
                          Already have an account?{' '}
                          <button 
                            type="button"
                            onClick={() => setMode('signin')}
                            className="text-brand-500 font-bold hover:underline"
                          >
                            Sign in instead
                          </button>
                        </>
                      ) : (
                        <>
                          New on our platform?{' '}
                          <button 
                            type="button"
                            onClick={() => setMode('signup')}
                            className="text-brand-500 font-bold hover:underline"
                          >
                            Create an account
                          </button>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500">
                      <span className="bg-slate-800 px-4">or</span>
                    </div>
                  </div>

                  {/* Guest Button */}
                  <button
                    type="button"
                    onClick={() => {
                      signIn();
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-[#1e293b] text-white border border-white/10 font-black py-4 rounded-2xl hover:bg-[#2a374a] transition-all shadow-sm text-xs uppercase tracking-widest group"
                  >
                    <span className="text-xl">🎲</span>
                    Continue as Guest
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
