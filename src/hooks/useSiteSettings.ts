import { safeFetch } from '../lib/api';
import { useState, useEffect } from 'react';

export interface SiteSettings {
  headerLogo: string;
  heroText: string;
  heroBtnText: string;
  heroBtnColor: string;
  topOfferName: string;
  topOfferCompletions: string;
  topOfferIcon: string;
  siteTitle?: string;
  siteDescription?: string;
  metaDescription?: string;
  ogTitle?: string;
  faviconUrl?: string;
  ogImageUrl?: string;
  ogImage?: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  headerLogo: '',
  heroText: 'Earn money for every task you complete online.',
  heroBtnText: 'Start Earning Now',
  heroBtnColor: '#10b981',
  topOfferName: 'Dice Dream',
  topOfferCompletions: '1.2K',
  topOfferIcon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/bc/b2/9c/bcb29cc9-435c-4e27-b14c-1a927cce74f3/AppIcon-0-0-1x_U007emarketing-0-6-0-85-220.png/512x512bb.jpg',
  siteTitle: 'findejob.com',
  siteDescription: 'Earn money for every task you complete online.',
  metaDescription: 'Earn money for every task you complete online.',
  ogTitle: 'findejob.com - Earn Rewards',
  faviconUrl: '/vite.svg',
  ogImageUrl: '',
  ogImage: ''
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await safeFetch('/api/get_settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      if (data.status === 'success') {
        const s = data.settings;
        setSettings(prev => ({
          ...prev,
          siteTitle: s.siteName || s.siteTitle || prev.siteTitle,
          heroText: s.heroText || prev.heroText,
          heroBtnText: s.heroBtnText || prev.heroBtnText,
          heroBtnColor: s.heroBtnColor || prev.heroBtnColor,
          headerLogo: s.headerLogo || prev.headerLogo,
          faviconUrl: s.faviconUrl || prev.faviconUrl,
        }));
      }
    } catch (err: any) {
      console.error('Settings API Error:', err);
      setError(err.message || 'Failed to connect');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, error, retry: fetchSettings };
}
