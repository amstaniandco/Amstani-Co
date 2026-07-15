"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message: string;
};

type ToastInput = {
  title?: string;
  message: string;
  duration?: number;
};

type ToastContextValue = {
  success: (message: string, options?: Omit<ToastInput, "message">) => void;
  error: (message: string, options?: Omit<ToastInput, "message">) => void;
  info: (message: string, options?: Omit<ToastInput, "message">) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);
const DEFAULT_DURATION = 3200;

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  return (
    <div className="toast-enter pointer-events-auto overflow-hidden rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-white shadow-[0_14px_36px_rgba(0,0,0,0.34)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/45">{toast.title}</p>
          <p className="mt-0.5 break-words text-[12px] leading-4 text-white/88">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="-mr-1 -mt-1 rounded-full p-1.5 text-white/35 transition hover:bg-white/10 hover:text-white"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-1.5 h-0.5 overflow-hidden rounded-full bg-white/10">
        <div className="toast-progress h-full rounded-full bg-white/40" style={{ ["--toast-duration" as string]: `${DEFAULT_DURATION}ms` }} />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Record<string, number>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timersRef.current[id];
    if (timer) {
      window.clearTimeout(timer);
      delete timersRef.current[id];
    }
  }, []);

  const pushToast = useCallback(
    (type: ToastType, message: string, options: Omit<ToastInput, "message"> = {}) => {
      const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const toast: Toast = {
        id,
        type,
        title: options.title ?? (type === "success" ? "Success" : type === "error" ? "Error" : "Notice"),
        message,
      };

      setToasts((current) => [toast, ...current].slice(0, 4));

      timersRef.current[id] = window.setTimeout(() => {
        dismiss(id);
      }, options.duration ?? DEFAULT_DURATION);
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message, options) => pushToast("success", message, options),
      error: (message, options) => pushToast("error", message, options),
      info: (message, options) => pushToast("info", message, options),
    }),
    [pushToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed left-1/2 top-20 z-[80] flex w-[calc(100vw-1.5rem)] max-w-[320px] -translate-x-1/2 flex-col gap-1.5 sm:left-auto sm:right-3 sm:top-3 sm:w-[240px] sm:translate-x-0">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}