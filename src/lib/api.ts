export const API_BASE_URL = '/api';

export const safeFetch = async (url: string, options: RequestInit = {}) => {
  try {
    let finalUrl = url;

    // Use full URL if relative
    if (finalUrl.startsWith('/api/') && !finalUrl.startsWith('http')) {
        // Just let it be relative, Vite proxies or Express serves it
    }

    const res = await fetch(finalUrl, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res;
  } catch (error: any) {
    if (url.includes('get_settings')) {
      console.error(`Silent API Error (${url}): ${error.message}`);
      throw error;
    }
    console.error(`API Error (${url}): ${error.message}`);
    throw error;
  }
};

