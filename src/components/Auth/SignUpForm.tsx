import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Dices, RefreshCw, X } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

const ADJECTIVES = ['Savage', 'Pro', 'Elite', 'Epic', 'Golden', 'Swift', 'Mega', 'Ultra', 'Neon', 'Shadow'];
const NOUNS = ['Warlock', 'Earner', 'Hunter', 'King', 'Ninja', 'Rider', 'Ghost', 'Titan', 'Wolf', 'Dragon'];

interface SignUpFormProps {
  embedded?: boolean;
  onClose?: () => void;
}

export function SignUpForm({ embedded = false, onClose }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const generateRandomUsername = () => {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(Math.random() * 999);
    const newUsername = `${adj}${noun}${num}`;
    setUsername(newUsername);
  };

  const generateAvatarOptions = () => {
    const options = Array.from({ length: 6 }, () => {
      const randomSeed = Math.random().toString(36).substring(7);
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;
    });
    setAvatarOptions(options);
    if (!avatarUrl) setAvatarUrl(options[0]);
  };

  React.useEffect(() => {
    generateAvatarOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !username || !avatarUrl) {
      console.warn('Please fill in all fields and choose an avatar.');
      return;
    }

    if (!agree) {
      console.warn('You must agree to the terms and conditions.');
      return;
    }

    setLoading(true);
    try {
      const referrerUid = localStorage.getItem('referrerUid');
      await signUp(email, password, {
        displayName: username,
        photoURL: avatarUrl,
        referrerUid: referrerUid || null
      });
      if (referrerUid) {
        localStorage.removeItem('referrerUid');
      }
    } catch (error: any) {
      console.error("API Error:", error);
      alert(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const formWrapperClasses = cn(
    "relative w-full overflow-hidden",
    !embedded && "w-[92%] max-w-[440px] bg-[#1e293b] border border-slate-700 rounded-none shadow-2xl shadow-[#00ff88]/10 flex flex-col max-h-[85vh]",
    embedded && "w-full lg:w-full max-w-md mx-auto lg:mx-0 p-0 relative"
  );

  return (
    <motion.div
      initial={!embedded ? { opacity: 0, y: 20 } : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={formWrapperClasses}
    >
      {!embedded && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
          <h2 className="text-lg font-black text-white uppercase tracking-tight">Sign Up</h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      <div className={cn("p-4 md:p-5", embedded ? "bg-[#1e293b]/90 backdrop-blur-[20px] border border-slate-700 rounded-none px-6 py-5 md:px-8 lg:p-5 shadow-2xl shadow-[#00ff88]/10" : "overflow-y-auto hide-scrollbar")}>
        <div className="text-center mb-3 lg:mb-2">
          <h2 className="text-xl font-bold text-white lg:text-lg">
            Create account Now <span className="text-[#10d876]">free</span>
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-2 lg:space-y-1.5 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-1.5">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 transition-all text-sm font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 transition-all text-sm font-medium pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Username</label>
              <button
                type="button"
                onClick={generateRandomUsername}
                className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400"
              >
                <Dices className="w-3 h-3" />
                Randomize
              </button>
            </div>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Pick a username"
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 transition-all text-sm font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Choose Your Avatar</label>
              <button
                type="button"
                onClick={generateAvatarOptions}
                className="text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:text-white"
              >
                Refresh
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2 lg:gap-1.5">
              {avatarOptions.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatarUrl(url)}
                  className={cn(
                    "relative aspect-square rounded-xl lg:rounded-lg border-2 transition-all overflow-hidden bg-slate-900 group",
                    avatarUrl === url 
                      ? "border-emerald-500 scale-110 lg:scale-105 z-10 shadow-lg shadow-emerald-500/20" 
                      : "border-white/5 hover:border-white/20"
                  )}
                >
                  <img 
                    src={url} 
                    alt={`Avatar ${i}`} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {avatarUrl === url && (
                    <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer group mt-2">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-slate-700 rounded-lg bg-slate-900 peer-checked:bg-[#00ff88] peer-checked:border-[#00ff88] transition-all flex items-center justify-center">
                <svg className="w-3 h-3 text-black opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300">
              I agree to the <Link to="/terms" className="text-emerald-500 hover:underline">Terms</Link> & <Link to="/privacy" className="text-emerald-500 hover:underline">Privacy</Link>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || !agree}
            className="w-full bg-[#00ff88] hover:bg-[#00ffa2] disabled:opacity-50 disabled:cursor-not-allowed text-black font-black py-3 lg:py-2.5 rounded-2xl transition-all shadow-xl shadow-[#00ff88]/20 active:scale-[0.98] text-sm uppercase tracking-widest flex items-center justify-center gap-3 mt-3 lg:mt-2"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              'Create My Account'
            )}
          </button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em] text-zinc-500">
              <span className="bg-[#1e293b] px-4">Instant Access</span>
            </div>
          </div>

          <button
            type="button"
            onClick={signIn}
            className="w-full flex items-center justify-center gap-3 bg-[#1e293b] text-white font-black py-3 lg:py-2 rounded-2xl border border-white/10 hover:bg-[#2a374a] transition-all shadow-sm text-xs uppercase tracking-widest"
          >
            <Dices className="w-5 h-5 text-emerald-500" />
            Continue as Guest
          </button>
          
          <p className="text-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-3">
            Already have an account? <Link to="/signin" className="text-emerald-500 hover:text-emerald-400">Sign in here</Link>
          </p>
        </form>
      </div>
    </motion.div>
  );
}
