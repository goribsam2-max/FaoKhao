import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { CATEGORIES } from '../types';
import { X, Upload, Loader2, MapPin, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useNotification } from '../components/NotificationProvider';

export default function AddLocationPage() {
  const navigate = useNavigate();
  const { show } = useNotification();
  const [searchParams] = useSearchParams();
  const lat = parseFloat(searchParams.get('lat') || '23.8103');
  const lng = parseFloat(searchParams.get('lng') || '90.4125');

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const selectedCategory = watch('category');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: any) => {
    if (!auth.currentUser || auth.currentUser.isAnonymous) {
      return show('আগে লগইন করো ভাই, নাহলে খাবার পাবা না! 😂');
    }

    // Check if banned
    const userQuery = query(collection(db, 'users'), where('uid', '==', auth.currentUser.uid));
    const userSnap = await getDocs(userQuery);
    if (!userSnap.empty && userSnap.docs[0].data().banned) {
      return show('ওরে বাবা! তুমি তো ব্যান খাইছো! আর খাবার শেয়ার করতে পারবা না। 🚫');
    }

    if (!selectedFile) return show('একটা ছবি তো দাও ভাই, মানুষ বিশ্বাস করবে কেমনে? 📸');
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      const response = await fetch(`https://api.imgbb.com/1/upload?key=d008fd853300ce74478c6f59206210bc`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      
      if (result.success) {
        await addDoc(collection(db, 'locations'), {
          ...data,
          imageUrl: result.data.url,
          lat,
          lng,
          createdAt: Date.now(),
          userId: auth.currentUser.uid,
          userName: auth.currentUser.displayName || 'অজানা পেটুক',
          verifiedCount: 0,
          fakeCount: 0,
        });
        show('খবর পাবলিশ হইছে! মানুষ এখন খাইতে পারবে! 🚀');
        navigate('/feed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      show('ধুর! কি জানি হইলো, আপলোড হইলো না। আবার ট্রাই করো। 😫');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="pb-32 overflow-y-auto h-full bg-white">
      <header className="px-6 pt-8 pb-4 space-y-1">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-slate-50 rounded-xl border border-black/5">
            <ChevronLeft className="w-4 h-4 text-black" />
          </button>
          <div className="text-right">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">খাবার কই? 📍</div>
            <div className="text-[10px] font-bold text-black">{lat.toFixed(4)}, {lng.toFixed(4)}</div>
          </div>
        </div>
        <h1 className="text-3xl font-display font-bold text-black leading-tight">
          খাবার কই আছে?
        </h1>
        <p className="text-slate-500 text-xs font-medium leading-normal">
          সঠিক তথ্য দাও ভাই, মানুষ খায়া দোয়া করবে! 🙌
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="px-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight ml-1">জায়গার নাম (কি পাওয়া যায়?)</label>
            <input
              {...register('name', { required: true })}
              placeholder="উদা: ফেনীতে বিরিয়ানি দিচ্ছে ফ্রি!"
              className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-black/5 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium placeholder:text-slate-300"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight ml-1">কি ক্যাটাগরি? (বেছে নাও)</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <label key={cat.id} className="cursor-pointer">
                  <input
                    type="radio"
                    {...register('category', { required: true })}
                    value={cat.id}
                    className="peer sr-only"
                  />
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-black/5 bg-slate-50 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 transition-all h-full">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight peer-checked:text-emerald-600 text-center">{cat.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {selectedCategory === 'custom' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight ml-1">কাস্টম ক্যাটাগরি (নাম দাও)</label>
              <input
                {...register('customCategory', { required: true })}
                placeholder="উদা: বিরিয়ানি মেলা"
                className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-black/5 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium placeholder:text-slate-300"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight ml-1">বিস্তারিত (একটু খুইলা কও)</label>
            <textarea
              {...register('details')}
              placeholder="খাবার কেমন? ভিড় কেমন? সব কও..."
              rows={2}
              className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-black/5 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium resize-none placeholder:text-slate-300"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight ml-1">ছবি (প্রমাণ কই? 📸)</label>
            <div 
              className={cn(
                "relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all overflow-hidden",
                previewUrl ? "aspect-video" : "h-40 border-slate-100 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/30"
              )}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 backdrop-blur-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-2 border border-black/5">
                    <Upload className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">ছবি আপলোড করো</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="w-full py-4 bg-black text-white font-bold rounded-xl shadow-lg shadow-black/10 hover:bg-slate-900 transition-all disabled:opacity-70 flex items-center justify-center gap-2 text-xs"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'পাবলিশ করো! 🚀'}
        </button>
      </form>
    </div>
  );
}
