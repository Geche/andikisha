"use client";

import {
  createContext, useContext, useState, useCallback,
  type ReactNode,
} from "react";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";

type Variant = "success" | "error" | "warning";

interface ToastItem {
  id: string;
  message: string;
  variant: Variant;
}

interface ToastCtx {
  toast: (message: string, variant?: Variant) => void;
}

const ToastContext = createContext<ToastCtx>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext).toast;
}

const ICON: Record<Variant, ReactNode> = {
  success: <CheckCircle size={16} className="text-[#27A870]" />,
  error:   <XCircle    size={16} className="text-red-500" />,
  warning: <AlertTriangle size={16} className="text-[#E8A020]" />,
};

const BORDER: Record<Variant, string> = {
  success: "border-l-[#27A870]",
  error:   "border-l-red-500",
  warning: "border-l-[#E8A020]",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, variant: Variant = "success") => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismiss = (id: string) =>
    setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-[340px] pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl bg-white shadow-lg border border-gray-100 border-l-4 ${BORDER[t.variant]} animate-in slide-in-from-right-4 duration-200`}
          >
            <span className="mt-0.5 flex-shrink-0">{ICON[t.variant]}</span>
            <p className="flex-1 text-[13px] font-medium text-[#02110C]">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
