import { safeFetch } from '../../lib/api';
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Settings2, 
  ShieldCheck, 
  Loader2,
  X,
  Plus,
  Zap,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { GLOBAL_OFFERWALLS } from '../../config/offerwalls';

interface OfferwallConfig {
  id: string;
  name: string;
  appId: string;
  secretKey: string;
  isActive: boolean;
  apiKey?: string;
  url?: string;
  pubId?: string;
  logoUrl?: string;
  postbackUrl?: string;
}

interface OfferwallCardProps {
  offerwall: typeof GLOBAL_OFFERWALLS[0];
  config: OfferwallConfig;
  onToggle: (id: string, active: boolean) => void;
  onEdit: (offerwall: typeof GLOBAL_OFFERWALLS[0]) => void;
}

function OfferwallCard({ offerwall, config, onToggle, onEdit }: OfferwallCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121824] border border-slate-800 rounded-2xl p-5 hover:border-[#00d074]/30 transition-all group relative overflow-hidden"
    >
      <div className="flex justify-between items-start relative z-10">
        <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/5 p-2.5 flex items-center justify-center overflow-hidden">
          <img 
            src={config.logoUrl || offerwall.logoUrl} 
            alt={offerwall.name} 
            className="w-full h-full object-contain drop-shadow-lg"
            referrerPolicy="no-referrer"
          />
        </div>
        <Switch 
          checked={config.isActive}
          onCheckedChange={(val) => onToggle(offerwall.id, val)}
          className="data-[state=checked]:bg-[#00d074]"
        />
      </div>

      <div className="mt-6 space-y-4 relative z-10">
        <div>
          <h3 className="text-white font-bold tracking-tight text-lg">{offerwall.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full animate-pulse",
              config.isActive ? "bg-[#00d074] shadow-[0_0_8px_#00d074]" : "bg-slate-600"
            )} />
            <p className={cn(
              "text-[10px] uppercase font-black tracking-widest",
              config.isActive ? "text-[#00d074]" : "text-slate-500"
            )}>
              {config.isActive ? 'Active' : 'Deactivated'}
            </p>
          </div>
        </div>

        <Button 
          variant="outline"
          onClick={() => onEdit(offerwall)}
          className="w-full border-slate-800 hover:border-[#00d074] hover:bg-[#00d074]/10 text-slate-400 hover:text-[#00d074] transition-all rounded-xl h-12 text-xs font-black uppercase tracking-widest"
        >
          Configuration
        </Button>
      </div>

      {/* Decorative Brand Glow */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#00d074]/5 blur-3xl rounded-full" />
    </motion.div>
  );
}

