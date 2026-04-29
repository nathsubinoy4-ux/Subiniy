import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Eye, EyeOff, X, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

export function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signInWithEmail, signInWithUsername } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Basic check to see if it's an email or username
      if (identifier.includes('@')) {
        await signInWithEmail(identifier, password);
      } else {
        await signInWithUsername(identifier, password);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111116] flex flex-col items-center justify-center p-4 selection:bg-brand-500 selection:text-zinc-950">
      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-[92%] max-w-[440px] bg-[#1e293b] border border-slate-700 rounded-none overflow-hidden shadow-2xl shadow-[#00ff88]/20 flex flex-col max-h-[85vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
          <h2 className="text-lg font-black text-white uppercase tracking-tight">Sign In</h2>
          <Link to="/" className="text-zinc-500 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </Link>
        </div>

        <div className="p-4 md:p-5 overflow-y-auto hide-scrollbar">
          {error && (
            <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">
            {/* Identifier Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Username or Email</label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter username or email"
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500/50 transition-all text-sm font-medium"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[10px] font-bold text-brand-500 hover:underline">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500/50 transition-all text-sm font-medium pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-4 h-4 border-2 border-slate-700 rounded bg-slate-900 peer-checked:bg-[#00ff88] peer-checked:border-[#00ff88] transition-all flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-zinc-950 opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <span className="text-[11px] font-bold text-zinc-400 group-hover:text-zinc-300 transition-colors">
                Remember Me
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00ff88] hover:bg-[#00ffa2] disabled:opacity-50 disabled:cursor-not-allowed text-black font-black py-4 rounded-xl transition-all shadow-xl shadow-[#00ff88]/20 active:scale-[0.98] text-sm uppercase tracking-tight flex items-center justify-center gap-2"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              {loading ? 'Logging in...' : 'Login'}
            </button>

            {/* Footer Links */}
            <div className="text-center">
              <p className="text-[11px] font-medium text-zinc-500">
                New here?{' '}
                <Link to="/signup" className="text-brand-500 font-bold hover:underline">
                  Create account
                </Link>
              </p>
            </div>

            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[9px] uppercase font-black tracking-[0.2em] text-zinc-500">
                <span className="bg-[#1e293b] px-3">or</span>
              </div>
            </div>

            {/* Guest Button */}
            <button
              type="button"
              onClick={signIn}
              className="w-full flex items-center justify-center gap-2 bg-[#1e293b] text-white border border-white/10 font-black py-3 rounded-xl hover:bg-[#2a374a] transition-all shadow-sm group text-xs uppercase tracking-widest"
            >
              <span className="text-sm">🎲</span>
              Continue as Guest
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
