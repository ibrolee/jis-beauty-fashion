"use client";

import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ProductBadge = { tone: "sale" | "new" | "best" | "soldout"; label: string };

export function ProductGallery({ images, name, badges }: { images: string[]; name: string; badges?: ProductBadge[] }) {
  const [active, setActive] = useState(0);
  const selected = images[active];

  return (
    <div className={cn("grid min-w-0 gap-3 lg:gap-4", images.length > 1 ? "lg:grid-cols-[76px_minmax(0,1fr)]" : "lg:grid-cols-1")}>
      {images.length > 1 && (
        <div className="order-2 flex min-w-0 gap-2 overflow-x-auto pb-1 no-scrollbar lg:order-1 lg:flex-col lg:overflow-visible" role="group" aria-label="Choose a product photograph">
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              aria-label={`View ${name} photograph ${index + 1} of ${images.length}`}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              className={cn(
                "relative aspect-[4/5] w-[68px] shrink-0 overflow-hidden border bg-ivory transition-all duration-300 focus-visible:outline-offset-2 lg:w-full",
                index === active ? "border-ink opacity-100" : "border-transparent opacity-65 hover:border-stone hover:opacity-100",
              )}
            >
              <Image src={src} alt="" fill sizes="76px" className="object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}

      <div className="relative order-1 aspect-[4/5] w-full min-w-0 overflow-hidden bg-[#f1ece4] sm:aspect-[5/5] lg:order-2 lg:aspect-[4/5]">
        <div className="pointer-events-none absolute inset-[12px] z-10 border border-white/50 sm:inset-[18px]" aria-hidden="true" />
        {selected ? (
          <Image
            key={selected}
            src={selected}
            alt={`${name}, photograph ${active + 1} of ${images.length}`}
            fill
            priority
            sizes="(min-width: 1280px) 600px, (min-width: 1024px) 55vw, 100vw"
            className="animate-fade-in object-contain p-5 sm:p-9 lg:p-10"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-stone">Photography coming soon</div>
        )}
        {badges && badges.length > 0 && (
          <div className="absolute left-5 top-5 z-20 flex flex-col items-start gap-1.5 sm:left-8 sm:top-8">
            {badges.map((badge) => <Badge key={badge.label} tone={badge.tone}>{badge.label}</Badge>)}
          </div>
        )}
        {images.length > 1 && (
          <div className="absolute bottom-5 right-5 z-20 bg-cream/95 px-3 py-1.5 text-[10px] font-medium tracking-[0.16em] text-ink sm:bottom-8 sm:right-8" aria-live="polite">
            {String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </div>
        )}
      </div>
    </div>
  );
}
