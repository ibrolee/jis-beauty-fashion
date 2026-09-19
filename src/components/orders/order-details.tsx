import { Check } from "lucide-react";
import Image from "next/image";
import type { Order, OrderItem, OrderStatus, Payment, PaymentStatus } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { manualCheckoutChannel } from "@/lib/orders/payment-review";
import { cn, formatDate, formatNaira } from "@/lib/utils";

const STATUS_TONES: Record<OrderStatus, "neutral" | "info" | "warning" | "success" | "danger"> = {
  pending: "warning",
  payment_confirmed: "info",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
};

const PAYMENT_TONES: Record<PaymentStatus, "neutral" | "info" | "warning" | "success" | "danger"> = {
  pending: "warning",
  paid: "success",
  failed: "danger",
  refunded: "neutral",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={STATUS_TONES[status]}>{ORDER_STATUS_LABELS[status]}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={PAYMENT_TONES[status]}>{PAYMENT_STATUS_LABELS[status]}</Badge>;
}

const TRACK_STEPS: OrderStatus[] = ["pending", "payment_confirmed", "processing", "shipped", "delivered"];

export function OrderStatusTracker({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return <p className="border border-sale/30 bg-red-50 px-4 py-3 text-sm text-sale">This order was cancelled. If you transferred money, contact us so we can verify receipt and arrange any refund due. Do not pay a cancelled order again.</p>;
  }
  const current = TRACK_STEPS.indexOf(status);
  return (
    <ol className="grid grid-cols-5 gap-1" aria-label="Order progress">
      {TRACK_STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step} className="flex flex-col items-center text-center">
            <div className="relative flex w-full items-center justify-center">
              {i > 0 && <span className={cn("absolute right-1/2 top-1/2 h-px w-full -translate-y-1/2", i <= current ? "bg-ink" : "bg-line")} aria-hidden />}
              <span className={cn("relative z-10 flex h-7 w-7 items-center justify-center rounded-full border text-[10px]", done ? "border-ink bg-ink text-white" : "border-line bg-white text-stone")}>
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
            </div>
            <span className={cn("mt-2 text-[10px] uppercase leading-tight tracking-[0.08em] sm:text-[11px]", done ? "text-ink" : "text-stone")}>{ORDER_STATUS_LABELS[step]}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderItemsList({ items }: { items: OrderItem[] }) {
  return (
    <ul className="divide-y divide-line">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-4 py-4">
          <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-ivory">
            {item.image && <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />}
          </div>
          <div className="flex-1 text-sm">
            <p className="font-medium">{item.name}</p>
            <p className="text-xs text-stone">
              {item.variantName ? `${item.variantName} · ` : ""}Qty {item.quantity} · {formatNaira(item.unitPrice)} each
            </p>
            {item.sku && <p className="text-[11px] text-mist">SKU {item.sku}</p>}
          </div>
          <p className="text-sm font-medium tabular-nums">{formatNaira(item.lineTotal)}</p>
        </li>
      ))}
    </ul>
  );
}

export function OrderTotals({ order }: { order: Order }) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between"><dt className="text-stone">Subtotal</dt><dd className="tabular-nums">{formatNaira(order.subtotal)}</dd></div>
      {order.discount > 0 && (
        <div className="flex justify-between text-success">
          <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
          <dd className="tabular-nums">−{formatNaira(order.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between"><dt className="text-stone">Delivery</dt><dd className="tabular-nums">{order.deliveryFee === 0 ? "Free" : formatNaira(order.deliveryFee)}</dd></div>
      <div className="flex justify-between border-t border-line pt-3 text-base font-medium"><dt>Total</dt><dd className="tabular-nums">{formatNaira(order.total)}</dd></div>
    </dl>
  );
}

export function OrderMeta({ order }: { order: Order & { payments?: Payment[] } }) {
  const channel = manualCheckoutChannel(order.paymentMethod, order.payments ?? []);
  const paymentLabel = channel === "whatsapp" ? "Instant payment on WhatsApp"
    : channel === "website_transfer" ? "Bank transfer on site"
      : PAYMENT_METHOD_LABELS[order.paymentMethod];
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div>
        <h3 className="eyebrow mb-2 font-sans">Delivery address</h3>
        <address className="text-sm not-italic leading-relaxed text-ink-soft">
          {order.firstName} {order.lastName}
          <br />
          {order.address}
          <br />
          {order.city}, {order.state}
          <br />
          {order.phone}
          {order.whatsapp && order.whatsapp !== order.phone ? ` · WhatsApp ${order.whatsapp}` : ""}
        </address>
        {order.instructions && <p className="mt-2 text-xs text-stone">Note: {order.instructions}</p>}
      </div>
      <div>
        <h3 className="eyebrow mb-2 font-sans">Payment</h3>
        <p className="text-sm text-ink-soft">{paymentLabel}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <PaymentStatusBadge status={order.paymentStatus} />
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-3 text-xs text-stone">Placed {formatDate(order.createdAt, { hour: "2-digit", minute: "2-digit" })}</p>
      </div>
    </div>
  );
}
