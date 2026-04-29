import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Wallet, 
  LayoutGrid, 
  Settings, 
  Search, 
  Bell, 
  LogOut,
  Menu,
  X,
  Sparkles,
  Palette,
  Ticket
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export function AdminLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings } = useSiteSettings();

  // Security Check: Check for admin session
  // We use sessionStorage to match AdminAuthGuard and AdminLogin
  const isAdmin = sessionStorage.getItem('isAdminAuthenticated') === 'true';

  const handleAdminSignOut = () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    navigate('/');
  };

  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Manage Users', path: '/admin/users' },
    { icon: Wallet, label: 'Withdrawals', path: '/admin/withdrawals' },
    { icon: LayoutGrid, label: 'Offerwalls', path: '/admin/offerwalls' },
    { icon: Ticket, label: 'Promo Codes', path: '/admin/promocodes' },
    { icon: Palette, label: 'Appearance', path: '/admin/appearance' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 bg-[#0a0a0b] fixed inset-y-0">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-1">
            {settings.headerLogo && (
              <img 
                src={settings.headerLogo} 
                alt="Site Logo" 
                className="h-8 w-auto object-contain" 
                referrerPolicy="no-referrer"
              />
            )}
          </div>
          <p className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.3em] ml-1 mt-2">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-500 border-r-2 border-emerald-500" 
                  : "text-zinc-500 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleAdminSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all group"
          >
            <LogOut className="w-5 h-5 transition-colors" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen overflow-x-hidden">
        {/* Admin Header */}
        <header className="h-20 border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-zinc-500 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search users, IDs, transactions..."
                className="w-full bg-[#121418] border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button className="relative p-2 text-zinc-500 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0a0b]" />
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-white/5">
              <div className="text-right hidden md:block">
                <p className="text-xs font-black text-white uppercase tracking-tight">Super Admin</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Admin" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Users className="w-5 h-5 text-emerald-500" />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8 flex-1">
          <Outlet />
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#0a0a0b] border-r border-white/5 flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.headerLogo && (
                  <img 
                    src={settings.headerLogo} 
                    alt="Site Logo" 
                    className="h-8 w-auto object-contain" 
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                    isActive 
                      ? "bg-emerald-500/10 text-emerald-500 border-r-2 border-emerald-500" 
                      : "text-zinc-500 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-white/5">
              <button 
                onClick={handleAdminSignOut}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
