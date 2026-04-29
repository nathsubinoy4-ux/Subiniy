import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { safeFetch } from '../lib/api';

const API_BASE = '/api';

const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>; // This can now be a "Guest" or "Quick" login
  signInWithEmail: (email: string, pass: string) => Promise<any>;
  signInWithUsername: (username: string, pass: string) => Promise<any>;
  signUp: (email: string, pass: string, profileData: Partial<User>) => Promise<any>;
  signOut: () => Promise<void>;
  addBalance: (amount: number) => Promise<void>;
  refreshUserData: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = React.useCallback(async (uid: string) => {
    try {
      const res = await safeFetch(`${API_BASE}/get_user_data?uid=${encodeURIComponent(uid)}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.status === 'success') {
        setUser(prev => ({
          ...prev,
          uid: uid,
          displayName: data.username || 'User',
          balance: Number(data.balance) || 0,
          photoURL: data.avatar || null,
          email: prev?.email || '',
          createdAt: prev?.createdAt || new Date().toISOString(),
          streak: prev?.streak || 0,
          role: data.role || 'user',
          isPrivateProfile: !!data.isPrivate
        } as User));
      }
    } catch (err) {
      console.error('Fetch User Data Error:', err);
    }
  }, []);

  useEffect(() => {
    const storedUid = localStorage.getItem('findejob_uid');
    if (storedUid) {
      fetchUserData(storedUid).finally(() => setLoading(false));
      
      // Setup polling for balance
      const intervalId = setInterval(() => fetchUserData(storedUid), 15000);
      
      const handleRefresh = () => fetchUserData(storedUid);
      window.addEventListener('refresh_balance', handleRefresh);
      window.addEventListener('refresh_user_data', handleRefresh);
      
      return () => {
        clearInterval(intervalId);
        window.removeEventListener('refresh_balance', handleRefresh);
        window.removeEventListener('refresh_user_data', handleRefresh);
      };
    } else {
      setLoading(false);
    }
  }, [fetchUserData]);

  const signInWithEmail = React.useCallback(async (identifier: string, pass: string) => {
    const res = await safeFetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password: pass })
    });
    
    let data;
    try {
      data = await res.json();
    } catch (err) {
      throw new Error('Invalid JSON response from server');
    }
    if (data.status === 'success') {
      const u = data.user;
      const mappedUser: User = {
        uid: u.uid,
        displayName: u.username,
        email: u.email,
        photoURL: u.avatar || null,
        balance: Number(u.balance) || 0,
        streak: 0,
        createdAt: new Date().toISOString(),
        role: u.role || 'user'
      };
      setUser(mappedUser);
      localStorage.setItem('findejob_uid', u.uid);
      return data;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  }, []);

  const signInWithUsername = signInWithEmail; // Both use login with 'identifier'

  const signUp = React.useCallback(async (email: string, pass: string, profileData: Partial<User>) => {
    try {
      const res = await safeFetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: profileData.displayName || 'User',
          email, 
          password: pass 
        })
      });
      
      const data = await res.json();

      if (data.status === 'success' || data.success === true) {
        // Map the new user data format if necessary
        const returnedUid = data.uid || (data.user && data.user.uid);
        const mappedUser: User = {
          uid: returnedUid,
          displayName: profileData.displayName || 'User',
          email: email,
          photoURL: null,
          balance: 0,
          streak: 0,
          createdAt: new Date().toISOString()
        };
        setUser(mappedUser);
        localStorage.setItem('findejob_uid', returnedUid);
        return data;
      } else {
        console.error('Signup error response:', data);
        throw new Error(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Full signup exception:', error);
      throw error;
    }
  }, []);

  const signOut = React.useCallback(async () => {
    localStorage.removeItem('findejob_uid');
    setUser(null);
  }, []);

  const signIn = React.useCallback(async () => {
    // Quick login / Guest mode: generate a random ID if none exists
    const guestUid = `GUEST_${Math.random().toString(36).substring(7).toUpperCase()}`;
    localStorage.setItem('findejob_uid', guestUid);
    await fetchUserData(guestUid);
  }, [fetchUserData]);

  const addBalance = React.useCallback(async (amount: number) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, balance: (prev.balance || 0) + amount } : null);
  }, [user]);

  const refreshUserData = React.useCallback(async () => {
    const uid = localStorage.getItem('findejob_uid');
    if (uid) await fetchUserData(uid);
  }, [fetchUserData]);

  const value = React.useMemo(() => ({ 
    user, 
    loading, 
    signIn, 
    signInWithEmail, 
    signInWithUsername, 
    signUp, 
    signOut, 
    addBalance,
    refreshUserData
  }), [user, loading, signIn, signInWithEmail, signInWithUsername, signUp, signOut, addBalance, refreshUserData]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

