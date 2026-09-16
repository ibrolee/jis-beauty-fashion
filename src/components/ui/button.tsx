import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "white" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 font-medium uppercase tracking-[0.16em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 select-none";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-rosewood-dark",
  secondary: "border border-ink text-ink hover:bg-ink hover:text-white",
  ghost: "text-ink hover:bg-ivory",
  white: "bg-white text-ink hover:bg-blush",
  danger: "border border-sale text-sale hover:bg-sale hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-[11px]",
  md: "h-12 px-6 text-xs",
  lg: "h-14 px-8 text-xs",
  icon: "h-11 w-11",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button className={buttonClasses(variant, size, className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  prefetch?: boolean;
  target?: string;
  rel?: string;
  "aria-label"?: string;
};

export function ButtonLink({ href, variant = "primary", size = "md", className, children, ...props }: ButtonLinkProps) {
  const external = href.startsWith("http");
  if (external) {
    return (
      <a href={href} className={buttonClasses(variant, size, className)} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
