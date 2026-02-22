import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface NotificationContextType {
  show: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const show = useCallback((msg: string) => {
    setMessage(msg);
  }, []);

  const hide = useCallback(() => {
    setMessage(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ show }}>
      {children}
      <AnimatePresence>
        {message && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-black text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4 pointer-events-auto max-w-sm w-full"
            >
              <p className="text-xs font-bold flex-1 leading-tight">{message}</p>
              <button 
                onClick={hide}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-colors"
              >
                OK
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
}
