import { safeFetch } from '../../lib/api';
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  User as UserIcon,
  Mail,
  Calendar,
  Coins,
  Shield,
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

interface UserData {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  balance: number;
  streak: number;
  createdAt: any;
  role?: string;
  isBanned?: boolean;
}

export function AdminUsers() {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await safeFetch('/api/admin_get_users');
      const data = await res.json();
      if (data.status === 'success') {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Fetch Users Error:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBan = async (user: UserData) => {
    if (!window.confirm(`Are you sure you want to ${user.isBanned ? 'unban' : 'ban'} this user?`)) return;
    
    try {
      const res = await safeFetch('/api/admin_update_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          updates: { isBanned: !user.isBanned }
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success(`User updated successfully`);
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Ban Error:", error);
      toast.error(`Permissions denied or server error.`);
    }
  };

  const handleToggleAdmin = async (user: UserData) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to ${user.role === 'admin' ? 'remove admin' : 'make admin'}?`)) return;

    try {
      const res = await safeFetch('/api/admin_update_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          updates: { role: newRole }
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success(`User role updated to ${newRole}`);
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to update role");
      }
    } catch (error) {
      console.error("Role Error:", error);
      toast.error('Failed to update user role.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.uid.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">User Management</h1>
          <p className="text-zinc-500 font-medium">Monitor and manage your community members.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name, email, or UID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121418] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button className="bg-[#121418] border border-white/5 text-zinc-400 font-bold px-4 py-3 rounded-xl flex items-center gap-2 hover:text-white transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#121418] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">User</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Balance</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Joined</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Role</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6">
                      <div className="h-10 bg-white/5 rounded-xl w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.uid} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center overflow-hidden">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <UserIcon className="w-5 h-5 text-emerald-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white leading-none mb-1 flex items-center gap-2">
                            {user.displayName || 'Anonymous'}
                            {user.isBanned && (
                              <span className="bg-red-500/10 text-red-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Banned</span>
                            )}
                          </p>
                          <p className="text-[10px] text-zinc-600 font-medium leading-none">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-black text-white">{user.balance?.toLocaleString() || 0}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-bold">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                        user.role === 'admin' ? "bg-purple-500/10 text-purple-500" : "bg-white/5 text-zinc-500"
                      )}>
                        {user.role || 'User'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleAdmin(user)}
                          className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center border transition-all",
                            user.role === 'admin' 
                              ? "bg-purple-500/10 border-purple-500/20 text-purple-500 hover:bg-purple-500 hover:text-white" 
                              : "bg-white/5 border-white/5 text-zinc-500 hover:text-white hover:bg-white/10"
                          )}
                          title={user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleBan(user)}
                          className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center border transition-all",
                            user.isBanned 
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-zinc-950" 
                              : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                          )}
                          title={user.isBanned ? 'Unban User' : 'Ban User'}
                        >
                          {user.isBanned ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Placeholder */}
        <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Showing 1-50 of {users.length}</p>
          <div className="flex gap-2">
            <button className="p-2 bg-white/5 border border-white/5 rounded-lg text-zinc-500 hover:text-white disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 bg-white/5 border border-white/5 rounded-lg text-zinc-500 hover:text-white disabled:opacity-50" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
