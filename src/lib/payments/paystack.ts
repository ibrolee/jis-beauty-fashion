import { createHmac, timingSafeEqual } from "node:crypto";
import {
  PaymentConfigurationError,
  PaymentProviderError,
  type PaymentInitInput,
  type PaymentInitResult,
  type PaymentProvider,
  type PaymentVerifyResult,
} from "./types";

/**
 * Paystack provider — https://paystack.com/docs/api/transaction
 *
 * Required env: PAYSTACK_SECRET_KEY (server only).
 * Optional:     NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY (only needed if you later add
 *               the inline/popup checkout instead of the redirect flow).
 *
 * Flow used by this app (redirect / "standard" integration):
 *   1. checkout action -> initialize()            -> customer redirected to Paystack
 *   2. Paystack -> /api/payments/paystack/callback -> verify()  -> order marked paid
 *   3. Paystack -> /api/payments/paystack/webhook  -> verify signature -> order marked paid
 *      (webhook is the source of truth if the customer closes the browser early)
 */
const PAYSTACK_BASE_URL = "https://api.paystack.co";

type PaystackResponse<T> = { status: boolean; message: string; data: T };

type PaystackInitData = { authorization_url: string; access_code: string; reference: string };

type PaystackVerifyData = {
  status: string; // "success" | "failed" | "abandoned" | "pending" | ...
  reference: string;
  amount: number; // kobo
  currency: string;
  channel?: string;
  paid_at?: string | null;
  gateway_response?: string;
  customer?: { email?: string };
  metadata?: Record<string, unknown>;
};

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new PaymentConfigurationError();
  return key;
}

async function paystackFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const body = (await response.json().catch(() => null)) as PaystackResponse<T> | null;
  if (!response.ok || !body?.status) {
    throw new PaymentProviderError(body?.message ?? `Paystack request failed (${response.status})`, body);
  }
  return body.data;
}

export const paystackProvider: PaymentProvider = {
  id: "paystack",

  isConfigured() {
    return Boolean(process.env.PAYSTACK_SECRET_KEY);
  },

  async initialize(input: PaymentInitInput): Promise<PaymentInitResult> {
    const data = await paystackFetch<PaystackInitData>("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        amount: input.amount * 100, // ₦ -> kobo
        currency: "NGN",
        reference: input.reference,
        callback_url: input.callbackUrl,
        metadata: {
          order_number: input.orderNumber,
          ...input.metadata,
        },
      }),
    });

    return {
      reference: data.reference,
      authorizationUrl: data.authorization_url,
      accessCode: data.access_code,
    };
  },

  async verify(reference: string): Promise<PaymentVerifyResult> {
    const data = await paystackFetch<PaystackVerifyData>(`/transaction/verify/${encodeURIComponent(reference)}`);

    const status: PaymentVerifyResult["status"] =
      data.status === "success" ? "paid" : data.status === "pending" || data.status === "ongoing" ? "pending" : "failed";

    return {
      reference: data.reference,
      status,
      amount: Math.round(data.amount / 100), // kobo -> ₦
      currency: data.currency,
      channel: data.channel,
      paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
      raw: data as unknown as Record<string, unknown>,
    };
  },

  verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
    if (!signature || !process.env.PAYSTACK_SECRET_KEY) return false;
    const expected = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(rawBody).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    return a.length === b.length && timingSafeEqual(a, b);
  },
};
