import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center", className)}
      aria-label="JIS Beauty & Fashion -- home"
    >
      <Image
        src="/images/jis-logo.png"
        alt="JIS Beauty & Fashion"
        width={150}
        height={100}
        className="h-auto w-[120px] object-contain sm:w-[145px]"
        priority
      />
    </Link>
  );
}