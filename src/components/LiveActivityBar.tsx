import { safeFetch } from '../lib/api';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

interface Activity {
  id: string;
  user: string;
  amount: number;
  time: string;
  avatar: string;
}

// Helper to mask username if needed
function maskUsername(username: string) {
  if (!username) return 'User';
  if (username.length <= 3) return username + '***';
  return username.substring(0, 3) + '***';
}

export function LiveActivityBar() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const { user } = useAuth();
  
  // Settings State
  const [feedSettings, setFeedSettings] = useState({
    enabled: true,
    scrolling: false,
    showUsername: true,
    showOffer: true
  });

  useEffect(() => {
    // Settings Fetch
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

    // Live Activity Fetch
    const load = async () => {
      try {
        const res = await safeFetch(`/api/get_live_activity`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data.status === 'success') {
          const act = data.activities.map((a: any) => ({
            id: a.id,
            user: a.username || 'Anonymous',
            amount: a.reward || 0,
            time: 'Just now',
            avatar: a.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.userId}`
          }));
          setActivities(act);
        }
      } catch (error: any) {
        if (error.message === 'Failed to fetch') {
           console.debug("Live Bar: Server unreachable or CORS blocked.");
        } else {
           console.error("Live Activity DB Error:", error);
        }
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
  }, [user]);

  if (!feedSettings.enabled) return null;
  if (activities.length === 0) return null;

  // Duplicate activities for smooth marquee
  const marqueeItems = [...activities, ...activities, ...activities];

  return (
    <div className="w-full overflow-hidden bg-[#1b1b22]/50 border-y border-white/5 py-3">
      <div className={cn(
        "flex items-center gap-4 whitespace-nowrap overflow-x-auto hide-scrollbar",
        feedSettings.scrolling ? "animate-marquee-bar" : ""
      )}>
        {marqueeItems.map((activity, index) => (
          <div 
            key={`${activity.id}-${index}`}
            className="inline-flex items-center gap-3 bg-[#1b1b22] border border-white/5 rounded-full px-4 py-1.5 shadow-sm shrink-0"
          >
            <img 
              src={activity.avatar} 
              alt={activity.user} 
              className="w-6 h-6 rounded-full border border-emerald-500/30 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                {feedSettings.showUsername ? activity.user : maskUsername(activity.user)}
              </span>
              <span className="text-[10px] font-black text-emerald-500">+{activity.amount.toLocaleString()} Coins</span>
              <span className="text-[10px] text-zinc-500 font-medium">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
      {feedSettings.scrolling && (
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee-bar-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33333%); }
          }
          .animate-marquee-bar {
            animation: marquee-bar-scroll 40s linear infinite;
          }
          .animate-marquee-bar:hover {
            animation-play-state: paused;
          }
        `}} />
      )}
    </div>
  );
}
