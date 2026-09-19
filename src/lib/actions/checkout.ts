"use server";

import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { addresses, coupons, orderItems, orders, payments, productVariants, products } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { getDeliveryFee } from "@/lib/constants";
import { validateCouponCode } from "@/lib/data/coupons";
import { orderConfirmationEmail, sendEmail } from "@/lib/email";
import { getPaymentProvider, isOnlinePaymentEnabled, PaymentConfigurationError } from "@/lib/payments";
import { expireUnpaidBankTransfers } from "@/lib/orders/reservations";
import { absoluteUrl, effectivePrice, formatNaira, generateOrderNumber, generateReference } from "@/lib/utils";
import { checkoutSchema, fieldErrorsFrom, type CheckoutInput } from "@/lib/validation";

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; redirectUrl?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string>; orderNumber?: string };

/**
 * Creates an order from the client cart. Prices, stock and coupons are all
 * re-validated against the database — the client is never trusted for money.
 */
export async function placeOrder(rawInput: CheckoutInput): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  const input = parsed.data;
  // Release old unpaid bank-transfer reservations before checking live stock.
  await expireUnpaidBankTransfers();
  const user = await getCurrentUser();

  if (input.paymentMethod === "paystack" && !isOnlinePaymentEnabled()) {
    return { ok: false, error: "Online card payment is not available yet. Please choose bank transfer.", fieldErrors: { paymentMethod: "Unavailable" } };
  }
  if (input.paymentMethod === "pay_on_delivery" && input.state !== "Lagos") {
    return { ok: false, error: "Pay on delivery is currently available in Lagos only.", fieldErrors: { paymentMethod: "Lagos only" } };
  }

  /* ----------------------------- Load catalogue ----------------------------- */
  const productIds = [...new Set(input.items.map((i) => i.productId))];
  const variantIds = input.items.map((i) => i.variantId).filter((v): v is number => v !== null);

  const [productRows, variantRows] = await Promise.all([
    db.select().from(products).where(inArray(products.id, productIds)),
    variantIds.length ? db.select().from(productVariants).where(inArray(productVariants.id, variantIds)) : Promise.resolve([]),
  ]);
  const productMap = new Map(productRows.map((p) => [p.id, p]));
  const variantMap = new Map(variantRows.map((v) => [v.id, v]));

  /* ------------------------- Build validated line items ------------------------ */
  type Line = { productId: number; variantId: number | null; name: string; variantName: string | null; sku: string | null; image: string | null; unitPrice: number; quantity: number; lineTotal: number };
  const lines: Line[] = [];

  for (const item of input.items) {
    const product = productMap.get(item.productId);
    if (!product || !product.isActive) return { ok: false, error: "One of the items in your cart is no longer available. Please review your cart." };

    const variant = item.variantId ? variantMap.get(item.variantId) : undefined;
    if (item.variantId && (!variant || variant.productId !== product.id || !variant.isActive)) {
      return { ok: false, error: `The selected option for ${product.name} is no longer available.` };
    }
    if (!item.variantId) {
      const [option] = await db.select({ id: productVariants.id }).from(productVariants)
        .where(sql`${productVariants.productId} = ${product.id} AND ${productVariants.isActive} = true`).limit(1);
      if (option) return { ok: false, error: `Please select an option for ${product.name}.` };
    }
    const available = variant ? variant.stock : product.stock;
    if (available < item.quantity) {
      return {
        ok: false,
        error: available === 0 ? `${product.name} is now out of stock. Please remove it from your cart.` : `Only ${available} unit(s) of ${product.name} left. Please reduce the quantity.`,
      };
    }
    const unitPrice = variant ? effectivePrice(variant) : effectivePrice(product);
    lines.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      name: product.name,
      variantName: variant?.name ?? null,
      sku: variant?.sku ?? product.sku,
      image: variant?.images[0] ?? product.images[0] ?? null,
      unitPrice,
      quantity: item.quantity,
      lineTotal: unitPrice * item.quantity,
    });
  }

  /* --------------------------------- Totals --------------------------------- */
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
  const providerId = input.paymentMethod === "paystack" ? "paystack" : "manual";

  /* ------------------------------ Persist order ------------------------------ */
  let orderId: number;
  try {
    orderId = await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber,
        userId: user?.id ?? null,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        whatsapp: input.whatsapp || null,
        state: input.state,
        city: input.city,
        address: input.address,
        instructions: input.instructions || null,
        subtotal,
        discount,
        deliveryFee,
        total,
        couponCode,
        paymentMethod: input.paymentMethod,
        paymentStatus: "pending",
        status: "pending",
      })
      .returning({ id: orders.id });

    await tx.insert(orderItems).values(lines.map((l) => ({ ...l, orderId: order.id })));

    // Atomic conditional deductions prevent concurrent purchases from overselling.
    for (const l of lines) {
      if (l.variantId) {
        const [reservedVariant] = await tx.update(productVariants)
          .set({ stock: sql`${productVariants.stock} - ${l.quantity}` })
          .where(and(eq(productVariants.id, l.variantId), eq(productVariants.isActive, true), gte(productVariants.stock, l.quantity)))
          .returning({ id: productVariants.id });
        if (!reservedVariant) throw new Error("OUT_OF_STOCK");
      }
      const [reservedProduct] = await tx.update(products)
        .set({ stock: sql`${products.stock} - ${l.quantity}`, salesCount: sql`${products.salesCount} + ${l.quantity}` })
        .where(and(eq(products.id, l.productId), eq(products.isActive, true), gte(products.stock, l.quantity)))
        .returning({ id: products.id });
      if (!reservedProduct) throw new Error("OUT_OF_STOCK");
    }

    if (couponId) {
      await tx.update(coupons).set({ usedCount: sql`${coupons.usedCount} + 1` }).where(eq(coupons.id, couponId));
    }

    await tx.insert(payments).values({ orderId: order.id, provider: providerId, reference, amount: total, status: "pending" });

    if (user && input.saveAddress) {
      await tx.insert(addresses).values({
        userId: user.id,
        label: "Checkout address",
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        state: input.state,
        city: input.city,
        addressLine: input.address,
        instructions: input.instructions || null,
      });
    }

    return order.id;
    });
  } catch (error) {
    if (error instanceof Error && error.message === "OUT_OF_STOCK") {
      return { ok: false, error: "An item just sold out or its available stock changed. Please review your bag and try again." };
    }
    console.error("Order creation failed:", error);
    return { ok: false, error: "We couldn't place your order. Please try again." };
  }

  /* ------------------------- Confirmation email (best effort) ------------------------- */
  void sendEmail({
    to: input.email,
    ...orderConfirmationEmail({ firstName: input.firstName, orderNumber, total: formatNaira(total), orderUrl: absoluteUrl(`/order/${orderNumber}`) }),
  }).catch(() => undefined);

  /* --------------------------- Online payment hand-off --------------------------- */
  if (input.paymentMethod === "paystack") {
    try {
      const provider = getPaymentProvider("paystack");
      const init = await provider.initialize({
        reference,
        orderNumber,
        amount: total,
        email: input.email,
        callbackUrl: absoluteUrl(`/api/payments/paystack/callback`),
        metadata: { order_id: orderId, customer_name: `${input.firstName} ${input.lastName}` },
      });
      return { ok: true, orderNumber, redirectUrl: init.authorizationUrl };
    } catch (error) {
      console.error("Paystack initialize failed:", error);
      const message = error instanceof PaymentConfigurationError ? error.message : "We couldn't start the online payment.";
      return { ok: false, error: `${message} Your order ${orderNumber} has been saved — you can retry payment or pay by bank transfer.`, orderNumber };
    }
  }

  return { ok: true, orderNumber };
}

