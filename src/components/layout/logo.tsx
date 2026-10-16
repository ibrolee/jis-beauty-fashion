import Image from "next/image";
import Link from "next/link";
import type { MouseEventHandler } from "react";
import { cn } from "@/lib/utils";
import { DEFAULT_WEBSITE_CONTENT, type BrandContent } from "@/lib/website-content";

export function Logo({
  className,
  onClick,
  brand = DEFAULT_WEBSITE_CONTENT.brand,
}: {
  className?: string;
  light?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  brand?: BrandContent;
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center", className)}
      aria-label={`${brand.name} -- home`}
      onClick={onClick}
    >
      <span
        className={cn(
          "relative block h-[58px] w-[168px] shrink-0 overflow-hidden bg-cream transition-transform duration-300 group-hover:scale-[1.01] sm:h-[64px] sm:w-[188px]"
        )}
      >
        {brand.logo ? <Image
          src={brand.logo}
          alt={brand.name}
          fill
          sizes="(min-width: 640px) 188px, 168px"
          className="object-contain mix-blend-multiply"
          priority
        /> : <span className="flex h-full items-center font-serif text-2xl">{brand.name}</span>}
      </span>
    </Link>
  );
}
