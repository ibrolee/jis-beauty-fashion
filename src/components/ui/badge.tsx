import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "new" | "sale" | "best" | "soldout" | "neutral" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
  new: "bg-ink text-white",
  sale: "bg-sale text-white",
  best: "bg-blush text-ink",
  soldout: "bg-stone text-white",
  neutral: "bg-ivory text-ink-soft",
  success: "bg-green-50 text-success border border-success/30",
  warning: "bg-amber-50 text-amber-800 border border-amber-200",
  danger: "bg-red-50 text-sale border border-sale/30",
  info: "bg-blue-50 text-blue-800 border border-blue-200",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] leading-none", tones[tone], className)}>
      {children}
    </span>
  );
}
