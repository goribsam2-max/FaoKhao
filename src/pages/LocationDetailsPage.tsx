import { db, auth } from '../lib/firebase';
import { LocationData, Review, CATEGORIES } from '../types';
import { ChevronLeft, Navigation, Share2, Clock, User, CheckCircle2, AlertTriangle, MessageSquare, Send, ShieldCheck, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useNotification } from '../components/NotificationProvider';

export default function LocationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { show } = useNotification();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchLocation = async () => {
      const docSnap = await getDoc(doc(db, 'locations', id));
      if (docSnap.exists()) {
        setLocation({ id: docSnap.id, ...docSnap.data() } as LocationData);
      }
      setLoading(false);
    };

    const q = query(collection(db, 'reviews'), where('locationId', '==', id), orderBy('createdAt', 'desc'));
    const unsubReviews = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[]);
    });

    fetchLocation();
    return () => unsubReviews();
  }, [id]);

  const handleVerify = async (type: 'verified' | 'fake') => {
    if (!location || !auth.currentUser || auth.currentUser.isAnonymous) {
      return show('আরে ভাই! আগে লগইন তো করো! 🤦‍♂️');
    }

    // Check if banned
    const userQuery = query(collection(db, 'users'), where('uid', '==', auth.currentUser.uid));
    const userSnap = await getDocs(userQuery);
    if (!userSnap.empty && userSnap.docs[0].data().banned) {
      return show('ধুর! তুমি তো ব্যান খাইছো! কিছু করতে পারবা না। 🚫');
    }
    
    const locRef = doc(db, 'locations', location.id);
    await updateDoc(locRef, {
      [type === 'verified' ? 'verifiedCount' : 'fakeCount']: increment(1)
    });
    
    await addDoc(collection(db, 'reviews'), {
      locationId: location.id,
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'অজানা পেটুক',
      type,
      comment: type === 'verified' ? 'হ্যাঁ ভাই! আমি নিজে দেখে আসছি, খাবার আছে! 😋' : 'ধুর মিয়া! গিয়ে দেখি কিছুই নাই, সব শেষ! 😫',
      createdAt: Date.now()
    });
    show(type === 'verified' ? 'সাবাস! তথ্য দেওয়ার জন্য ধন্যবাদ। 🙌' : 'ধন্যবাদ ভাই, ভুয়া তথ্য ধরা দরকার! 👊');
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.trim() || !location || !auth.currentUser || auth.currentUser.isAnonymous) {
      return show('আগে লগইন করো ভাই, তারপর কমেন্ট দিও! 🤫');
    }

    // Check if banned
    const userQuery = query(collection(db, 'users'), where('uid', '==', auth.currentUser.uid));
    const userSnap = await getDocs(userQuery);
    if (!userSnap.empty && userSnap.docs[0].data().banned) {
      return show('ব্যান খেয়ে আবার কমেন্ট করতে আসছো? সাহস তো কম না! 😂');
    }

    await addDoc(collection(db, 'reviews'), {
      locationId: location.id,
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'অজানা পেটুক',
      type: 'verified',
      comment: newReview,
      createdAt: Date.now()
    });
    setNewReview('');
    show('কমেন্ট হইছে! পেটুকরা এখন জানতে পারবে। 📣');
  };

  if (loading) return <div className="p-12 text-center font-bold text-slate-400 uppercase tracking-tight">একটু দাঁড়াও ভাই, খাবার খুঁজতেছি... 🔍</div>;
  if (!location) return <div className="p-12 text-center font-bold text-slate-400 uppercase tracking-tight">ধুর! খাবার তো খুঁজে পাইলাম না! 😫</div>;

  const isExpired = Date.now() - location.createdAt > 24 * 60 * 60 * 1000;

  return (
    <div className="pb-32 overflow-y-auto h-full bg-white">
      <div className="relative h-[40vh]">
        <img src={location.imageUrl} alt={location.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-2.5 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-all border border-white/10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="absolute bottom-6 left-6 right-6 space-y-1">
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-tight border border-white/10 backdrop-blur-md",
              isExpired ? "bg-slate-500/20 text-slate-300" : "bg-emerald-500/20 text-emerald-300"
            )}>
              {isExpired ? 'বাসি খবর 🕰️' : 'তাজা খবর 🔥'}
            </span>
            <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md text-white/80 rounded-full text-[9px] font-bold uppercase tracking-tight border border-white/10">
              {location.category === 'custom' ? location.customCategory : (CATEGORIES.find(c => c.id === location.category)?.label || location.category)}
            </span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white leading-tight tracking-tighter">
            {location.name}
          </h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-black/5">
              <User className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">খবর দিছে 🗣️</div>
              <div className="text-xs font-bold text-black">{location.userName}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">কখন দিছে</div>
            <div className="text-xs font-bold text-black">{formatDistanceToNow(location.createdAt)} আগে</div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-rose-600 uppercase tracking-tight ml-1">আসল কথা 📝</div>
          <p className="text-sm font-medium text-slate-800 leading-normal bg-slate-50 p-4 rounded-2xl border border-black/5">
            {location.details || 'কোন অতিরিক্ত তথ্য নাই ভাই, গিয়েই দেখো! 😂'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              const { lat, lng } = location;
              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
              if (isIOS) window.open(`http://maps.apple.com/?daddr=${lat},${lng}`, '_blank');
              else window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
            }}
            className="flex items-center justify-center gap-2 py-3.5 bg-black text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg shadow-black/5 text-xs"
          >
            <Navigation className="w-4 h-4" />
            রাস্তা দেখাও
          </button>
          <button
            onClick={async () => {
              if (navigator.share) {
                try {
                  await navigator.share({ 
                    title: location.name, 
                    text: `ফাওখাও: ${location.name} - ${location.category} স্পটটি দেখুন!`,
                    url: window.location.href 
                  });
                } catch (err: any) {
                  if (err.name !== 'AbortError') {
                    console.error('Share failed:', err);
                  }
                }
              } else {
                navigator.clipboard.writeText(window.location.href);
                show('লিঙ্ক কপি হইছে, এখন বন্ধুদের পাঠাও! 🔗');
              }
            }}
            className="flex items-center justify-center gap-2 py-3.5 bg-white text-black border border-black/10 rounded-xl font-bold hover:bg-slate-50 transition-all text-xs"
          >
            <Share2 className="w-4 h-4" />
            শেয়ার করো
          </button>
        </div>

        <div className="space-y-4 pt-6 border-t border-slate-100">
          <div className="text-[10px] font-bold text-rose-600 uppercase tracking-tight ml-1">সত্যি না মিথ্যা? 🤔</div>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleVerify('verified')}
              className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-black/5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 transition-all group"
            >
              <CheckCircle2 className="w-7 h-7 text-emerald-500 group-hover:scale-110 transition-transform" />
              <div className="text-center">
                <div className="text-xs font-bold text-black">এখনও আছে</div>
                <div className="text-[9px] text-emerald-600 font-bold mt-0.5 uppercase tracking-tight">{location.verifiedCount} জন বলছে</div>
              </div>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleVerify('fake')}
              className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-black/5 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 transition-all group"
            >
              <AlertTriangle className="w-7 h-7 text-rose-500 group-hover:scale-110 transition-transform" />
              <div className="text-center">
                <div className="text-xs font-bold text-black">সব শেষ / ফেক</div>
                <div className="text-[9px] text-rose-600 font-bold mt-0.5 uppercase tracking-tight">{location.fakeCount} জন বলছে</div>
              </div>
            </motion.button>
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between px-1">
            <div className="text-[10px] font-bold text-rose-600 uppercase tracking-tight">মতামত (গল্প সল্প) 💬</div>
            <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[9px] font-bold text-slate-500">{reviews.length}</span>
          </div>

          <form onSubmit={handleAddComment} className="relative">
            <input
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="কি খবর ভাই? কিছু বলো..."
              className="w-full pl-5 pr-14 py-3.5 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm font-medium placeholder:text-slate-300"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-black text-white rounded-lg hover:bg-slate-900 transition-all">
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center border border-black/5">
                      <User className="w-3 h-3 text-slate-300" />
                    </div>
                    <div>
                      <span className="font-bold text-black text-xs block">{rev.userName}</span>
                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tight">{formatDistanceToNow(rev.createdAt)} আগে</span>
                    </div>
                  </div>
                </div>
                <div className="pl-9">
                  <p className="text-xs text-slate-600 leading-normal font-medium">{rev.comment}</p>
                  {rev.type === 'fake' && (
                    <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-rose-500 uppercase tracking-tight">
                      <AlertTriangle className="w-3 h-3" /> Reported as fake
                    </div>
                  )}
                </div>
                <div className="h-px bg-slate-50 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
