import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LocationData, CATEGORIES } from '../types';
import Map from '../components/Map';
import { useNavigate } from 'react-router-dom';
import { Search, LocateFixed, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [center, setCenter] = useState<[number, number]>([23.8103, 90.4125]);
  const [filter, setFilter] = useState('সব');
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'locations'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        const q2 = query(collection(db, 'locations'));
        onSnapshot(q2, (snap) => {
          setLocations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LocationData[]);
        });
      } else {
        setLocations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LocationData[]);
      }
    }, (err) => {
      console.error("Firestore error:", err);
      const q2 = query(collection(db, 'locations'));
      onSnapshot(q2, (snap) => {
        setLocations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LocationData[]);
      });
    });
    return () => unsub();
  }, []);

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  };

  const filteredLocations = filter === 'সব' 
    ? locations 
    : locations.filter(loc => loc.category === filter || (filter === 'custom' && loc.category === 'custom'));

  return (
    <div className="h-screen w-full relative bg-white">
      <div className="absolute top-6 left-4 right-4 z-40 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="flex-1 bg-black text-white rounded-2xl shadow-xl flex items-center px-4 py-3 border border-white/10">
            <Search className="w-4 h-4 text-white/40 mr-3" />
            <input 
              placeholder="খাবার কই আছে? (জেলা/থানা)" 
              className="bg-transparent border-none outline-none w-full text-sm font-bold placeholder:text-white/20"
            />
          </div>
          <button 
            onClick={handleLocate}
            className="p-3 bg-white text-black rounded-2xl shadow-xl hover:bg-slate-50 transition-all border border-black/5 flex items-center justify-center"
          >
            <LocateFixed className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button 
            onClick={() => setFilter('সব')}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight shadow-lg transition-all border ${filter === 'সব' ? 'bg-black text-white border-black' : 'bg-white/90 backdrop-blur-md text-black border-black/5'}`}
          >
            সব খাবার 🍱
          </button>
          {CATEGORIES.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight shadow-lg transition-all border whitespace-nowrap ${filter === cat.id ? 'bg-black text-white border-black' : 'bg-white/90 backdrop-blur-md text-black border-black/5'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-32 left-4 z-40">
        <div className="bg-black text-white px-3 py-1.5 rounded-xl text-[9px] font-bold flex items-center gap-2 shadow-xl">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>ম্যাপে ক্লিক করে খাবার শেয়ার করো! 🚀</span>
        </div>
      </div>

      <Map 
        locations={filteredLocations} 
        onMarkerClick={(loc) => navigate(`/location/${loc.id}`)}
        onMapClick={(lat, lng) => navigate(`/add?lat=${lat}&lng=${lng}`)}
        center={center}
      />
    </div>
  );
}
