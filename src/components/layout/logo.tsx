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
      className={cn("inline-flex items-center", className)}
      aria-label="JIS Beauty & Fashion -- home"
      onClick={onClick}
    >
      <Image
        src="/images/jis-logo.PNG"
        alt="JIS Beauty & Fashion"
        width={150}
        height={100}
        className="h-auto w-[120px] object-contain sm:w-[145px]"
        priority
      />
    </Link>
  );
}