/** Re-initialises an online payment for an existing unpaid order. */
export async function retryPayment(orderNumber: string): Promise<PlaceOrderResult> {
  const order = await db.query.orders.findFirst({ where: eq(orders.orderNumber, orderNumber) });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.paymentStatus === "paid") return { ok: true, orderNumber };
  if (order.status === "cancelled") return { ok: false, error: "This order has been cancelled." };
  if (!isOnlinePaymentEnabled()) return { ok: false, error: "Online payment is not available yet. Please pay by bank transfer." };

  const reference = generateReference();
  await db.insert(payments).values({ orderId: order.id, provider: "paystack", reference, amount: order.total, status: "pending" });
  if (order.paymentMethod !== "paystack") {
    await db.update(orders).set({ paymentMethod: "paystack", updatedAt: new Date() }).where(eq(orders.id, order.id));
  }

  try {
    const init = await getPaymentProvider("paystack").initialize({
      reference,
      orderNumber,
      amount: order.total,
      email: order.email,
      callbackUrl: absoluteUrl(`/api/payments/paystack/callback`),
    });
    return { ok: true, orderNumber, redirectUrl: init.authorizationUrl };
  } catch (error) {
    console.error("Paystack retry failed:", error);
    return { ok: false, error: "We couldn't start the payment. Please try again or contact us on WhatsApp.", orderNumber };
  }
}
