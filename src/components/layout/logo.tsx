import Image from "next/image";
import Link from "next/link";
import type { MouseEventHandler } from "react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  onClick,
}: {
  className?: string;
  light?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center", className)}
      aria-label="JIS Beauty & Fashion -- home"
      onClick={onClick}
    >
      <span
        className={cn(
          "relative block h-[58px] w-[168px] shrink-0 overflow-hidden bg-cream transition-transform duration-300 group-hover:scale-[1.01] sm:h-[64px] sm:w-[188px]"
        )}
      >
        <Image
          src="/images/jis-logo.PNG"
          alt="JIS Beauty & Fashion"
          fill
          sizes="(min-width: 640px) 188px, 168px"
          className="object-contain mix-blend-multiply"
          priority
        />
      </span>
    </Link>
  );
}
