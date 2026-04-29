import { safeFetch } from '../../lib/api';
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Palette, 
  Layout, 
  Type, 
  MousePointer2, 
  Trophy,
  Loader2,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { motion } from 'motion/react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { toast } from 'sonner';

interface SiteSettings {
  headerLogo: string;
  heroText: string;
  heroBtnText: string;
  heroBtnColor: string;
  topOfferName: string;
  topOfferCompletions: string;
  topOfferIcon: string;
  siteTitle?: string;
  siteDescription?: string;
  faviconUrl?: string;
  ogImageUrl?: string;
}

export function AdminAppearance() {
  const [settings, setSettings] = useState<SiteSettings>({
    headerLogo: '',
    heroText: '',
    heroBtnText: '',
    heroBtnColor: '#10b981',
    topOfferName: '',
    topOfferCompletions: '',
    topOfferIcon: '',
    siteTitle: 'findejob.com',
    siteDescription: 'Earn money for every task you complete online.',
    faviconUrl: '/vite.svg',
    ogImageUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB limit for base64
      toast.error('Logo file is too large. Max size is 1MB.');
      return;
    }

    setUploadingLogo(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setSettings(prev => ({ ...prev, headerLogo: base64String }));
      setUploadingLogo(false);
      toast.success('Logo parsed successfully. Remember to save changes.');
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
      setUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await safeFetch('/api/get_settings');
        const data = await res.json();
        if (data.status === 'success' && data.settings.appearance_settings) {
          setSettings(JSON.parse(data.settings.appearance_settings));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load appearance settings");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await safeFetch('/api/admin_update_settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appearance_settings: JSON.stringify(settings)
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success("Site appearance settings updated successfully!");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to update appearance settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Loading Interface Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(0,208,116,0.1)]">
            <Palette className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Site Appearance</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Frontend Brand Management</p>
          </div>
        </div>
        <p className="text-slate-400 font-medium max-w-2xl text-sm leading-relaxed">
          Customize the visual identity of your landing page. Changes made here update the logo, 
          hero content, and featured offers in real-time across the entire platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Header Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121824] border border-slate-800 rounded-[32px] p-8 space-y-8"
        >
          <div className="flex items-center gap-4 px-1">
            <Layout className="w-5 h-5 text-emerald-500" />
            <h3 className="text-xl font-bold text-white">Header Settings</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Header Logo URL or Upload</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input 
                    value={settings.headerLogo}
                    onChange={(e) => setSettings({ ...settings, headerLogo: e.target.value })}
                    className="bg-black/40 border-slate-800 focus:border-emerald-500 h-14 rounded-2xl text-white px-5"
                    placeholder="https://example.com/logo.png"
                  />
                  <ImageIcon className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                </div>
                <div className="relative shrink-0">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={uploadingLogo}
                  />
                  <Button 
                    type="button"
                    disabled={uploadingLogo}
                    className="h-14 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl border border-slate-700 transition-all flex items-center gap-2"
                  >
                    {uploadingLogo ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    <span>Upload</span>
                  </Button>
                </div>
              </div>
            </div>
            
            {settings.headerLogo && (
              <div className="p-4 bg-black/20 rounded-2xl border border-slate-800/50 flex items-center justify-center">
                <img src={settings.headerLogo} alt="Logo Preview" className="h-8 object-contain" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Offer Settings */}
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="bg-[#121824] border border-slate-800 rounded-[32px] p-8 space-y-8"
        >
          <div className="flex items-center gap-4 px-1">
            <Trophy className="w-5 h-5 text-emerald-500" />
            <h3 className="text-xl font-bold text-white">Top Offer Card</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Offer Name</Label>
                <Input 
                  value={settings.topOfferName}
                  onChange={(e) => setSettings({ ...settings, topOfferName: e.target.value })}
                  className="bg-black/40 border-slate-800 focus:border-emerald-500 h-14 rounded-2xl text-white px-5"
                  placeholder="e.g. Dice Dream"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Comp. Count</Label>
                <Input 
                  value={settings.topOfferCompletions}
                  onChange={(e) => setSettings({ ...settings, topOfferCompletions: e.target.value })}
                  className="bg-black/40 border-slate-800 focus:border-emerald-500 h-14 rounded-2xl text-white px-5"
                  placeholder="e.g. 1.2K"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Offer Icon URL</Label>
              <div className="relative">
                <Input 
                  value={settings.topOfferIcon}
                  onChange={(e) => setSettings({ ...settings, topOfferIcon: e.target.value })}
                  className="bg-black/40 border-slate-800 focus:border-emerald-500 h-14 rounded-2xl text-white px-5"
                  placeholder="Icon URL"
                />
                <ImageIcon className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hero Section Settings */}
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="bg-[#121824] border border-slate-800 rounded-[32px] p-8 space-y-8 lg:col-span-2"
        >
          <div className="flex items-center gap-4 px-1">
            <Type className="w-5 h-5 text-emerald-500" />
            <h3 className="text-xl font-bold text-white">Hero Section</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Main Hero Heading Text</Label>
                <textarea 
                  value={settings.heroText}
                  onChange={(e) => setSettings({ ...settings, heroText: e.target.value })}
                  className="bg-black/40 border-slate-800 focus:border-emerald-500 w-full min-h-[120px] rounded-2xl text-white px-5 py-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-medium leading-relaxed"
                  placeholder="HTML/Rich text supported"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 px-1">
                <MousePointer2 className="w-5 h-5 text-emerald-500" />
                <h4 className="text-sm font-black text-white uppercase tracking-widest">Hero Button</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Button Name</Label>
                  <Input 
                    value={settings.heroBtnText}
                    onChange={(e) => setSettings({ ...settings, heroBtnText: e.target.value })}
                    className="bg-black/40 border-slate-800 focus:border-emerald-500 h-14 rounded-2xl text-white px-5"
                    placeholder="Start Earning"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Background Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={settings.heroBtnColor}
                      onChange={(e) => setSettings({ ...settings, heroBtnColor: e.target.value })}
                      className="bg-black/40 border-slate-800 focus:border-emerald-500 h-14 rounded-2xl text-white px-5"
                      placeholder="#10b981"
                    />
                    <div 
                      className="w-14 h-14 rounded-2xl border border-slate-800 shrink-0 shadow-lg"
                      style={{ backgroundColor: settings.heroBtnColor }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-black/20 rounded-2xl border border-slate-800/50">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Live Preview</p>
                <button
                  className="px-8 py-3 rounded-xl font-bold text-black"
                  style={{ backgroundColor: settings.heroBtnColor }}
                >
                  {settings.heroBtnText || 'Preview Button'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-8">
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-12 h-16 rounded-2xl shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all text-sm tracking-tight flex items-center gap-3"
        >
          {saving ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              PUBLISH ALL CHANGES
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
