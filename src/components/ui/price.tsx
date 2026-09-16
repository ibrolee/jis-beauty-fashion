import { cn, formatNaira, isOnSale } from "@/lib/utils";

export function Price({
  price,
  salePrice,
  className,
  size = "md",
  prefix,
}: {
  price: number;
  salePrice: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
  prefix?: string;
}) {
  const onSale = isOnSale({ price, salePrice });
  const text = size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-[15px]";
  const strike = size === "lg" ? "text-base" : "text-xs";

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      {prefix && <span className="text-xs text-stone">{prefix}</span>}
      <span className={cn("font-medium tabular-nums", text, onSale && "text-sale")}>{formatNaira(onSale ? (salePrice as number) : price)}</span>
      {onSale && (
        <span className={cn("text-stone line-through tabular-nums", strike)}>
          <span className="sr-only">Original price </span>
          {formatNaira(price)}
        </span>
      )}
    </div>
  );
}
