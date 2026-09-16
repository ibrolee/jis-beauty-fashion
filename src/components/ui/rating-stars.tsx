import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  count,
  size = "sm",
  className,
  showValue = false,
}: {
  rating: number;
  count?: number;
  size?: "xs" | "sm" | "md";
  className?: string;
  showValue?: boolean;
}) {
  const px = size === "xs" ? "h-3 w-3" : size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  const rounded = Math.round(rating * 2) / 2;

  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <div className="flex items-center gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0;
          return (
            <span key={i} className={cn("relative inline-block", px)}>
              <Star className={cn("absolute inset-0 text-line", px)} fill="currentColor" strokeWidth={0} />
              {fill > 0 && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                  <Star className={cn("text-ink", px)} fill="currentColor" strokeWidth={0} />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showValue && <span className="text-xs text-ink-soft">{rating.toFixed(1)}</span>}
      {count !== undefined && <span className="text-xs text-stone">({count})</span>}
    </div>
  );
}
