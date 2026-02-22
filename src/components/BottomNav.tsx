import React from 'react';
import { NavLink } from 'react-router-dom';
import { Map, List, PlusCircle, User, Heart, LayoutGrid, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function BottomNav() {
  const navItems = [
    { to: '/', icon: Map, label: 'ম্যাপ' },
    { to: '/feed', icon: LayoutGrid, label: 'ফিড' },
    { to: '/add', icon: PlusCircle, label: 'শেয়ার', primary: true },
    { to: '/community', icon: Users, label: 'ইমপ্যাক্ট' },
    { to: '/profile', icon: User, label: 'প্রোফাইল' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[85%] max-w-sm">
      <div className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-1.5 flex items-center justify-between shadow-2xl shadow-black/40">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "relative flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl transition-all duration-500",
              item.primary ? "bg-emerald-500 text-white shadow-2xl shadow-emerald-500/40 scale-105 -translate-y-3" : 
              isActive ? "text-white" : "text-white/40 hover:text-white/60"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && !item.primary && (
                  <motion.div 
                    layoutId="nav-active"
                    className="absolute inset-0 bg-white/10 rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={cn("w-4 h-4 relative z-10", item.primary && "w-5 h-5")} />
                {!item.primary && (
                  <span className="text-[9px] font-bold tracking-tight mt-1 relative z-10">{item.label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
