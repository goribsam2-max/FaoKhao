import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CATEGORIES = [
  { id: 'free_khana', label: 'ফ্রি খানা 😋', color: '#ef4444', icon: 'Utensils' },
  { id: 'tran', label: 'গরিবের ত্রাণ 📦', color: '#3b82f6', icon: 'Heart' },
  { id: 'jilapi', label: 'মসজিদে জিলাপি 🥨', color: '#10b981', icon: 'Church' },
  { id: 'biriyani', label: 'মসজিদে বিরিয়ানি 🍛', color: '#f59e0b', icon: 'Church' },
  { id: 'custom', label: 'অন্যান্য (কাস্টম) ✨', color: '#8b5cf6', icon: 'Plus' },
] as const;

export type Category = typeof CATEGORIES[number]['id'] | string;

export interface LocationData {
  id: string;
  name: string;
  category: string;
  details: string;
  imageUrl: string;
  lat: number;
  lng: number;
  createdAt: number;
  userId: string;
  userName: string;
  verifiedCount: number;
  fakeCount: number;
  customCategory?: string;
}

export interface Review {
  id: string;
  locationId: string;
  userId: string;
  userName: string;
  type: 'verified' | 'fake';
  comment: string;
  createdAt: number;
}
