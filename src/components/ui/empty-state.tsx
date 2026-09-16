import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-16 text-center sm:py-24", className)}>
      {Icon && (
        <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-ivory text-stone">
          <Icon className="h-7 w-7" strokeWidth={1.25} aria-hidden />
        </span>
      )}
      <h2 className="font-serif text-3xl text-ink">{title}</h2>
      {description && <p className="mt-3 max-w-md text-[15px] leading-relaxed text-stone">{description}</p>}
      {action && <div className="mt-8 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
