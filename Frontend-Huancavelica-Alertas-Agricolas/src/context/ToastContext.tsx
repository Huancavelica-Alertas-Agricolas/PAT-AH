import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type ToastType = 'info' | 'success' | 'error';
type ToastItem = {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number; // ms, 0 = persistent
};

type ToastContextValue = {
  show: (toast: Omit<ToastItem, 'id'>) => string;
  update: (id: string, patch: Partial<Omit<ToastItem, 'id'>>) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 9);
    const t: ToastItem = { id, ...toast };
    setToasts((s) => [t, ...s]);
    return id;
  }, []);

  const update = useCallback((id: string, patch: Partial<Omit<ToastItem, 'id'>>) => {
    setToasts((s) => s.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((s) => s.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const timers: Record<string, number> = {};
    toasts.forEach((t) => {
      if (t.duration && t.duration > 0) {
        if (!timers[t.id]) {
          const timeout = window.setTimeout(() => {
            setToasts((s) => s.filter((x) => x.id !== t.id));
          }, t.duration);
          timers[t.id] = timeout;
        }
      }
    });
    return () => {
      Object.values(timers).forEach((id) => window.clearTimeout(id));
    };
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ show, update, dismiss }}>
      {children}
      <div aria-live="polite" className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-xs w-full rounded-md shadow-lg p-3 px-4 text-sm text-white transform transition-all duration-200 ease-out
              ${t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-red-600' : 'bg-gray-800'}`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="truncate">{t.message}</div>
              <button
                aria-label="Cerrar"
                onClick={() => dismiss(t.id)}
                className="opacity-80 hover:opacity-100 text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastProvider;
