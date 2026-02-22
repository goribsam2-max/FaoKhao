import React from 'react';
import { LocationData, CATEGORIES } from '../types';
import { X, Navigation, Clock, CheckCircle2, AlertTriangle, User, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface LocationDetailProps {
  location: LocationData | null;
  onClose: () => void;
  onVerify: (type: 'verified' | 'fake') => void;
}

export default function LocationDetail({ location, onClose, onVerify }: LocationDetailProps) {
  if (!location) return null;

  const isExpired = Date.now() - location.createdAt > 24 * 60 * 60 * 1000;
  const category = CATEGORIES.find(c => c.id === location.category);

  const handleDirections = () => {
    const { lat, lng } = location;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      window.open(`http://maps.apple.com/?daddr=${lat},${lng}`, '_blank');
    } else {
      window.open(`geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(location.name)})`, '_blank');
      // Fallback to Google Maps if geo: fails
      setTimeout(() => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
      }, 500);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Faokhao: ${location.name}`,
          text: `Check out this ${location.category} spot in Bangladesh!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <AnimatePresence>
      {location && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="relative h-64">
              <img src={location.imageUrl} alt={location.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    isExpired ? "bg-slate-500 text-white" : "bg-emerald-500 text-white"
                  )}>
                    {isExpired ? 'Expired' : 'Active'}
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {category?.label}
                  </span>
                </div>
                <h2 className="text-2xl font-display font-bold text-white leading-tight">{location.name}</h2>
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between text-slate-500 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Posted {formatDistanceToNow(location.createdAt)} ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>by {location.userName}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-slate-700 leading-relaxed">{location.details || 'No extra details provided.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleDirections}
                  className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
                >
                  <Navigation className="w-5 h-5" />
                  Get Directions
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                  Share Spot
                </button>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="font-display font-bold text-slate-800">Community Verification</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => onVerify('verified')}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-emerald-50 bg-emerald-50/30 hover:bg-emerald-50 transition-all group"
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                      <div className="text-sm font-bold text-emerald-700">Still Available</div>
                      <div className="text-[10px] text-emerald-600 font-medium">{location.verifiedCount} confirmations</div>
                    </div>
                  </button>
                  <button
                    onClick={() => onVerify('fake')}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-rose-50 bg-rose-50/30 hover:bg-rose-50 transition-all group"
                  >
                    <AlertTriangle className="w-8 h-8 text-rose-500 group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                      <div className="text-sm font-bold text-rose-700">Finished / Fake</div>
                      <div className="text-[10px] text-rose-600 font-medium">{location.fakeCount} reports</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
