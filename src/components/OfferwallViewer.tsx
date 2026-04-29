import { safeFetch } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import { Loader2, AlertTriangle } from 'lucide-react';
import { AdBlueMediaWall } from './AdBlueMediaWall';
import { UpwallWall } from './UpwallWall';
import { AdlexyWall } from './AdlexyWall';

interface OfferwallViewerProps {
  partnerId: string;
}

export function OfferwallViewer({ partnerId }: OfferwallViewerProps) {
  const { user } = useAuth();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      if (!partnerId || !user) return;
      
      setLoading(true);
      try {
        const res = await safeFetch(`/api/get_offerwalls?id=${encodeURIComponent(partnerId)}`);
        const data = await res.json();
        if (data.status === 'success') {
          setConfig(data.config);
        } else {
          setError(data.message || 'Offerwall configuration not found.');
        }
      } catch (err) {
        console.error("Offerwall Viewer API Error:", err);
        setError('Failed to load offerwall configuration.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfig();
  }, [partnerId, user]);

  // Helper to clean placeholders and whitespace from IDs
  const cleanId = (id: string | null | undefined) => {
    if (!id) return '';
    return id.trim().replace(/\{|\}|\[|\]/g, '');
  };

  // Improved placeholder replacement function
  const replacePlaceholders = (url: string, currentConfig: any) => {
    if (!url) return '';
    const uid = user?.uid || '';
    const appId = cleanId(currentConfig.appId);
    const apiKey = cleanId(currentConfig.apiKey);
    
    return url
      .replace(/\[USER_ID\]/gi, uid)
      .replace(/\{USER_ID\}/gi, uid)
      .replace(/\[USER_ID_HERE\]/gi, uid)
      .replace(/\{USER_ID_HERE\}/gi, uid)
      .replace(/\[uid\]/gi, uid)
      .replace(/\{uid\}/gi, uid)
      .replace(/\[PLACEMENT_ID\]/gi, appId)
      .replace(/\{PLACEMENT_ID\}/gi, appId)
      .replace(/\[APP_ID\]/gi, appId)
      .replace(/\{APP_ID\}/gi, appId)
      .replace(/\[API_KEY\]/gi, apiKey)
      .replace(/\{API_KEY\}/gi, apiKey);
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-[#0a0a0b]" />
    );
  }

  if (error || !config || !config.isActive) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0b] p-8 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-xl font-black text-white tracking-tight mb-2">Offerwall Unavailable</h3>
        <p className="text-zinc-500 font-medium max-w-md">
          {error || (config && !config.isActive ? 'This offerwall is currently disabled by the administrator.' : 'Configuration missing.')}
        </p>
      </div>
    );
  }

  // Native Offerwalls
  if (partnerId === 'adbluemedia') {
    return (
      <div className="offerwall-container overflow-y-auto px-4 md:px-8 py-2">
        <AdBlueMediaWall />
      </div>
    );
  }

  // Adlexy uses its own component or iframe? 
  // Let's stick to iframe for standard ones unless specifically handled.

  // Construct Iframe URL
  let iframeUrl = '';
  
  // Clean values for dynamic construction
  const appId = cleanId(config.appId);
  const apiKey = cleanId(config.apiKey);
  const secretKey = cleanId(config.secretKey);
  const pubId = cleanId(config.pubId);

  if (partnerId === 'gemiad') {
    // Priority 1: User-provided URL from Admin Panel
    if (config.url) {
      let rawUrl = config.url.trim();
      // Extract src if user pasted full iframe tag
      if (rawUrl.toLowerCase().startsWith('<iframe')) {
        const srcMatch = rawUrl.match(/src=["']([^"']+)["']/i);
        if (srcMatch) rawUrl = srcMatch[1];
      }
      iframeUrl = replacePlaceholders(rawUrl, config);
    } else {
      // Priority 2: Standard GemiAd format using Placement ID (stored in appId field)
      // https://gemiad.com/ow/{placement_id}/{user_id}
      iframeUrl = `https://gemiad.com/ow/${appId}/${user?.uid || ''}`;
      if (!iframeUrl.includes('theme=')) {
        iframeUrl += iframeUrl.includes('?') ? '&theme=dark' : '?theme=dark';
      }
    }
  } else if (partnerId === 'upwall') {
    // Debug Raw Data for troubleshooting
    console.log("Fetched Offerwall Data (Upwall):", config);

    // Upwall Specific Logic: Support manual URL with auto-append of userid
    // The field saved in AdminPanel is 'url'
    if (!config.appId && !config.url) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0b] p-8 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-black text-white tracking-tight mb-2">Configuration Missing</h3>
          <p className="text-zinc-500 font-medium max-w-md">
            Please add Upwall App ID or Iframe URL in Admin Panel to activate this offerwall.
          </p>
        </div>
      );
    }

    // Determine the base URL. If appId exists, use the standard template, otherwise use manual url
    let baseUrl = (config.url || (appId ? `https://upwall.io/offers/${appId}` : '')).trim();
    
    // Safety check: ensure no residual placeholders or leading slashes from misconfig
    if (baseUrl.startsWith('/')) {
      baseUrl = window.location.origin + baseUrl;
    }

    // Validation: Must be a valid absolute URL starting with http
    if (!baseUrl.toLowerCase().startsWith('http')) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0b] p-8 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-black text-white tracking-tight mb-2">Invalid Configuration</h3>
          <p className="text-zinc-500 font-medium max-w-md">
            Invalid Upwall URL detected: "{baseUrl || 'Empty'}". Please check Admin Settings and ensure the URL starts with https://
          </p>
        </div>
      );
    }

    // Robust Parameter Appending
    const separator = baseUrl.includes('?') ? '&' : '?';
    iframeUrl = `${baseUrl}${separator}userid=${user?.uid || ''}`;
    console.log("Final Upwall URL Construction:", iframeUrl);
  } else if (partnerId === 'cpxresearch') {
    // Construct CPX Research URL
    iframeUrl = `https://offers.cpx-research.com/index.php?app_id=${appId}&ext_user_id=${user?.uid || ''}&secure_hash=${secretKey}`;
  } else if (partnerId === 'adlexy') {
    // Check missing API Key
    if (!config.apiKey || !user?.uid) {
      console.error("Adlexy API Key missing in Settings.");
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0b] p-8 text-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-zinc-500 font-medium text-sm">Loading Offerwall parameters...</p>
        </div>
      );
    }
    
    // Construct Adlexy URL from explicit db template or fallback
    let dbUrl = config.url?.trim() || 'https://adlexy.com/api/offers.php?api_key={API_KEY}&sub_id={USER_ID}';
    
    // Make sure we just handle the raw url, strip adlexy iframe if they pasted it
    if (dbUrl.toLowerCase().startsWith('<iframe')) {
      const srcMatch = dbUrl.match(/src=["']([^"']+)["']/i);
      if (srcMatch) dbUrl = srcMatch[1];
    }
    
    iframeUrl = dbUrl
      .replace(/\{API_KEY\}/gi, apiKey)
      .replace(/\[API_KEY\]/gi, apiKey)
      .replace(/\{USER_ID\}/gi, user?.uid || '')
      .replace(/\[USER_ID\]/gi, user?.uid || '');
  } else if (partnerId === 'vortexwall' || partnerId === 'mobivortex') {
    // VortexWall/MobiVortex iframe format
    iframeUrl = `https://vortexwall.com/ow/${appId}/${user?.uid || ''}`;
  } else if (partnerId === 'notik') {
    // Construct Notik URL exactly as requested
    iframeUrl = `https://notik.me/coins?api_key=${apiKey}&pub_id=${pubId}&app_id=${appId}&user_id=${user?.uid}`;
  } else if (partnerId === 'revtoo') {
    // Construct Revtoo URL exactly as requested
    iframeUrl = `https://revtoo.com/offerwall/${appId}/${user?.uid}`;
  } else if (partnerId === 'admantum') {
    // Priority 1: User-provided URL from Admin Panel
    if (config.url) {
      let rawUrl = config.url.trim();
      if (rawUrl.toLowerCase().startsWith('<iframe')) {
        const srcMatch = rawUrl.match(/src=["']([^"']+)["']/i);
        if (srcMatch) rawUrl = srcMatch[1];
      }
      iframeUrl = replacePlaceholders(rawUrl, config);
    } else {
      // Priority 2: Standard Admantum format
      iframeUrl = `https://admantum.com/wall/${appId}/${user?.uid}`;
    }
  } else if (partnerId === 'flexwall') {
    // Construct Flexwall URL: https://flexwall.net/iframe?app_id=[API_KEY]&user_id=USER_ID
    iframeUrl = `https://flexwall.net/iframe?app_id=${appId}&user_id=${user?.uid || ''}`;
  } else if (partnerId === 'radientwall') {
    // Priority 1: User-provided URL from Admin Panel
    if (config.url) {
      let rawUrl = config.url.trim();
      if (rawUrl.toLowerCase().startsWith('<iframe')) {
        const srcMatch = rawUrl.match(/src=["']([^"']+)["']/i);
        if (srcMatch) rawUrl = srcMatch[1];
      }
      iframeUrl = replacePlaceholders(rawUrl, config);
    } else {
      // Priority 2: Standard Radientwall format: https://radientwall.com/offer/[APP_ID]/[USER_ID]
      iframeUrl = `https://radientwall.com/offer/${appId}/${user?.uid || ''}`;
    }
  } else if (config.url) {
    // Fallback for other offerwalls - prioritize the URL field if provided
    let rawUrl = config.url.trim();
    
    // Extract src if user pasted full iframe tag
    if (rawUrl.toLowerCase().startsWith('<iframe')) {
      const srcMatch = rawUrl.match(/src=["']([^"']+)["']/i);
      if (srcMatch) rawUrl = srcMatch[1];
    }
    
    iframeUrl = replacePlaceholders(rawUrl, config);
    
    // If we still don't have a valid result from placeholders, or it was just an appId template
    if (!iframeUrl.startsWith('http')) {
      if (appId.startsWith('http')) {
        iframeUrl = replacePlaceholders(appId, config);
      } else {
        iframeUrl = `https://example.com/offerwall?appId=${appId}&userId=${user?.uid}`;
      }
    }
  } else if (appId.startsWith('http')) {
    // If appId field was used to store a full URL template
    iframeUrl = replacePlaceholders(appId, config);
  }

  return (
    <div className="w-full h-full flex flex-col p-2 md:p-4">
      <div className={cn(
        "flex-1 w-full h-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl relative",
        ['gemiad', 'flexwall'].includes(partnerId) && "shadow-[0_0_50px_rgba(255,255,255,0.05)] border-white/20 bg-white"
      )}>
        <iframe 
          src={iframeUrl} 
          style={{ colorScheme: 'dark' }}
          className="w-full h-full border-none min-h-0"
          title={`${partnerId} Offerwall`}
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}
