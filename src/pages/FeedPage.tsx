import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LocationData, CATEGORIES } from '../types';
import { Clock, MapPin, ChevronRight, Heart, Utensils, Church } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useNotification } from '../components/NotificationProvider';

export default function FeedPage() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const { show } = useNotification();

  useEffect(() => {
    // Try query without orderBy first if data is missing, or just handle missing createdAt
    const q = query(collection(db, 'locations'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // Fallback to unordered query if ordered one returns nothing (might happen during index build or missing fields)
        const q2 = query(collection(db, 'locations'));
        onSnapshot(q2, (snap) => {
          setLocations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LocationData[]);
        });
      } else {
        setLocations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LocationData[]);
      }
    }, (err) => {
      console.error("Firestore error:", err);
      // Fallback on error
      const q2 = query(collection(db, 'locations'));
      onSnapshot(q2, (snap) => {
        setLocations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LocationData[]);
      });
    });
    return () => unsub();
  }, []);

  const getIcon = (cat: string) => {
    const category = CATEGORIES.find(c => c.id === cat);
    if (category?.id === 'free_khana') return <Utensils className="w-3 h-3" />;
    if (category?.id === 'tran') return <Heart className="w-3 h-3" />;
    return <Church className="w-3 h-3" />;
  };

  return (
    <div className="pb-32 overflow-y-auto h-full bg-white">
      <header className="px-6 pt-8 pb-4 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-tight text-rose-600">তাজা খবর! 🔥</span>
          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
        </div>
        <h1 className="text-3xl font-display font-bold text-black leading-tight">
          খাবারের মেলা
        </h1>
        <p className="text-slate-500 text-xs font-medium leading-normal">
          দেখো ভাই কই কি পাওয়া যাচ্ছে, দেরি করলে কিন্তু পস্তাবা! 🏃‍♂️💨
        </p>
      </header>

      <div className="px-4 space-y-4">
        {locations.map((loc, index) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            key={loc.id}
          >
            <Link 
              to={`/location/${loc.id}`}
              className="block group"
            >
              <div className="relative aspect-[16/10] rounded-3xl overflow-hidden mb-2 shadow-lg shadow-black/5">
                <img 
                  src={loc.imageUrl} 
                  alt={loc.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                
                <div className="absolute top-4 left-4">
                  <span className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-tight backdrop-blur-md border border-white/10",
                    loc.category === 'free_khana' ? "bg-rose-500/40 text-white" : 
                    loc.category === 'tran' ? "bg-blue-500/40 text-white" : "bg-emerald-500/40 text-white"
                  )}>
                    {getIcon(loc.category)}
                    {loc.category === 'custom' ? loc.customCategory : (CATEGORIES.find(c => c.id === loc.category)?.label || loc.category)}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] text-white/70 font-bold uppercase tracking-tight flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {loc.createdAt ? `${formatDistanceToNow(loc.createdAt)} আগে` : 'কিছুক্ষণ আগে'}
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-white leading-tight group-hover:text-emerald-400 transition-colors">
                    {loc.name}
                  </h3>
                </div>
              </div>
              
              <div className="px-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                    <span className="text-[9px] font-bold text-black uppercase tracking-tight">{loc.verifiedCount} সত্য</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-rose-500 rounded-full" />
                    <span className="text-[9px] font-bold text-black uppercase tracking-tight">{loc.fakeCount} ভুয়া</span>
                  </div>
                </div>
                <div className="w-7 h-7 bg-black text-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
        
        {locations.length === 0 && (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-black/5">
              <Clock className="w-6 h-6 text-slate-200" />
            </div>
            <div className="space-y-0.5">
              <p className="text-black font-bold uppercase tracking-tight text-xs">এখনো কেউ কিছু দেয় নাই! 😭</p>
              <p className="text-slate-400 text-[9px] font-medium">সবাই কি কৃপণ হয়ে গেল নাকি? তুমিই প্রথম হও ভাই! 🚀</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
