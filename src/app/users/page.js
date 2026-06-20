"use client";

import { useState, useEffect } from 'react';
import { Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import { userService } from '@/services/userService';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getBlockedUsers();
      setUsers(res.data || res.blockedUsers || res || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch blocked users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUnblock = async (id) => {
    if (confirm('Are you sure you want to unblock this device?')) {
      try {
        await userService.unblockUser(id);
        fetchUsers();
      } catch (err) {
        alert('Failed to unblock user');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blocked Users / Devices</h1>
          <p className="text-sm text-foreground/60 mt-1">Manage device access and unblock suspicious IPs.</p>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">{error}</div>}

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" size={18} />
            <input 
              type="text" 
              placeholder="Search by Device ID or IP..." 
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder:text-foreground/40"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="flex items-center justify-center h-48 text-foreground/50">Loading blocked users...</div>
          ) : (
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-background/50 border-b border-border text-sm text-foreground/60 uppercase">
                  <th className="p-4 font-semibold">Device ID / IP</th>
                  <th className="p-4 font-semibold text-center">Attempts</th>
                  <th className="p-4 font-semibold">Last Attempt</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-border/50 last:border-0 hover:bg-background/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-foreground">{user.deviceId}</p>
                        <p className="text-xs text-foreground/60">{user.ipAddress || 'Unknown IP'}</p>
                      </div>
                    </td>
                    <td className="p-4 text-center font-medium text-foreground">{user.attempts}</td>
                    <td className="p-4 text-foreground/70 text-sm">{new Date(user.lastAttemptAt).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.blocked ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                      }`}>
                        {user.blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {user.blocked ? (
                        <button 
                          onClick={() => handleUnblock(user._id)}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ml-auto bg-background border border-border text-foreground hover:bg-background/80"
                        >
                          <ShieldCheck size={16} /> Unblock
                        </button>
                      ) : (
                        <span className="text-sm text-foreground/50">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center p-8 text-foreground/50">No blocked users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
