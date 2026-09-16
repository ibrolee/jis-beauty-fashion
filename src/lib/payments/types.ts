/**
 * Payment provider abstraction.
 *
 * Every provider (Paystack today; Flutterwave, Monnify, Stripe… later) implements
 * `PaymentProvider`. Checkout code never talks to a provider SDK directly — it
 * goes through `getPaymentProvider()` in ./index.ts.
 *
 * Amounts are always INTEGER NAIRA here; providers convert to kobo themselves.
 */
export type PaymentInitInput = {
  reference: string;
  orderNumber: string;
  amount: number; // ₦
  email: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
};

export type PaymentInitResult = {
  reference: string;
  authorizationUrl: string;
  accessCode?: string;
};

export type PaymentVerifyResult = {
  reference: string;
  status: "paid" | "failed" | "pending";
  amount: number; // ₦ actually charged
  currency: string;
  channel?: string;
  paidAt?: Date;
  raw: Record<string, unknown>;
};

export interface PaymentProvider {
  readonly id: string;
  isConfigured(): boolean;
  initialize(input: PaymentInitInput): Promise<PaymentInitResult>;
  verify(reference: string): Promise<PaymentVerifyResult>;
  verifyWebhookSignature(rawBody: string, signature: string | null): boolean;
}

export class PaymentConfigurationError extends Error {
  constructor(message = "Online payments are not configured yet.") {
    super(message);
    this.name = "PaymentConfigurationError";
  }
}

export class PaymentProviderError extends Error {
  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = "PaymentProviderError";
  }
}
