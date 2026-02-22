import React, { useState, useEffect } from 'react';
import { Heart, Users, ShieldCheck, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function CommunityPage() {
  const [counts, setCounts] = useState({ locations: 0, users: 0 });
  const [topContributors, setTopContributors] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const locsSnap = await getDocs(collection(db, 'locations'));
      const locs = locsSnap.docs.map(d => d.data());
      
      // Group by user
      const userCounts = new Map();
      locs.forEach(l => {
        const name = l.userName || 'Anonymous';
        const count = userCounts.get(name) || 0;
        userCounts.set(name, count + 1);
      });

      const sorted = Array.from(userCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTopContributors(sorted);
      setCounts({
        locations: locsSnap.size,
        users: userCounts.size
      });
    };
    fetchStats();
  }, []);

  const stats = [
    { label: 'মোট খানা পিনা', value: counts.locations.toLocaleString('bn-BD'), icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'পেটুক মেম্বার', value: counts.users.toLocaleString('bn-BD'), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'সত্যিকারের খবর', value: '৯২%', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'পেটুক স্কোর', value: '৪.৯', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="pb-32 overflow-y-auto h-full bg-white">
      <header className="px-6 pt-8 pb-4 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-tight text-rose-600">আমাদের পাওয়ার! 💪</span>
          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
        </div>
        <h1 className="text-3xl font-display font-bold text-black leading-tight">
          পেটুকদের ইমপ্যাক্ট
        </h1>
        <p className="text-slate-500 text-xs font-medium leading-normal">
          সবাই মিলে খাই, সবাই মিলে বাঁচি! 🍛
        </p>
      </header>

      <div className="px-4 grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            key={stat.label}
            className="bg-slate-50 p-5 rounded-2xl border border-black/5 text-center"
          >
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2", stat.bg, stat.color)}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div className="text-xl font-display font-bold text-black">{stat.value}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="px-4 mt-6">
        <div className="bg-black rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full -mr-24 -mt-24 blur-3xl" />
          <h3 className="text-xl font-display font-bold mb-1 leading-tight">মাসের সেরা পেটুক 👑</h3>
          <p className="text-white/60 text-[10px] leading-normal mb-4">
            অভিনন্দন <strong>{topContributors[0]?.name || 'Samir'}</strong> কে! 🏆
          </p>
          <button className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-[10px] shadow-lg shadow-emerald-500/20">
            সেরাদের তালিকা দেখো
          </button>
        </div>
      </div>

      <div className="px-6 mt-8 space-y-4">
        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">Top Foodies 🎖️</div>
        <div className="space-y-3">
          {topContributors.map((user, i) => (
            <div key={user.name} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center font-display font-bold text-slate-300 border border-black/5 group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
                  0{i + 1}
                </div>
                <div>
                  <div className="text-sm font-bold text-black">{user.name}</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">খাবারের ওস্তাদ</div>
                </div>
              </div>
              <div className="text-emerald-500 font-display font-bold text-base">+{user.count * 10}</div>
            </div>
          ))}
          {topContributors.length === 0 && (
            <div className="text-center py-8 text-slate-300 font-bold uppercase tracking-tight text-[9px]">
              এখনো কেউ ওস্তাদ হয় নাই! 😭
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