export function AdminOfferwalls() {
  const { user } = useAuth();
  const [configs, setConfigs] = useState<Record<string, OfferwallConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingOfferwall, setEditingOfferwall] = useState<typeof GLOBAL_OFFERWALLS[0] | null>(null);
  const [editForm, setEditForm] = useState<OfferwallConfig | null>(null);

  const fetchConfigs = async () => {
    try {
      const res = await safeFetch('/api/admin_get_offerwalls');
      const data = await res.json();
      if (data.status === 'success') {
        const mapped: Record<string, OfferwallConfig> = {};
        data.configs.forEach((c: any) => {
          mapped[c.id] = c;
        });
        setConfigs(mapped);
      }
    } catch (err) {
      console.error("Fetch Configs Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const res = await safeFetch('/api/admin_update_offerwall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive })
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success(`${id.toUpperCase()} is now ${isActive ? 'ACTIVE' : 'DEACTIVATED'}`);
        fetchConfigs();
      }
    } catch (error) {
      console.error("Toggle Error:", error);
      toast.error("Failed to update status");
    }
  };

  const handleEdit = (offerwall: typeof GLOBAL_OFFERWALLS[0]) => {
    setEditingOfferwall(offerwall);
    const existing = configs[offerwall.id];
    const config = existing ? { ...existing } : {
      id: offerwall.id,
      name: offerwall.name,
      appId: '',
      secretKey: '',
      isActive: false,
      apiKey: '',
      url: '',
      logoUrl: offerwall.logoUrl,
      postbackUrl: ''
    };

    // Set default postback URLs if not already set
    if (!config.postbackUrl) {
      if (offerwall.id === 'gemiad') {
        config.postbackUrl = '/api/postback?user_id={USER_ID}&amount={REWARD}&trans_id={TXID}';
      } else if (offerwall.id === 'revtoo') {
        config.postbackUrl = '/api/postback?user_id={subId}&amount={reward}&trans_id={transId}';
      } else if (offerwall.id === 'adlexy') {
        config.postbackUrl = '/api/postback?user_id={uid}&amount={virtual_currency}&trans_id={transaction_id}&api_key=krhv6wrl6551xrf2fho000cpr3k0ak';
      } else if (offerwall.id === 'notik') {
        config.postbackUrl = '/api/postback?user_id={user_id}&amount={payout}&trans_id={txn_id}';
      } else if (offerwall.id === 'mobivortex') {
        config.postbackUrl = '/api/postback?user_id={IDENTITY_ID}&amount={POINTS}&trans_id={TXID}';
      }
    }

    setEditForm(config);
  };

  const handleSave = async () => {
    if (!editForm || !editingOfferwall) return;
    setSaving(true);
    try {
      const sanitizedForm = {
        ...editForm,
        appId: editForm.appId?.trim().replace(/\{|\}|\[|\]/g, '') || '',
        apiKey: editForm.apiKey?.trim().replace(/\{|\}|\[|\]/g, '') || '',
        secretKey: (editForm.secretKey || editForm.apiKey || '').trim().replace(/\{|\}|\[|\]/g, ''),
        pubId: editForm.pubId?.trim().replace(/\{|\}|\[|\]/g, '') || '',
        url: editForm.url?.trim() || '',
        postbackUrl: editForm.postbackUrl?.trim() || '',
        logoUrl: editForm.logoUrl?.trim() || '',
      };

      const res = await safeFetch('/api/admin_update_offerwall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sanitizedForm,
          id: editingOfferwall.id,
          name: editingOfferwall.name
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success(`${editingOfferwall.name} configuration saved!`);
        setEditingOfferwall(null);
        fetchConfigs();
      }
    } catch (error) {
      console.error("Save Error:", error);
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  // Helper to get Public URL for Postbacks
  const getPublicUrl = (path: string = "") => {
    return window.location.origin + path;
  };

  const handleTestPostback = async () => {
    if (!editingOfferwall || !user || !editForm) return;
    setTesting(true);
    try {
      // Force API URL for all test requests
      const apiBase = window.location.origin;
      
      let testUrl = "";
      
      // If a custom postback URL is provided, use it and replace placeholders
      if (editForm.postbackUrl) {
        const testTxid = `TEST_${Date.now()}`;
        const testReward = "1000";
        
        testUrl = editForm.postbackUrl
          .replace(/\{USER_ID\}|\{user_id\}|\{uid\}|\{subId\}|\{identity_id\}|\{IDENTITY_ID\}/gi, user.uid)
          .replace(/\{REWARD\}|\{reward\}|\{payout\}|\{amount\}|\{virtual_currency\}|\{points\}|\{POINTS\}/gi, testReward)
          .replace(/\{TXID\}|\{txid\}|\{transaction_id\}|\{trans_id\}|\{transId\}|\{txn_id\}/gi, testTxid);
          
        if (testUrl.startsWith('/')) {
            testUrl = apiBase + testUrl;
        }
        console.log(`[Tester] Using Dynamic URL: ${testUrl}`);
      } else {
        // Fallback to internal tester route which proxies to the correct domain logic
        testUrl = `${apiBase}/api/tester/postback?id=${editingOfferwall.id}&userId=${user.uid}`;
      }
      
      const response = await fetch(testUrl);
      let data;
      const textResponse = await response.text();
      try {
        data = JSON.parse(textResponse);
      } catch (e) {
        console.error("Non-JSON Server Error:", textResponse);
        throw new Error(`Server returned non-JSON response (Status ${response.status}). Check network tab or logs.`);
      }
      
      if (data.success) {
        const displayBody = typeof data.body === 'object' ? JSON.stringify(data.body) : data.body;
        toast.success("Test Postback Successful!", {
          description: `Server response: ${displayBody}. 1000 Coins should be added to your account.`,
          icon: <Zap className="w-4 h-4 text-emerald-500" />
        });
      } else {
        const displayError = typeof data.body === 'object' ? JSON.stringify(data.body) : (data.body || data.error);
        toast.error("Test Postback Failed", {
          description: `Status: ${data.status}. Error: ${displayError}`,
        });
      }
    } catch (error: any) {
      console.error("Test Error:", error);
      toast.error("Failed to trigger test postback", {
        description: error.message || String(error)
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <Loader2 className="w-10 h-10 text-[#00d074] animate-spin" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Initializing Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-6 lg:p-10 space-y-12">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#00d074]/10 rounded-2xl border border-[#00d074]/20 shadow-[0_0_20px_rgba(0,208,116,0.1)]">
            <Settings2 className="w-8 h-8 text-[#00d074]" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Offerwall Hub</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Management Console</p>
          </div>
        </div>
        <p className="text-slate-400 font-medium max-w-2xl text-sm leading-relaxed">
          Manage your platform's earning integrations from a central hub. Configure API keys, secrets, 
          and track real-time status. The toggle switch instantly updates the user frontend experience.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#121824]/50 p-6 rounded-[24px] border border-slate-800">
        <div className="flex items-center gap-2 p-1 bg-[#0a0a0b] rounded-xl border border-slate-800">
          {['All', 'Active', 'Inactive'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={cn(
                "px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                statusFilter === filter 
                  ? "bg-[#00d074] text-slate-900 shadow-[0_0_15px_rgba(0,208,116,0.3)]" 
                  : "text-slate-500 hover:text-white"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search networks..."
            className="bg-[#0a0a0b] border-slate-800 focus:border-[#00d074] h-12 rounded-xl text-white pl-4 pr-10 text-xs font-bold uppercase tracking-widest placeholder:text-slate-600"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Unified Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {GLOBAL_OFFERWALLS.filter(offer => {
          const config = configs[offer.id] || { isActive: false };
          const matchesSearch = offer.name.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesStatus = 
            statusFilter === 'All' ? true : 
            statusFilter === 'Active' ? config.isActive : 
            !config.isActive;
          return matchesSearch && matchesStatus;
        }).map((offerwall) => (
          <OfferwallCard 
            key={offerwall.id}
            offerwall={offerwall}
            config={configs[offerwall.id] || { id: offerwall.id, name: offerwall.name, appId: '', secretKey: '', isActive: false }}
            onToggle={handleToggle}
            onEdit={handleEdit}
          />
        ))}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingOfferwall && editForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#121824] border border-slate-800 rounded-[32px] p-8 md:p-10 w-full max-w-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00d074]/5 blur-[100px] -mr-32 -mt-32" />

              <button 
                onClick={() => {
                  setEditingOfferwall(null);
                  setEditForm(null);
                }}
                className="absolute top-6 right-6 z-50 cursor-pointer rounded-full p-2 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                title="Close without saving"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/5 p-3 flex items-center justify-center shadow-inner">
                  <img src={editForm.logoUrl || editingOfferwall.logoUrl} alt="" className="w-full h-full object-contain drop-shadow-lg" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tighter leading-none mb-1">{editingOfferwall.name}</h2>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00d074]" />
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Secure Configuration</p>
                  </div>
                </div>
              </div>

               {/* Automated Callback URL Generator */}
              <div className="mb-4 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 relative overflow-hidden group/callback">
                <div className="absolute top-0 right-0 p-2">
                  <Zap className="w-3 h-3 text-emerald-500/20 group-hover/callback:text-emerald-500 transition-colors" />
                </div>
                
                <Label className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2 block">
                  Your Unique Callback URL
                </Label>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-black/40 border border-white/5 rounded-lg px-3 py-2 font-mono text-[10px] text-emerald-400 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {editingOfferwall.id === 'adlexy' 
                      ? `${getPublicUrl('/api/postback.php')}?source=adlexy&offer_id={of_id}&user_id={uid}&amount={virtual_currency}&status={status}&api_key=${editForm.apiKey || '{api_key}'}`
                      : editingOfferwall.id === 'admantum'
                      ? `${getPublicUrl('/api/postback.php')}?source=admantum&uid={uid}&reward={reward}&transid={transid}&key={key}`
                      : editingOfferwall.id === 'radientwall'
                      ? `${getPublicUrl('/api/postback/radientwall')}?subId={uid}&transId={transid}&reward={reward}&status={status}&signature={hash}`
                      : `${getPublicUrl('/api/postback.php')}?source=${editingOfferwall.id}&uid={uid}&of_id={of_id}&virtual_currency={virtual_currency}&hash={hash}`
                    }
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const url = editingOfferwall.id === 'adlexy'
                          ? `${getPublicUrl('/api/postback.php')}?source=adlexy&offer_id={of_id}&user_id={uid}&amount={virtual_currency}&status={status}&api_key=${editForm.apiKey || '{api_key}'}`
                          : editingOfferwall.id === 'admantum'
                          ? `${getPublicUrl('/api/postback.php')}?source=admantum&uid={uid}&reward={reward}&transid={transid}&key={key}`
                          : editingOfferwall.id === 'radientwall'
                          ? `${getPublicUrl('/api/postback/radientwall')}?subId={uid}&transId={transid}&reward={reward}&status={status}&signature={hash}`
                          : `${getPublicUrl('/api/postback.php')}?source=${editingOfferwall.id}&uid={uid}&of_id={of_id}&virtual_currency={virtual_currency}&hash={hash}`;
                        navigator.clipboard.writeText(url);
                        toast.success("Public Callback URL Copied!", {
                          description: "Paste this into your provider dashboard.",
                          icon: <Check className="w-4 h-4 text-emerald-500" />
                        });
                      }}
                      className="h-8 w-8 shrink-0 border-slate-800 hover:border-emerald-500 hover:text-emerald-500 bg-black/40"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={testing}
                      onClick={handleTestPostback}
                      className="h-8 px-3 text-[9px] font-black uppercase tracking-tighter bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-lg transition-all"
                    >
                      {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : "Test Call"}
                    </Button>
                  </div>
                </div>
                
                <p className="mt-2 text-[9px] text-slate-500 font-medium leading-relaxed italic">
                  <span className="text-emerald-500 font-bold">⚠️ Note:</span> External servers cannot reach the private <span className="font-mono text-emerald-400/80">ais-dev</span> URL. I have automatically generated the <span className="text-white font-bold underline">Public Shared App URL</span> for you above.
                </p>
                <p className="mt-1 text-[9px] text-slate-500 font-medium leading-relaxed italic">
                  Copy this URL and paste it into the "Postback/Callback URL" section of your <span className="text-slate-300 font-bold">{editingOfferwall.name}</span> provider dashboard.
                </p>
              </div>

               {/* Informational Hint (Optional/Specific) */}
              {(editingOfferwall.id === 'admantum') && (
                <div className="mb-4 py-2 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-[9px] font-medium text-emerald-400 leading-relaxed flex flex-col gap-1">
                    <span className="font-bold flex items-center gap-1">💡 Admantum Hash Pattern:</span>
                    <span className="text-slate-400 font-mono">md5(uid + of_id + virtual_currency + secret_key)</span>
                  </p>
                </div>
              )}
              {editingOfferwall.id === 'adlexy' && (
                <div className="mb-4 py-2 px-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                  <p className="text-[9px] font-medium text-indigo-400 leading-relaxed flex flex-col gap-1">
                    <span className="font-bold flex items-center gap-1">💡 Flexible Postback URL:</span>
                    <span className="font-mono bg-black/40 px-2 py-1 rounded text-white overflow-x-auto whitespace-nowrap scrollbar-hide">
                      {getPublicUrl('/api/postback.php')}?source=adlexy&offer_id=[OFFER_ID]&user_id=[USER_ID]&amount=[AMOUNT]&status=[STATUS]&api_key=[API_KEY]
                    </span>
                  </p>
                </div>
              )}
                {['vortexwall', 'mobivortex', 'gemiad', 'flexwall'].includes(editingOfferwall.id) && (
                  <div className="mb-4 py-2 px-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-1">
                    <p className="text-[9px] font-medium text-blue-400 leading-relaxed flex flex-col gap-1">
                      <span className="font-bold flex items-center gap-1">💡 Postback URL:</span>
                      <span className="font-mono bg-black/40 px-2 py-1 rounded text-white overflow-x-auto whitespace-nowrap scrollbar-hide">
                        {editingOfferwall.id === 'gemiad' 
                          ? `${getPublicUrl('/api/postback.php')}?source=gemiad&identity_id={identity_id}&points={points}&txid={txid}&result={result}&hash={hash}&campaign_id={campaign_id}`
                          : editingOfferwall.id === 'flexwall'
                          ? `${getPublicUrl('/api/postback.php')}?source=flexwall&user_id={user_id}&amount={amount}&TXID={TXID}&offer_name={offer_name}&key={key}`
                          : `${getPublicUrl('/api/postback.php')}?source=${editingOfferwall.id}&identity_id={IDENTITY_ID}&campaign_id={CAMPAIGN_ID}&txid={TXID}&payout={PAYOUT}&points={POINTS}&hash={HASH}&result={RESULT}`
                        }
                      </span>
                    </p>
                    <p className="text-[9px] text-blue-400/80 italic font-medium leading-tight">
                      Ensure you map data correctly. Wait to test until configuration is saved.
                    </p>
                  </div>
                )}
                <div className="space-y-4 relative z-10">
                {/* Conditional Fields Based on Network */}
                {editingOfferwall.id === 'upwall' ? (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">App API Key</Label>
                      <Input 
                        value={editForm.appId || ''}
                        onChange={(e) => setEditForm({ ...editForm, appId: e.target.value })}
                        className="bg-black/50 border-slate-800 focus:border-[#00d074] h-10 rounded-xl text-white font-medium px-4 transition-all text-xs"
                        placeholder="Enter UPWALL App API Key"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Offerwall Iframe URL</Label>
                      <Input 
                        value={editForm.url || ''}
                        onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                        className="bg-black/50 border-slate-800 focus:border-[#00d074] h-10 rounded-xl text-white font-medium px-4 transition-all text-xs"
                        placeholder="https://offerwall.upwall.io/..."
                      />
                      <p className="text-[9px] text-slate-600 font-medium ml-1">
                        Base URL from dashboard.
                      </p>
                    </div>
                  </div>
                ) : editingOfferwall.id === 'cpxresearch' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Widget ID</Label>
                      <Input 
                        value={editForm.appId || ''}
                        onChange={(e) => setEditForm({ ...editForm, appId: e.target.value })}
                        className="bg-black/50 border-slate-800 focus:border-[#00d074] h-10 rounded-xl text-white font-medium px-4 transition-all text-xs"
                        placeholder="e.g. 12345"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Secure Hash</Label>
                      <Input 
                        value={editForm.secretKey || ''}
                        onChange={(e) => setEditForm({ ...editForm, secretKey: e.target.value })}
                        className="bg-black/50 border-slate-800 focus:border-[#00d074] h-10 rounded-xl text-white font-medium px-4 transition-all text-xs"
                        placeholder="Enter Secure Hash"
                      />
                    </div>
                  </div>
                ) : editingOfferwall.id === 'adlexy' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 md:col-span-2">
                        <Label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">API Key</Label>
                        <Input 
                          value={editForm.apiKey || ''}
                          onChange={(e) => setEditForm({ ...editForm, apiKey: e.target.value })}
                          className="bg-black/50 border-slate-800 focus:border-[#00d074] h-10 rounded-xl text-white font-medium px-4 transition-all text-xs"
                          placeholder="Adlexy API Key"
                        />
                      </div>
                    </div>
                  </div>
                ) : ['vortexwall', 'mobivortex', 'gemiad', 'flexwall', 'radientwall'].includes(editingOfferwall.id) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <Label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                        {editingOfferwall.id === 'gemiad' ? 'Placement ID (Optional if URL provided)' : 'Placement ID / App ID'}
                      </Label>
                      <Input 
                        value={editForm.appId || ''}
                        onChange={(e) => setEditForm({ ...editForm, appId: e.target.value })}
                        className="bg-black/50 border-slate-800 focus:border-[#00d074] h-10 rounded-xl text-white font-medium px-4 transition-all text-xs"
                        placeholder={editingOfferwall.id === 'gemiad' ? "e.g. 12345" : "e.g. 66c8b..."}
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Secret Key / Postback Secret</Label>
                      <Input 
                        value={editForm.secretKey || ''}
                        onChange={(e) => setEditForm({ ...editForm, secretKey: e.target.value })}
                        className="bg-black/50 border-slate-800 focus:border-[#00d074] h-10 rounded-xl text-white font-medium px-4 transition-all text-xs"
                        placeholder="Enter your_secret_key"
                      />
                    </div>
                    {editingOfferwall.id === 'gemiad' && (
                      <div className="space-y-1.5 md:col-span-2">
                        <Label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">GemiAd Offerwall Link (Recommended)</Label>
                        <Input 
                          value={editForm.url || ''}
                          onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                          className="bg-black/50 border-slate-800 focus:border-[#00d074] h-10 rounded-xl text-white font-medium px-4 transition-all text-xs"
                          placeholder="https://gemiad.com/ow/PLATEMENT_ID/[USER_ID]"
                        />
                        <p className="text-[8px] text-indigo-400 font-medium ml-1 italic italic">
                          💡 Paste the Direct Link or Iframe URL from GemiAd Panel. Use <span className="text-white font-bold">[USER_ID]</span> placeholder.
                        </p>
                      </div>
                    )}
                  </div>
                ) : editingOfferwall.id === 'adlexy' ? (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                       <Label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">API Key</Label>
                       <Input 
                         value={editForm.apiKey || ''}
                         onChange={(e) => setEditForm({ ...editForm, apiKey: e.target.value })}
                         className="bg-black/50 border-slate-800 focus:border-[#00d074] h-10 rounded-xl text-white font-medium px-4 transition-all text-xs"
                         placeholder="e.g. 66c8b..."
                       />
                     </div>
                  </div>
                ) : editingOfferwall.id === 'admantum' ? (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                       <Label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Offerwall App ID</Label>
                       <Input 
                         value={editForm.appId || ''}
                         onChange={(e) => setEditForm({ ...editForm, appId: e.target.value })}
                         className="bg-black/50 border-slate-800 focus:border-[#00d074] h-10 rounded-xl text-white font-medium px-4 transition-all text-xs"
                         placeholder="Admantum App ID"
                       />
                     </div>
                     <div className="space-y-1.5">
                       <Label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Postback Secret Key</Label>
                       <Input 
                         value={editForm.secretKey || ''}
                         onChange={(e) => setEditForm({ ...editForm, secretKey: e.target.value })}
                         className="bg-black/50 border-slate-800 focus:border-[#00d074] h-10 rounded-xl text-white font-medium px-4 transition-all text-xs"
                         placeholder="Enter Admantum Secret"
                       />
                     </div>
                  </div>
                ) : (
                  // Default Fields for Other Offerwalls
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">API Key</Label>
                        <Input 
                          value={editForm.apiKey || ''}
                          onChange={(e) => setEditForm({ ...editForm, apiKey: e.target.value })}
                          className="bg-black/50 border-slate-800 focus:border-[#00d074] h-10 rounded-xl text-white font-medium px-4 transition-all text-xs"
                          placeholder="••••••••••••"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">App ID</Label>
                        <Input 
                          value={editForm.appId || ''}
                          onChange={(e) => setEditForm({ ...editForm, appId: e.target.value })}
                          className="bg-black/50 border-slate-800 focus:border-[#00d074] h-10 rounded-xl text-white font-medium px-4 transition-all text-xs"
                          placeholder="e.g. 12345"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Secret Key / Postback Secret</Label>
                      <Input 
                        value={editForm.secretKey || ''}
                        onChange={(e) => setEditForm({ ...editForm, secretKey: e.target.value })}
                        className="bg-black/50 border-slate-800 focus:border-[#00d074] h-10 rounded-xl text-white font-medium px-4 transition-all text-xs"
                        placeholder="Enter Secret Key"
                      />
                    </div>
                  </div>
                )}

                {/* Common Fields: Postback URL */}
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Callback/Postback URL</Label>
                  <Input 
                    value={editForm.postbackUrl || ''}
                    onChange={(e) => setEditForm({ ...editForm, postbackUrl: e.target.value })}
                    className="bg-black/50 border-slate-800 focus:border-[#00d074] h-10 rounded-xl text-white font-medium px-4 transition-all text-xs"
                    placeholder="https://.../api/postback.php?user_id={USER_ID}&amount={REWARD}&trans_id={TXID}"
                  />
                  <p className="text-[8px] text-slate-600 font-medium ml-1">
                    Use placeholders: <span className="text-emerald-500/80">{'{USER_ID}'}</span>, <span className="text-emerald-500/80">{'{REWARD}'}</span>, <span className="text-emerald-500/80">{'{TXID}'}</span>
                  </p>
                </div>

                {/* Common Fields: Logo URL */}
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Offerwall Logo URL</Label>
                  <Input 
                    value={editForm.logoUrl || ''}
                    onChange={(e) => setEditForm({ ...editForm, logoUrl: e.target.value })}
                    className="bg-black/50 border-slate-800 focus:border-[#00d074] h-10 rounded-xl text-white font-medium px-4 transition-all text-xs"
                    placeholder="Enter Custom Logo Image URL"
                  />
                  <p className="text-[8px] text-slate-600 font-medium ml-1">
                    Provide a direct image URL (PNG/SVG recommended).
                  </p>
                </div>

                {/* Common URL Field (Visible for all walls as fallback) */}
                {!(editingOfferwall.id === 'upwall' || editingOfferwall.id === 'cpxresearch' || ['vortexwall', 'mobivortex', 'flexwall', 'gemiad'].includes(editingOfferwall.id)) && (
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Offerwall URL</Label>
                    <Input 
                      value={editForm.url || ''}
                      onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                      className="bg-black/50 border-slate-800 focus:border-[#00d074] h-10 rounded-xl text-white font-medium px-4 transition-all text-xs"
                      placeholder="https://... (Include [USER_ID] placeholder)"
                    />
                  </div>
                )}

                <Button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-[#00d074] hover:bg-[#00d074]/90 text-slate-900 font-black h-11 rounded-xl transition-all shadow-xl shadow-[#00d074]/10 mt-4 active:scale-[0.98] flex items-center justify-center gap-2 text-xs tracking-widest uppercase mb-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
        <div className="flex items-center gap-3 opacity-30">
          <ShieldCheck className="w-4 h-4 text-slate-500" />
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">
            Secure Infrastructure • Real-time Sync • Version 2.0
          </p>
        </div>
      </div>
    </div>
  );
}
