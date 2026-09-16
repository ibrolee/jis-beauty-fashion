import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex flex-col items-center leading-none", className)} aria-label="JIS Beauty & Fashion — home">
      <span className={cn("font-serif text-[26px] font-semibold tracking-[0.18em] sm:text-[28px]", light ? "text-white" : "text-ink")}>JIS</span>
      <span className={cn("mt-1 text-[8.5px] font-medium uppercase tracking-[0.34em]", light ? "text-white/70" : "text-stone")}>Beauty &amp; Fashion</span>
    </Link>
  );
}
