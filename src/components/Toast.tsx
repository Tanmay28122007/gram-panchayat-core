import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export function ToastContainer({ toasts, removeToast }: { toasts: ToastMessage[], removeToast: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="bg-white border border-[#E6E1D3] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-4 pr-12 relative overflow-hidden min-w-[280px] max-w-sm flex items-start gap-3"
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-[#52796F] shrink-0 mt-0.5" />
            )}
            <p className="text-sm font-bold text-[#3D3D3D]">{toast.message}</p>
            <button 
              onClick={() => removeToast(toast.id)}
              className="absolute right-3 top-4 p-1 text-[#8B8B7A] hover:bg-[#F4F1EA] rounded-full transition-colors flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <div className={`absolute bottom-0 left-0 h-1.5 right-0 ${toast.type === 'success' ? 'bg-green-500' : 'bg-[#52796F]'}`} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
