"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          await authService.verify();
          router.push('/dashboard');
        } catch (err) {
          localStorage.removeItem('adminToken');
          setVerifying(false);
        }
      } else {
        setVerifying(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login({ email, password });
      
      if (response.token) {
        localStorage.setItem('adminToken', response.token);
        router.push('/dashboard');
      } else {
        setError('Login failed: No token received.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or server error.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-md mb-4">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
          <p className="text-sm text-foreground/60 mt-1">Sign in to your admin dashboard</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground" 
              placeholder="admin@example.com" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
