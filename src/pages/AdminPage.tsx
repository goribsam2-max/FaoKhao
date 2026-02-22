import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Shield, Users, MapPin, Trash2, Ban, UserCheck, Search, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

import { useNotification } from '../components/NotificationProvider';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { show } = useNotification();

  useEffect(() => {
    if (auth.currentUser?.email !== 'claimfaf@gmail.com') {
      navigate('/');
      return;
    }

    const unsubLocations = onSnapshot(collection(db, 'locations'), (snap) => {
      setLocations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const fetchUsers = async () => {
      const usersSnap = await getDocs(collection(db, 'users'));
      const locsSnap = await getDocs(collection(db, 'locations'));
      const revsSnap = await getDocs(collection(db, 'reviews'));
      
      const locCounts = new Map();
      locsSnap.forEach(d => {
        const uid = d.data().userId;
        locCounts.set(uid, (locCounts.get(uid) || 0) + 1);
      });

      const revCounts = new Map();
      revsSnap.forEach(d => {
        const uid = d.data().userId;
        revCounts.set(uid, (revCounts.get(uid) || 0) + 1);
      });

      const usersList = usersSnap.docs.map(d => {
        const data = d.data();
        return {
          uid: d.id,
          name: data.name || 'Unknown',
          email: data.email || 'Hidden',
          locations: locCounts.get(d.id) || 0,
          reviews: revCounts.get(d.id) || 0,
          banned: data.banned || false
        };
      });

      setUsers(usersList);
      setLoading(false);
    };

    fetchUsers();
    return () => unsubLocations();
  }, [navigate]);

  const handleBan = async (userId: string, status: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { banned: status });
      show(status ? 'ইউজার ব্যান হইছে! 🚫' : 'ইউজার মাফ পাইছে! ✨');
      // Refresh users list
      const usersSnap = await getDocs(collection(db, 'users'));
      const locsSnap = await getDocs(collection(db, 'locations'));
      const revsSnap = await getDocs(collection(db, 'reviews'));
      
      const locCounts = new Map();
      locsSnap.forEach(d => {
        const uid = d.data().userId;
        locCounts.set(uid, (locCounts.get(uid) || 0) + 1);
      });

      const revCounts = new Map();
      revsSnap.forEach(d => {
        const uid = d.data().userId;
        revCounts.set(uid, (revCounts.get(uid) || 0) + 1);
      });

      const usersList = usersSnap.docs.map(d => {
        const data = d.data();
        return {
          uid: d.id,
          name: data.name || 'Unknown',
          email: data.email || 'Hidden',
          locations: locCounts.get(d.id) || 0,
          reviews: revCounts.get(d.id) || 0,
          banned: data.banned || false
        };
      });
      setUsers(usersList);
    } catch (err) {
      show('Failed to update user status');
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      await deleteDoc(doc(db, 'locations', id));
      show('লোকেশন ডিলিট হইছে! 🗑️');
    }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="p-12 text-center font-bold text-slate-400 uppercase tracking-tight">এডমিন ঢুকতেছে... 👑</div>;

  return (
    <div className="pb-32 overflow-y-auto h-full bg-white">
      <header className="px-6 pt-8 pb-4 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-tight text-rose-600">এডমিন কন্ট্রোল 👑</span>
          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
        </div>
        <h1 className="text-3xl font-display font-bold text-black leading-tight">
          সিস্টেম কন্ট্রোল
        </h1>
        <p className="text-slate-500 text-xs font-medium leading-normal">
          মডারেশন এবং ইউজার ম্যানেজমেন্ট। সাবধানে ভাই! 🕹️
        </p>
      </header>

      <div className="px-4 grid grid-cols-2 gap-3">
        <div className="bg-slate-50 p-5 rounded-2xl border border-black/5 text-center">
          <div className="text-xl font-display font-bold text-black">{locations.length}</div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">Total Spots 📍</div>
        </div>
        <div className="bg-slate-50 p-5 rounded-2xl border border-black/5 text-center">
          <div className="text-xl font-display font-bold text-black">{users.length}</div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">Total Users 👥</div>
        </div>
      </div>

      <div className="px-6 mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">User Management</div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
            <input 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-black/5 rounded-lg text-[10px] focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
        
        <div className="space-y-3">
          {filteredUsers.map(u => (
            <div key={u.uid} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center border border-black/5">
                  <Users className="w-4 h-4 text-slate-300" />
                </div>
                <div>
                  <div className="text-sm font-bold text-black">{u.name}</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{u.locations} Posts • {u.reviews} Reviews</div>
                </div>
              </div>
              <button 
                onClick={() => handleBan(u.uid, !u.banned)}
                className={cn(
                  "p-2 rounded-xl transition-all border",
                  u.banned ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                )}
              >
                {u.banned ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 mt-8 space-y-4">
        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">Location Moderation</div>
        <div className="space-y-3">
          {locations.slice(0, 10).map(loc => (
            <div key={loc.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3 min-w-0">
                <img src={loc.imageUrl} className="w-9 h-9 rounded-xl object-cover border border-black/5" />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-black truncate">{loc.name}</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{loc.userName}</div>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteLocation(loc.id)}
                className="p-2 bg-slate-50 text-rose-600 rounded-xl border border-black/5 hover:bg-rose-50 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 mt-8 space-y-4">
        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">Advanced Controls</div>
        <div className="grid grid-cols-1 gap-2">
          {[
            { label: 'Verify All Pending Spots', icon: Shield, color: 'text-emerald-500' },
            { label: 'Clear Expired Locations', icon: Trash2, color: 'text-rose-500' },
            { label: 'Send Global Notification', icon: Users, color: 'text-blue-500' },
            { label: 'View Reported Content', icon: Ban, color: 'text-amber-500' },
            { label: 'Maintenance Mode', icon: Loader2, color: 'text-slate-400' },
          ].map((item) => (
            <button key={item.label} className="w-full p-3.5 bg-slate-50 rounded-xl border border-black/5 text-left font-bold text-black flex items-center justify-between hover:bg-slate-100 transition-all">
              <span className="text-[11px]">{item.label}</span>
              <item.icon className={cn("w-3.5 h-3.5", item.color)} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
