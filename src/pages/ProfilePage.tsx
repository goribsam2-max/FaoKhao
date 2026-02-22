import React, { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { LogOut, User, Mail, Lock, UserPlus, LogIn, Heart, MapPin, Award, Shield, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

import { useNotification } from '../components/NotificationProvider';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { show } = useNotification();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ shared: 0, verified: 0 });
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (u && !u.isAnonymous) {
        setUser(u);
        // Fetch real stats
        const locationsQuery = query(collection(db, 'locations'), where('userId', '==', u.uid));
        const locationsSnap = await getDocs(locationsQuery);
        
        const reviewsQuery = query(collection(db, 'reviews'), where('userId', '==', u.uid));
        const reviewsSnap = await getDocs(reviewsQuery);
        
        setStats({
          shared: locationsSnap.size,
          verified: reviewsSnap.size
        });
      }
      else setUser(null);
    });
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return show('আরে ভাই! ইমেইল আর পাসওয়ার্ড তো দাও! 🤦‍♂️');
    if (!isLogin && !name) return show('তোমার নাম কি? নাম ছাড়া তো কেউ চিনবে না! 😂');

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        show('ভিতরে স্বাগতম ভাই! পেট ভরে খাও! 🍛');
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        // Create user doc with UID as ID
        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid,
          name,
          email,
          banned: false,
          createdAt: Date.now()
        });
        show('রেজিস্ট্রেশন হইছে! এখন তুমিও পেটুক! ✨');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      show("ধুর! কি জানি হইলো: " + err.message + " 😫");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6 pb-32 space-y-6 overflow-y-auto h-full bg-white">
        <header className="pt-8 space-y-1">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">কে তুমি ভাই? 🤔</div>
          <h1 className="text-3xl font-display font-bold text-black leading-tight">
            তোমার প্রোফাইল
          </h1>
          <p className="text-slate-500 text-xs font-medium leading-normal">
            খাবার খুঁজতে হলে আগে মেম্বার হও! 🍔
          </p>
        </header>

        <div className="bg-slate-50 rounded-3xl p-6 border border-black/5 space-y-5">
          <div className="flex gap-2 p-1 bg-white rounded-xl border border-black/5">
            <button 
              type="button"
              onClick={() => setIsLogin(true)}
              className={cn("flex-1 py-2 rounded-lg font-bold text-[10px] transition-all", isLogin ? "bg-black text-white shadow-lg" : "text-slate-400")}
            >
              আছি (লগইন)
            </button>
            <button 
              type="button"
              onClick={() => setIsLogin(false)}
              className={cn("flex-1 py-2 rounded-lg font-bold text-[10px] transition-all", !isLogin ? "bg-black text-white shadow-lg" : "text-slate-400")}
            >
              নতুন (রেজিস্ট্রেশন)
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-3">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">তোমার নাম</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="উদা: পেটুক সামির"
                    className="w-full pl-11 pr-4 py-3.5 bg-white rounded-xl border border-black/5 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">ইমেইল</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="খাওয়ার ইমেইল দাও"
                  className="w-full pl-11 pr-4 py-3.5 bg-white rounded-xl border border-black/5 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="গোপন পাসওয়ার্ড"
                  className="w-full pl-11 pr-4 py-3.5 bg-white rounded-xl border border-black/5 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-white rounded-xl font-bold shadow-lg shadow-black/5 hover:bg-slate-900 transition-all mt-2 disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLogin ? 'ভিতরে চলো! 🚀' : 'মেম্বার হও! ✨')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-32 space-y-6 overflow-y-auto h-full bg-white">
      <header className="pt-8 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">পেটুক প্রোফাইল 😎</div>
          <h1 className="text-3xl font-display font-bold text-black leading-tight">
            {user.displayName?.split(' ')[0]}
          </h1>
          <p className="text-slate-400 text-[10px] font-medium">{user.email}</p>
        </div>
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-black/5">
          <User className="w-7 h-7 text-slate-200" />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 p-5 rounded-2xl border border-black/5 text-center">
          <div className="w-9 h-9 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-2">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="text-xl font-display font-bold text-black">{stats.shared}</div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">খাবার দিছো</div>
        </div>
        <div className="bg-slate-50 p-5 rounded-2xl border border-black/5 text-center">
          <div className="w-9 h-9 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Award className="w-4 h-4" />
          </div>
          <div className="text-xl font-display font-bold text-black">{stats.verified}</div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">প্রমাণ করছো</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">সেটিংস (দরকারি) ⚙️</div>
        <div className="space-y-2">
          {user.email === 'claimfaf@gmail.com' && (
            <button
              onClick={() => navigate('/admin')}
              className="w-full p-4 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-between group text-xs"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4" />
                <span>বড় এডমিন প্যানেল 👑</span>
              </div>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
          <button
            onClick={() => {
              signOut(auth);
              show('টাটা ভাই! আবার আইসো কিন্তু! 👋');
            }}
            className="w-full p-4 bg-slate-50 text-rose-600 rounded-xl border border-black/5 font-bold flex items-center justify-between group text-xs"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4" />
              <span>বাইরে চলো (টাটা!) 👋</span>
            </div>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
