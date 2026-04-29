import { safeFetch } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';

interface Activity {
  id: string;
  userId: string;
  userAvatar: string;
  username: string;
  offerName: string;
  reward: number;
  type?: 'offer' | 'withdrawal';
  createdAt: any;
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

// Helper to mask username if needed
function maskUsername(username: string) {
  if (!username) return 'User';
  if (username.length <= 3) return username + '***';
  return username.substring(0, 3) + '***';
}

interface LiveActivityTickerProps {
  onUserClick: (userId: string) => void;
}

export function LiveActivityTicker({ onUserClick }: LiveActivityTickerProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  
  // Settings State
  const [feedSettings, setFeedSettings] = useState({
    enabled: true,
    scrolling: false,
    showUsername: true,
    showOffer: true
  });

  // Update "now" every minute to refresh relative times
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // PHP Settings Fetch
    const fetchSettings = async () => {
      try {
        const res = await safeFetch('/api/get_settings');
        const data = await res.json();
        if (data.status === 'success') {
          const s = data.settings;
          setFeedSettings({
            enabled: s.liveFeedEnabled !== false,
            scrolling: s.liveFeedScrolling === true,
            showUsername: s.liveFeedShowUsername !== false,
            showOffer: s.liveFeedShowOffer !== false
          });
        }
      } catch (err) {
        console.error("Settings API Error:", err);
      }
    };
    
    fetchSettings();
    const settingsInterval = setInterval(fetchSettings, 60000);

    // PHP Live Activity Fetch
    const load = async () => {
      try {
        const res = await safeFetch(`/api/get_live_activity`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data.status === 'success') {
          setActivities(data.activities || []);
        }
        setLoading(false);
      } catch (error: any) {
        // If it's a "Failed to fetch", it's likely a CORS issue or the server is down
        if (error.message === 'Failed to fetch') {
          console.debug("Live Feed: Server unreachable or CORS blocked. This is expected if the external backend is not yet configured.");
        } else {
          console.error("Live Activity DB Error:", error);
        }
        setLoading(false);
      }
    };

    load();
    const intervalId = setInterval(load, 15000);

    const handleForceRefresh = () => load();
    window.addEventListener('refresh_live_feed', handleForceRefresh);
    window.addEventListener('refresh_balance', handleForceRefresh);

    return () => {
      clearInterval(settingsInterval);
      clearInterval(intervalId);
      window.removeEventListener('refresh_live_feed', handleForceRefresh);
      window.removeEventListener('refresh_balance', handleForceRefresh);
    };
    // MYSQL API FETCH LOGIC END
  }, [user]);

  // Handle disabled state
  if (!feedSettings.enabled) {
    return null;
  }

  // Handle Loading/Empty State
  if (loading || activities.length === 0) {
    return (
      <div className="w-full bg-black/40 border-b border-white/5 overflow-hidden py-1">
        <div className="flex gap-3 px-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="inline-flex items-center gap-2 bg-[#121418] border border-white/5 rounded-full px-3 py-1 opacity-50">
              <div className="w-5 h-5 rounded-full bg-zinc-800" />
              <div className="flex flex-col gap-0.5">
                <div className="w-20 h-2 bg-zinc-800 rounded" />
                <div className="w-12 h-2 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If scrolling is ON, we need enough items to scroll indefinitely. Duplicate the list just like LiveActivityBar does.
  const displayActivities = feedSettings.scrolling 
    ? [...activities, ...activities, ...activities].map((act, idx) => ({ ...act, uniqueId: `${act.id}-${idx}` }))
    : activities.map(act => ({ ...act, uniqueId: act.id }));

  return (
    <div className="w-full bg-black/40 border-b border-white/5 py-1.5 overflow-hidden">
      <div className="flex overflow-x-hidden hide-scrollbar max-w-full">
        <div className={cn(
          "flex items-center gap-4 px-4 w-max min-w-full",
          feedSettings.scrolling ? "animate-marquee" : ""
        )}>
          <AnimatePresence initial={false}>
            {displayActivities.map((activity) => (
              <motion.div
                layout
                initial={feedSettings.scrolling ? {} : { opacity: 0, x: -30, scale: 0.9 }}
                animate={feedSettings.scrolling ? {} : { opacity: 1, x: 0, scale: 1 }}
                exit={feedSettings.scrolling ? {} : { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                key={activity.uniqueId}
                className="inline-flex flex-row items-center gap-3 bg-[#121418] border border-white/5 rounded-full px-4 py-1 shadow-lg shrink-0"
              >
                <button 
                  onClick={() => {
                    if (activity.userId) {
                      onUserClick(activity.userId);
                    } else {
                      console.warn("Activity missing userId:", activity);
                    }
                  }}
                  className={cn(
                    "w-7 h-7 rounded-full overflow-hidden border transition-all flex-shrink-0",
                    activity.userId 
                      ? "border-emerald-500/30 hover:border-emerald-500 cursor-pointer" 
                      : "border-zinc-700 cursor-default"
                  )}
                >
                  <img 
                    src={activity.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.userId}`}
                    alt={activity.username} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </button>
                <div className="flex flex-col leading-tight justify-center py-0.5">
                  <span className="text-xs font-bold text-white mb-0.5">
                    {feedSettings.showUsername ? activity.username : maskUsername(activity.username)}
                  </span>
                  <span className="text-[11px] font-medium text-zinc-400">
                    {activity.type === 'withdrawal' ? 'withdrawn' : 'completed'} 
                    {feedSettings.showOffer ? ` ${activity.offerName}` : ' an offer'}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-0.5 justify-center ml-2">
                  <span className={cn(
                    "text-sm font-black",
                    activity.type === 'withdrawal' ? "text-orange-500" : "text-[#00d074]"
                  )}>
                    {activity.type === 'withdrawal' ? '-' : '+'}{activity.reward}
                  </span>
                  <span className="text-[10px] font-medium text-zinc-600">
                    {formatRelativeTime(activity.createdAt)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      {feedSettings.scrolling && (
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33333%); }
          }
          .animate-marquee {
            animation: marquee-scroll 30s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}} />
      )}
    </div>
  );
}

