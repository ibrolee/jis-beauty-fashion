import Image from "next/image";
import Link from "next/link";
import type { MouseEventHandler } from "react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact = false,
  onClick,
}: {
  className?: string;
  light?: boolean;
  compact?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-3", className)}
      aria-label="JIS Beauty & Fashion -- home"
      onClick={onClick}
    >
      <span
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full border border-[#c99b4a]/45 bg-cream shadow-[0_10px_28px_-24px_rgba(23,21,17,0.55)] ring-1 ring-white/70 transition-transform duration-300 group-hover:scale-[1.02]",
          compact ? "h-12 w-12 sm:h-14 sm:w-14" : "h-12 w-12 sm:h-14 sm:w-14"
        )}
      >
        <Image
          src="/images/jis-logo.PNG"
          alt=""
          fill
          sizes={compact ? "56px" : "56px"}
          className="scale-[1.82] object-cover object-[50%_34%] mix-blend-multiply"
          priority
        />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block whitespace-nowrap text-[12px] font-medium uppercase leading-none tracking-[0.2em] text-ink">
            JIS
          </span>
          <span className="mt-1 block whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.18em] text-stone">
            Beauty & Fashion
          </span>
        </span>
      )}
    </Link>
  );
}
