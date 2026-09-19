"use server";

import { and, eq, gt, gte, inArray, isNull, lt, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { addresses, coupons, orderItems, orders, payments, productVariants, products } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { getDeliveryFee, SITE } from "@/lib/constants";
import { validateCouponCode } from "@/lib/data/coupons";
import { orderConfirmationEmail, sendEmail } from "@/lib/email";
import { getPaymentProvider, isOnlinePaymentEnabled } from "@/lib/payments";
import { expireUnpaidBankTransfers } from "@/lib/orders/reservations";
import { whatsappCheckoutMessage } from "@/lib/orders/whatsapp-checkout";
import { absoluteUrl, effectivePrice, formatNaira, generateOrderNumber, generateReference } from "@/lib/utils";
import { checkoutSchema, fieldErrorsFrom, type CheckoutInput } from "@/lib/validation";

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; redirectUrl?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string>; orderNumber?: string };

/** Prices, stock, delivery and discounts are calculated from trusted server data. */
export async function placeOrder(rawInput: CheckoutInput): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  const input = parsed.data;
  // Existing Paystack and pay-on-delivery orders remain readable, but new orders use only the two approved channels.
  if (input.paymentMethod !== "whatsapp" && input.paymentMethod !== "bank_transfer") {
    return { ok: false, error: "Please choose WhatsApp instant payment or bank transfer.", fieldErrors: { paymentMethod: "Choose a payment option" } };
  }
  await expireUnpaidBankTransfers();
  const user = await getCurrentUser();
  const productIds = [...new Set(input.items.map((i) => i.productId))];
  const variantIds = input.items.map((i) => i.variantId).filter((v): v is number => v !== null);
  const [productRows, variantRows] = await Promise.all([
    db.select().from(products).where(inArray(products.id, productIds)),
    variantIds.length ? db.select().from(productVariants).where(inArray(productVariants.id, variantIds)) : Promise.resolve([]),
  ]);
  const productMap = new Map(productRows.map((p) => [p.id, p]));
  const variantMap = new Map(variantRows.map((v) => [v.id, v]));
  type Line = { productId: number; variantId: number | null; name: string; variantName: string | null; sku: string | null; image: string | null; unitPrice: number; quantity: number; lineTotal: number; productSlug: string };
  const lines: Line[] = [];
  for (const item of input.items) {
    const product = productMap.get(item.productId);
    if (!product || !product.isActive) return { ok: false, error: "One of the items in your cart is no longer available. Please review your cart." };
    const variant = item.variantId ? variantMap.get(item.variantId) : undefined;
    if (item.variantId && (!variant || variant.productId !== product.id || !variant.isActive)) return { ok: false, error: `The selected option for ${product.name} is no longer available.` };
    if (!item.variantId) {
      const [option] = await db.select({ id: productVariants.id }).from(productVariants).where(sql`${productVariants.productId} = ${product.id} AND ${productVariants.isActive} = true`).limit(1);
      if (option) return { ok: false, error: `Please select an option for ${product.name}.` };
    }
    const available = variant ? variant.stock : product.stock;
    if (available < item.quantity) return { ok: false, error: available === 0 ? `${product.name} is now out of stock. Please remove it from your cart.` : `Only ${available} unit(s) of ${product.name} left. Please reduce the quantity.` };
    const unitPrice = variant ? effectivePrice(variant) : effectivePrice(product);
    lines.push({ productId: product.id, variantId: variant?.id ?? null, name: product.name, variantName: variant?.name ?? null, sku: variant?.sku ?? product.sku, image: variant?.images[0] ?? product.images[0] ?? null, unitPrice, quantity: item.quantity, lineTotal: unitPrice * item.quantity, productSlug: product.slug });
  }
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  let discount = 0;
  let couponId: number | null = null;
  let couponCode: string | null = null;
  if (input.couponCode) {
    const validation = await validateCouponCode(input.couponCode, subtotal);
    if (!validation.valid) return { ok: false, error: validation.reason, fieldErrors: { couponCode: validation.reason } };
    discount = validation.discount;
    couponId = validation.couponId;
    couponCode = validation.coupon.code;
  }
  const deliveryFee = getDeliveryFee(input.state, subtotal);
  const total = subtotal - discount + deliveryFee;
  const orderNumber = generateOrderNumber();
  const reference = generateReference();
  try {
    await db.transaction(async (tx) => {
      const [order] = await tx.insert(orders).values({
        orderNumber, userId: user?.id ?? null, email: input.email, firstName: input.firstName, lastName: input.lastName,
        phone: input.phone, whatsapp: input.whatsapp || null, state: input.state, city: input.city,
        address: input.address, instructions: input.instructions || null, subtotal, discount, deliveryFee, total,
        couponCode, paymentMethod: "bank_transfer", paymentStatus: "pending", status: "pending",
      }).returning({ id: orders.id });
      await tx.insert(orderItems).values(lines.map(({ productSlug: _productSlug, ...line }) => ({ ...line, orderId: order.id })));
      for (const line of lines) {
        if (line.variantId) {
          const [reservedVariant] = await tx.update(productVariants).set({ stock: sql`${productVariants.stock} - ${line.quantity}` }).where(and(eq(productVariants.id, line.variantId), eq(productVariants.isActive, true), gte(productVariants.stock, line.quantity))).returning({ id: productVariants.id });
          if (!reservedVariant) throw new Error("OUT_OF_STOCK");
        }
        const [reservedProduct] = await tx.update(products).set({ stock: sql`${products.stock} - ${line.quantity}`, salesCount: sql`${products.salesCount} + ${line.quantity}` }).where(and(eq(products.id, line.productId), eq(products.isActive, true), gte(products.stock, line.quantity))).returning({ id: products.id });
        if (!reservedProduct) throw new Error("OUT_OF_STOCK");
      }
      if (couponId) {
        // Recheck the limits in the same transaction as stock reservation. The conditional
        // UPDATE locks this coupon row, so two checkouts cannot redeem the final use.
        const [reservedCoupon] = await tx.update(coupons)
          .set({ usedCount: sql`${coupons.usedCount} + 1` })
          .where(and(
            eq(coupons.id, couponId),
            eq(coupons.isActive, true),
            or(isNull(coupons.expiresAt), gt(coupons.expiresAt, new Date())),
            lte(coupons.minOrderAmount, subtotal),
            or(isNull(coupons.usageLimit), lt(coupons.usedCount, coupons.usageLimit)),
          ))
          .returning({ id: coupons.id });
        if (!reservedCoupon) throw new Error("COUPON_UNAVAILABLE");
      }
      await tx.insert(payments).values({ orderId: order.id, provider: "manual", reference, amount: total, status: "pending", channel: input.paymentMethod === "whatsapp" ? "whatsapp" : "bank_transfer" });
      if (user && input.saveAddress) await tx.insert(addresses).values({ userId: user.id, label: "Checkout address", firstName: input.firstName, lastName: input.lastName, phone: input.phone, state: input.state, city: input.city, addressLine: input.address, instructions: input.instructions || null });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "OUT_OF_STOCK") return { ok: false, error: "An item just sold out or its available stock changed. Please review your bag and try again." };
    if (error instanceof Error && error.message === "COUPON_UNAVAILABLE") return { ok: false, error: "This coupon has just expired, changed or reached its usage limit. Please remove it and try again.", fieldErrors: { couponCode: "Coupon no longer available" } };
    console.error("Order creation failed:", error);
    return { ok: false, error: "We couldn't place your order. Please try again." };
  }
  void sendEmail({ to: input.email, ...orderConfirmationEmail({ firstName: input.firstName, orderNumber, total: formatNaira(total), orderUrl: absoluteUrl(`/order/${orderNumber}`) }) }).catch(() => undefined);
  if (input.paymentMethod === "whatsapp") {
    const message = whatsappCheckoutMessage({ orderNumber, total, items: lines.map((line) => ({ name: line.name, quantity: line.quantity, unitPrice: line.unitPrice, variantName: line.variantName, productSlug: line.productSlug })) });
    return { ok: true, orderNumber, redirectUrl: `${SITE.whatsappUrl}?text=${encodeURIComponent(message)}` };
  }
  return { ok: true, orderNumber };
}

/** Legacy retry support for previously created Paystack orders only. */
export async function retryPayment(orderNumber: string): Promise<PlaceOrderResult> {
  const order = await db.query.orders.findFirst({ where: eq(orders.orderNumber, orderNumber) });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.paymentStatus === "paid") return { ok: true, orderNumber };
  if (order.status === "cancelled") return { ok: false, error: "This order has been cancelled." };
  if (order.paymentMethod !== "paystack") return { ok: false, error: "Please complete the bank transfer using your order page." };
  if (!isOnlinePaymentEnabled()) return { ok: false, error: "Online payment is not available yet. Please contact us on WhatsApp." };
  const reference = generateReference();
  await db.insert(payments).values({ orderId: order.id, provider: "paystack", reference, amount: order.total, status: "pending" });
  try {
    const init = await getPaymentProvider("paystack").initialize({ reference, orderNumber, amount: order.total, email: order.email, callbackUrl: absoluteUrl("/api/payments/paystack/callback") });
    return { ok: true, orderNumber, redirectUrl: init.authorizationUrl };
  } catch (error) {
    console.error("Paystack retry failed:", error);
    return { ok: false, error: "We couldn't start the payment. Please contact us on WhatsApp.", orderNumber };
  }
}
