import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Loader2 } from 'lucide-react';
import { CATEGORIES, Category } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  coords: { lat: number; lng: number } | null;
}

export default function AddLocationModal({ isOpen, onClose, onSubmit, coords }: AddLocationModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onFormSubmit = async (data: any) => {
    if (!selectedFile) return alert('Please upload an image');
    
    setIsUploading(true);
    try {
      // Upload to ImgBB
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      const response = await fetch(`https://api.imgbb.com/1/upload?key=d008fd853300ce74478c6f59206210bc`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      if (result.success) {
        await onSubmit({
          ...data,
          imageUrl: result.data.url,
          lat: coords?.lat,
          lng: coords?.lng,
        });
        reset();
        setPreviewUrl(null);
        setSelectedFile(null);
        onClose();
      } else {
        throw new Error('Image upload failed');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to add location');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-display font-bold text-slate-800">Add New Spot</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Place Name</label>
                <input
                  {...register('name', { required: true })}
                  placeholder="e.g. Baitul Mukarram Jilapi Distribution"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Category</label>
                <div className="grid grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => (
                    <label key={cat.id} className="cursor-pointer">
                      <input
                        type="radio"
                        {...register('category', { required: true })}
                        value={cat.id}
                        className="peer sr-only"
                      />
                      <div className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-slate-100 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 transition-all">
                        <span className="text-xs font-bold text-slate-600 peer-checked:text-emerald-700">{cat.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Details</label>
                <textarea
                  {...register('details')}
                  placeholder="What's happening? How much is left?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Photo</label>
                <div 
                  className={cn(
                    "relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all overflow-hidden",
                    previewUrl ? "aspect-video" : "h-32 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30"
                  )}
                >
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-sm text-slate-500 font-medium">Click to upload photo</span>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Share with Community'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
