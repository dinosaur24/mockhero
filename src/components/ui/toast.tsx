"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState, createContext, useContext, useCallback, type ReactNode } from "react";

interface Toast {
  id: string;
  message: string;
  variant: "success" | "error";
}

interface ToastContextValue {
  toast: (message: string, variant?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, variant: "success" | "error" = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm shadow-md animate-in slide-in-from-right",
        toast.variant === "success"
          ? "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400"
          : "border-destructive/20 bg-destructive/10 text-destructive"
      )}
    >
      {toast.message}
    </div>
  );
}
