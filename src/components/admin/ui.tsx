"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

/** Small button that runs a server action (optionally after a confirm dialog). */
export function ActionButton({
  action,
  confirmMessage,
  children,
  className,
  tone = "default",
}: {
  action: () => Promise<unknown>;
  confirmMessage?: string;
  children: ReactNode;
  className?: string;
  tone?: "default" | "danger";
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirmMessage && !window.confirm(confirmMessage)) return;
        startTransition(async () => {
          await action();
        });
      }}
      className={cn("inline-flex h-8 items-center gap-1.5 border px-2.5 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors disabled:opacity-50", tone === "danger" ? "border-sale/40 text-sale hover:bg-sale hover:text-white" : "border-line text-ink hover:border-ink", className)}
    >
      {pending && <Loader2 className="h-3 w-3 animate-spin" />}
      {children}
    </button>
  );
}

export function AdminPageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-stone">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className, title }: { children: ReactNode; className?: string; title?: string }) {
  return (
    <section className={cn("border border-line bg-white", className)}>
      {title && <h2 className="border-b border-line px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-stone">{title}</h2>}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto border border-line bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  );
}

export const th = "px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-stone border-b border-line bg-cream";
export const td = "px-4 py-3 border-b border-line align-middle";
