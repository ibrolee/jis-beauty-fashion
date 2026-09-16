"use client";

import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name, badges }: { images: string[]; name: string; badges?: { tone: "sale" | "new" | "best" | "soldout"; label: string }[] }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [];

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-ivory">
        {list[active] ? (
          <Image key={list[active]} src={list[active]} alt={`${name} — image ${active + 1}`} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover animate-fade-in" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-mist">No image</div>
        )}
        {badges && badges.length > 0 && (
          <div className="absolute left-4 top-4 flex flex-col items-start gap-1.5">
            {badges.map((b) => (
              <Badge key={b.label} tone={b.tone}>{b.label}</Badge>
            ))}
          </div>
        )}
      </div>
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar lg:w-20 lg:flex-col" role="tablist" aria-label="Product images">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Show image ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn("relative aspect-[4/5] w-16 shrink-0 overflow-hidden bg-ivory transition-opacity lg:w-full", i === active ? "ring-1 ring-ink" : "opacity-60 hover:opacity-100")}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
