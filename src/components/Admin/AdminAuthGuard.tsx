import React, { useState, useEffect } from 'react';
import { AdminLogin } from './AdminLogin';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAdminAuthenticated');
    setIsAdminAuthenticated(authStatus === 'true');
  }, []);

  if (isAdminAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Verifying Security Clearance...</p>
      </div>
    );
  }

  // If they haven't entered the admin credentials yet, show the login form
  // This allows access using ONLY username/password, no external account needed
  if (!isAdminAuthenticated) {
    return <AdminLogin onAuthenticated={() => setIsAdminAuthenticated(true)} />;
  }

  return <>{children}</>;
}
