"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import Link from "next/link";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; message: string; kind: ToastKind; action?: { label: string; href: string } };

type ToastContextValue = {
  toast: (message: string, options?: { kind?: ToastKind; action?: Toast["action"] }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback<ToastContextValue["toast"]>(
    (message, options) => {
      const id = ++counter.current;
      setToasts((t) => [...t.slice(-2), { id, message, kind: options?.kind ?? "success", action: options?.action }]);
      window.setTimeout(() => dismiss(id), 3800);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
        {toasts.map((t) => {
          const Icon = t.kind === "success" ? CheckCircle2 : t.kind === "error" ? XCircle : Info;
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-center gap-3 border bg-ink px-4 py-3 text-sm text-white shadow-soft animate-fade-up",
                t.kind === "error" ? "border-sale" : "border-ink",
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", t.kind === "error" ? "text-red-300" : "text-blush")} aria-hidden />
              <p className="flex-1">{t.message}</p>
              {t.action && (
                <Link href={t.action.href} onClick={() => dismiss(t.id)} className="text-xs font-medium uppercase tracking-wider underline underline-offset-4">
                  {t.action.label}
                </Link>
              )}
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="p-1 text-white/60 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
