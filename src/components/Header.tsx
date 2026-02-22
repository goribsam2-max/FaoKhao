import React from 'react';
import { Search, MapPin, Menu, UserCircle } from 'lucide-react';

interface HeaderProps {
  onSearch: (query: string) => void;
  onProfileClick: () => void;
}

export default function Header({ onSearch, onProfileClick }: HeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 p-4 pointer-events-none">
      <div className="max-w-2xl mx-auto flex items-center gap-3 pointer-events-auto">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-4 flex items-center">
            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search District or Thana..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl shadow-black/5 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-800 font-medium"
          />
        </div>
        
        <button 
          onClick={onProfileClick}
          className="p-4 bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl shadow-black/5 text-slate-600 hover:text-emerald-600 transition-all"
        >
          <UserCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
