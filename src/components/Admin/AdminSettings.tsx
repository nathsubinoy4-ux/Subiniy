import { safeFetch } from '../../lib/api';
import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon,
  Shield,
  Bell,
  Globe,
  Database,
  Save,
  AlertCircle,
  Lock,
  Coins,
  TrendingUp,
  Share2,
  Image as ImageIcon,
  Upload,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

export function AdminSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'findejob.com',
    coinValue: 0.001,
    minWithdrawal: 5000,
    referralBonus: 500,
    maintenanceMode: false,
    registrationEnabled: true,
    liveFeedEnabled: true,
    liveFeedScrolling: false,
    liveFeedShowUsername: true,
    liveFeedShowOffer: true
  });

  const [seo, setSeo] = useState({
    siteTitle: 'findejob.com - Earn Visa & Crypto',
    metaDescription: 'Earn money for every task you complete online. Simple, fast, and secure.',
    ogImage: 'https://picsum.photos/seed/findejob-seo/1200/630',
    faviconUrl: '/vite.svg'
  });

  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingOgImage, setUploadingOgImage] = useState(false);

  const handleOgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit for OG Image
      toast.error('Social Image file is too large. Max size is 2MB.');
      return;
    }

    setUploadingOgImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setSeo(prev => ({ ...prev, ogImage: base64String }));
      setUploadingOgImage(false);
      toast.success('Social image parsed successfully. Remember to save changes.');
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
      setUploadingOgImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) { // 500KB limit for favicon
      toast.error('Favicon file is too large. Max size is 500KB.');
      return;
    }

    setUploadingFavicon(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setSeo(prev => ({ ...prev, faviconUrl: base64String }));
      setUploadingFavicon(false);
      toast.success('Favicon parsed successfully. Remember to save changes.');
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
      setUploadingFavicon(false);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const fetchAllSettings = async () => {
      try {
        const res = await safeFetch('/api/get_settings');
        const data = await res.json();
        if (data.status === 'success') {
          // Map settings back to state
          const s = data.settings;
          setSettings(prev => ({
            ...prev,
            siteName: s.siteName || prev.siteName,
            coinValue: parseFloat(s.coinValue) || prev.coinValue,
            minWithdrawal: parseInt(s.minWithdrawal) || prev.minWithdrawal,
            referralBonus: parseInt(s.referralBonus) || prev.referralBonus,
            maintenanceMode: s.maintenanceMode === "1" || s.maintenanceMode === true,
            registrationEnabled: s.registrationEnabled === "1" || s.registrationEnabled === true,
            liveFeedEnabled: s.liveFeedEnabled === "1" || s.liveFeedEnabled === true,
            liveFeedScrolling: s.liveFeedScrolling === "1" || s.liveFeedScrolling === true,
            liveFeedShowUsername: s.liveFeedShowUsername === "1" || s.liveFeedShowUsername === true,
            liveFeedShowOffer: s.liveFeedShowOffer === "1" || s.liveFeedShowOffer === true
          }));
          
          if (s.seoConfig) {
             setSeo(prev => ({ ...prev, ...s.seoConfig }));
          }
        }
      } catch (error) {
        console.error("Fetch Settings Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await safeFetch('/api/admin_update_settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            ...settings,
            seoConfig: seo
          }
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success("Settings saved successfully!");
      }
    } catch (error) {
      console.error("Save Settings Error:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Platform Settings</h1>
          <p className="text-zinc-500 font-medium">Configure global platform parameters and security.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-emerald-500 text-zinc-950 font-black px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          <Save className={cn("w-5 h-5", saving && "animate-pulse")} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* General Settings */}
        <div className="bg-[#121418] border border-white/5 rounded-[32px] p-8 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
              <Globe className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">General Configuration</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Site Name</label>
              <input 
                type="text" 
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div>
                <p className="text-sm font-bold text-white">Maintenance Mode</p>
                <p className="text-[10px] text-zinc-500 font-medium">Take the site offline for updates</p>
              </div>
              <button 
                onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  settings.maintenanceMode ? "bg-red-500" : "bg-zinc-800"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  settings.maintenanceMode ? "right-1" : "left-1"
                )} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div>
                <p className="text-sm font-bold text-white">User Registration</p>
                <p className="text-[10px] text-zinc-500 font-medium">Allow new users to sign up</p>
              </div>
              <button 
                onClick={() => setSettings({...settings, registrationEnabled: !settings.registrationEnabled})}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  settings.registrationEnabled ? "bg-emerald-500" : "bg-zinc-800"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  settings.registrationEnabled ? "right-1" : "left-1"
                )} />
              </button>
            </div>
          </div>
        </div>

        {/* Economy Settings */}
        <div className="bg-[#121418] border border-white/5 rounded-[32px] p-8 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
              <Coins className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Economy & Payouts</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Coin Value (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                <input 
                  type="number" 
                  step="0.0001"
                  value={settings.coinValue}
                  onChange={(e) => setSettings({...settings, coinValue: parseFloat(e.target.value)})}
                  className="w-full bg-black/40 border border-white/5 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Min. Withdrawal (Coins)</label>
              <input 
                type="number" 
                value={settings.minWithdrawal}
                onChange={(e) => setSettings({...settings, minWithdrawal: parseInt(e.target.value)})}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Referral Bonus (Coins)</label>
              <input 
                type="number" 
                value={settings.referralBonus}
                onChange={(e) => setSettings({...settings, referralBonus: parseInt(e.target.value)})}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* SEO & Social Media Settings */}
        <div className="bg-[#121418] border border-white/5 rounded-[32px] p-8 space-y-6 col-span-full">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <Share2 className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">SEO & Social Media</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Site Title</label>
                <input 
                  type="text" 
                  value={seo.siteTitle}
                  onChange={(e) => setSeo({...seo, siteTitle: e.target.value})}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                  placeholder="Findejob - Earn Visa & Crypto"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Meta Description</label>
                <textarea 
                  value={seo.metaDescription}
                  onChange={(e) => setSeo({...seo, metaDescription: e.target.value})}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all min-h-[100px] resize-none"
                  placeholder="The text shown below your site title in search results..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Favicon URL or Upload (.png, .ico)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={seo.faviconUrl}
                      onChange={(e) => setSeo({...seo, faviconUrl: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                      placeholder="https://example.com/favicon.png"
                    />
                  </div>
                  <div className="relative shrink-0">
                    <input
                      type="file"
                      accept=".ico,.png,.jpg,.jpeg,.svg"
                      onChange={handleFaviconUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={uploadingFavicon}
                    />
                    <button 
                      type="button"
                      disabled={uploadingFavicon}
                      className="h-[48px] px-6 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2"
                    >
                      {uploadingFavicon ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Social Share Image URL or Upload (OG Image)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={seo.ogImage}
                      onChange={(e) => setSeo({...seo, ogImage: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 rounded-xl pl-4 pr-12 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                      placeholder="https://example.com/banner.jpg"
                    />
                    <ImageIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  </div>
                  <div className="relative shrink-0">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleOgImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={uploadingOgImage}
                    />
                    <button 
                      type="button"
                      disabled={uploadingOgImage}
                      className="h-[48px] px-6 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2"
                    >
                      {uploadingOgImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Thumbnail Preview</label>
                <div className="aspect-[1.91/1] bg-black/40 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center group relative">
                  {seo.ogImage ? (
                    <img 
                      src={seo.ogImage} 
                      alt="SEO Preview" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={() => toast.error("Social Image failed to load. Check the URL.")}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-zinc-700">
                      <ImageIcon className="w-10 h-10 opacity-20" />
                      <span className="text-[8px] font-black uppercase tracking-[0.3em]">No Image Provided</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <p className="text-white font-bold text-xs truncate">{seo.siteTitle}</p>
                    <p className="text-zinc-400 text-[10px] line-clamp-1">{seo.metaDescription}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Feed Settings */}
        <div className="bg-[#121418] border border-white/5 rounded-[32px] p-8 space-y-6 col-span-full">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Live Feed Control</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div>
                <p className="text-sm font-bold text-white">Enable Live Feed</p>
                <p className="text-[10px] text-zinc-500 font-medium">Show the ticker globally</p>
              </div>
              <button 
                onClick={() => setSettings({...settings, liveFeedEnabled: !settings.liveFeedEnabled})}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative shrink-0",
                  settings.liveFeedEnabled ? "bg-emerald-500" : "bg-zinc-800"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  settings.liveFeedEnabled ? "right-1" : "left-1"
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div>
                <p className="text-sm font-bold text-white">Auto-Scroll Ticker</p>
                <p className="text-[10px] text-zinc-500 font-medium">Scroll right to left constantly</p>
              </div>
              <button 
                onClick={() => setSettings({...settings, liveFeedScrolling: !settings.liveFeedScrolling})}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative shrink-0",
                  settings.liveFeedScrolling ? "bg-emerald-500" : "bg-zinc-800"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  settings.liveFeedScrolling ? "right-1" : "left-1"
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div>
                <p className="text-sm font-bold text-white">Show Usernames</p>
                <p className="text-[10px] text-zinc-500 font-medium">Display full names in feed</p>
              </div>
              <button 
                onClick={() => setSettings({...settings, liveFeedShowUsername: !settings.liveFeedShowUsername})}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative shrink-0",
                  settings.liveFeedShowUsername ? "bg-emerald-500" : "bg-zinc-800"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  settings.liveFeedShowUsername ? "right-1" : "left-1"
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div>
                <p className="text-sm font-bold text-white">Show Offer Names</p>
                <p className="text-[10px] text-zinc-500 font-medium">Display specific offer names</p>
              </div>
              <button 
                onClick={() => setSettings({...settings, liveFeedShowOffer: !settings.liveFeedShowOffer})}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative shrink-0",
                  settings.liveFeedShowOffer ? "bg-emerald-500" : "bg-zinc-800"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  settings.liveFeedShowOffer ? "right-1" : "left-1"
                )} />
              </button>
            </div>
          </div>
        </div>

        {/* System Tools - Migrated to MySQL */}
        <div className="bg-[#121418] border border-white/5 rounded-[32px] p-8 space-y-6 col-span-full">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
              <Database className="w-5 h-5 text-purple-500" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">System Tools</h2>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-white/5 rounded-[24px] border border-white/5 gap-6">
            <div>
              <p className="text-sm font-black text-white uppercase tracking-tight mb-1">Database Migrator</p>
              <p className="text-xs text-zinc-500 font-medium">Run this tool to ensure all MySQL tables are correctly created and updated.</p>
            </div>
            <button 
              onClick={() => window.open('/api/migrator', '_blank')}
              className="bg-white/5 text-white font-black px-6 py-3 rounded-xl hover:bg-white/10 transition-all border border-white/5 whitespace-nowrap"
            >
              Run Migrator
            </button>
          </div>
        </div>
      </div>

      {/* Security Alert */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-[32px] flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
        <div>
          <h4 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-1">Security Warning</h4>
          <p className="text-xs text-zinc-500 font-medium leading-relaxed">
            Changing global settings affects all users immediately. Be careful when adjusting coin values or withdrawal minimums as this can impact your platform's economy and profitability.
          </p>
        </div>
      </div>
    </div>
  );
}
