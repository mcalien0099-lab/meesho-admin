"use client";
import { Search, Bell, User } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" size={20} />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors placeholder:text-foreground/40 text-foreground"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-background transition-colors relative">
          <Bell size={20} className="text-foreground/70 hover:text-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-card"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-border ml-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-foreground">John Doe</p>
            <p className="text-xs text-foreground/60">Admin</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
