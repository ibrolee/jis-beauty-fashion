"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/constants";

export function SortSelect({ value }: { value?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <label className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-stone">
      <span className="hidden sm:inline">Sort</span>
      <select
        value={value ?? "featured"}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          if (e.target.value === "featured") params.delete("sort");
          else params.set("sort", e.target.value);
          params.delete("page");
          const qs = params.toString();
          router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        }}
        className="h-11 border border-line bg-white pl-3 pr-8 text-xs uppercase tracking-[0.14em] text-ink focus:border-ink focus:outline-none"
        aria-label="Sort products"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
