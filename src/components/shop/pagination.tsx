import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SearchParamsRecord } from "@/lib/shop-params";

export function Pagination({ page, totalPages, basePath, searchParams }: { page: number; totalPages: number; basePath: string; searchParams: SearchParamsRecord }) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v === undefined || k === "page") continue;
      params.set(k, Array.isArray(v) ? v.join(",") : v);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  return (
    <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-1">
      <Link href={href(Math.max(1, page - 1))} aria-disabled={page === 1} className={cn("flex h-11 w-11 items-center justify-center border border-line", page === 1 && "pointer-events-none opacity-40")} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </Link>
      {pages.map((p, i) => {
        const gap = i > 0 && p - pages[i - 1] > 1;
        return (
          <span key={p} className="flex items-center gap-1">
            {gap && <span className="px-1 text-stone">…</span>}
            <Link href={href(p)} aria-current={p === page ? "page" : undefined} className={cn("flex h-11 min-w-11 items-center justify-center border px-3 text-sm", p === page ? "border-ink bg-ink text-white" : "border-line hover:border-ink")}>
              {p}
            </Link>
          </span>
        );
      })}
      <Link href={href(Math.min(totalPages, page + 1))} aria-disabled={page === totalPages} className={cn("flex h-11 w-11 items-center justify-center border border-line", page === totalPages && "pointer-events-none opacity-40")} aria-label="Next page">
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
