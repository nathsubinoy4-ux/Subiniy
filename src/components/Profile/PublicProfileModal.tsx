import { safeFetch } from '../../lib/api';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, CheckCircle2, Wallet, Clock, Globe, Trophy, ArrowUpRight, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PublicUser {
  uid: string;
  username: string;
  avatar: string;
  country: string;
  totalEarned: number;
  isPrivate: boolean;
  recentOffers: {
    id: string;
    name: string;
    reward: number;
    type: 'offer' | 'withdrawal';
    time: string;
  }[];
}

function formatRelativeTime(timestamp: any) {
  if (!timestamp) return 'Just now';
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

interface PublicProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

export function PublicProfileModal({ isOpen, onClose, userId }: PublicProfileModalProps) {
  const [userData, setUserData] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      
      setLoading(true);
      setCurrentPage(1); 
      try {
        const res = await safeFetch(`/api/get_user_data?uid=${encodeURIComponent(userId)}`);
        const data = await res.json();
        
        if (data.status === 'success') {
          const recentOffers = (data.user_transactions || []).map((t: any) => ({
            id: t.id,
            name: t.offerName,
            reward: t.reward,
            type: t.type || 'offer',
            time: formatRelativeTime(t.createdAt)
          }));

          setUserData({
            uid: userId,
            username: data.username || 'User',
            avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
            country: 'Global',
            totalEarned: 0,
            isPrivate: false, // In MySQL we might need a settings field, for now default false
            recentOffers
          });
        }
      } catch (error) {
        console.error("Error fetching public user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && userId) {
      fetchUserData();
    }
  }, [isOpen, userId]);

  if (!userId) return null;

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = userData?.recentOffers.slice(indexOfFirstItem, indexOfLastItem) || [];
  const totalPages = userData ? Math.ceil(userData.recentOffers.length / itemsPerPage) : 0;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative flex flex-col w-full max-w-md mx-auto bg-[#0a0a0b] rounded-3xl border border-white/10 shadow-2xl overflow-hidden h-[700px]"
          >
            {/* Task 2: Clean Header & Back Button */}
            <div className="flex items-center p-5 border-b border-white/5 relative">
              <button 
                onClick={onClose} 
                className="flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-full transition-all text-sm font-medium"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <div className="absolute left-1/2 -translate-x-1/2">
                <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">User Profile</h2>
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Loading Profile...</p>
                </div>
              ) : userData ? (
                <>
                  {/* User Info (Below Header) */}
                  <div className="flex flex-col items-center text-center pt-8 pb-4 px-8">
                    <div className="w-20 h-20 rounded-[28px] border-4 border-emerald-500/20 p-1 bg-black overflow-hidden mb-3 shadow-lg shadow-emerald-500/5">
                      <img 
                        src={userData.avatar} 
                        alt={userData.username} 
                        className="w-full h-full object-cover rounded-[20px]" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight mb-1">{userData.username}</h3>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <div className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                        <Globe className="w-2.5 h-2.5 text-emerald-500" />
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{userData.country}</span>
                      </div>
                      <div className="px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center gap-1.5">
                        <Trophy className="w-2.5 h-2.5 text-purple-500" />
                        <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest">Verified</span>
                      </div>
                    </div>
                  </div>

                  {/* Task 3: Fix the Scrollable List (Prevent Overlapping) */}
                  {userData.isPrivate ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                        <div className="relative w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                          <Lock className="w-10 h-10 text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mt-8 tracking-tight">This Profile is Private</h3>
                      <p className="text-sm text-zinc-500 mt-3 max-w-[280px] leading-relaxed font-medium">
                        <span className="text-zinc-300 font-bold">{userData.username}</span>'s activity and offer history are hidden. You can only see basic profile info.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar">
                        <div className="flex items-center justify-between px-1 mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-zinc-500" />
                            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Recent Activity</h4>
                          </div>
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Feed</span>
                        </div>

                        <div className="space-y-2.5">
                          {currentItems.length > 0 ? (
                            currentItems.map((offer) => (
                              <div 
                                key={offer.id} 
                                className="flex items-center justify-between p-4 bg-[#121418]/50 border border-white/5 rounded-2xl group hover:bg-[#1a1c23] hover:border-white/10 transition-all duration-300"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 duration-300",
                                    offer.type === 'withdrawal' 
                                      ? "bg-orange-500/10 border-orange-500/20 text-orange-500" 
                                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                  )}>
                                    {offer.type === 'withdrawal' ? <ArrowUpRight className="w-4 h-4" /> : <Trophy className="w-4 h-4" />}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                                      {offer.type === 'withdrawal' ? `Withdraw: ${offer.name}` : offer.name}
                                    </span>
                                    <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider">{offer.time}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={cn(
                                    "text-xs font-black",
                                    offer.type === 'withdrawal' ? "text-orange-500" : "text-emerald-500"
                                  )}>
                                    {offer.type === 'withdrawal' ? '-' : '+'}{offer.reward.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 bg-white/[0.02] rounded-3xl border border-dashed border-white/5">
                              <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5">
                                <Clock className="w-6 h-6 text-zinc-700" />
                              </div>
                              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">No recent activity found</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Task 4: Sticky & Sleek Pagination Footer */}
                      <div className="mt-auto border-t border-white/10 bg-[#0a0a0b]/90 backdrop-blur-md p-4 flex flex-col gap-3 z-10">
                        {totalPages > 1 && (
                          <div className="flex justify-between items-center">
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              className="p-2.5 bg-[#121418] border border-white/10 rounded-xl hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-white shadow-lg"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Page</span>
                              <span className="text-sm text-white font-black">
                                {currentPage} <span className="text-zinc-600 mx-1">/</span> {totalPages}
                              </span>
                            </div>

                            <button
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                              className="p-2.5 bg-[#121418] border border-white/10 rounded-xl hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-white shadow-lg"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                        
                        <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                          <p className="text-[8px] font-medium text-zinc-600 text-center leading-relaxed uppercase tracking-wider">
                            Verified member of findejob.com • Activity logged in real-time
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-zinc-500 font-bold">User not found</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
