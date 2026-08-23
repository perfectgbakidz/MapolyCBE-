import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
}

interface ToastContextType {
  toast: (item: Omit<ToastItem, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type, title, message, durationMs = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const item: ToastItem = { id, type, title, message, durationMs };
      setToasts((prev) => [item, ...prev].slice(0, 5)); // Keep max 5

      if (durationMs > 0) {
        setTimeout(() => {
          dismiss(id);
        }, durationMs);
      }
    },
    [dismiss]
  );

  const success = useCallback((title: string, message?: string) => toast({ type: 'success', title, message }), [toast]);
  const error = useCallback((title: string, message?: string) => toast({ type: 'error', title, message, durationMs: 5500 }), [toast]);
  const warning = useCallback((title: string, message?: string) => toast({ type: 'warning', title, message }), [toast]);
  const info = useCallback((title: string, message?: string) => toast({ type: 'info', title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, dismiss }}>
      {children}
      {/* Toast Render Floating Container */}
      <div
        id="mapolycbe_toast_container"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all ${
                t.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100'
                  : t.type === 'error'
                  ? 'bg-rose-950/90 border-rose-500/40 text-rose-100'
                  : t.type === 'warning'
                  ? 'bg-amber-950/90 border-amber-500/40 text-amber-100'
                  : 'bg-slate-900/90 border-slate-700 text-slate-100'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {t.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-snug">{t.title}</p>
                {t.message && <p className="text-xs opacity-90 mt-1 leading-relaxed">{t.message}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-white/60 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
