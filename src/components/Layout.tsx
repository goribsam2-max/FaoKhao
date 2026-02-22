import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import { motion } from 'motion/react';

export default function Layout() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <main className="flex-1 pb-24 relative overflow-x-hidden overflow-y-auto h-screen no-scrollbar">
        <Outlet />
      </main>
      
      <BottomNav />
      
      <footer className="fixed bottom-24 left-0 right-0 text-center py-1 pointer-events-none z-50">
        <div className="inline-flex flex-col items-center">
          <span className="text-[7px] font-bold text-black/10 uppercase tracking-[0.4em]">
            Proudly Crafted for পেটুকস by SAMIR
          </span>
        </div>
      </footer>

      {/* Global Funny Overlay or Accents */}
      <div className="fixed top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500/50 via-rose-500/50 to-blue-500/50 z-[100]" />
    </div>
  );
}
