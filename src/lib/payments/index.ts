import type { PaymentMethod } from "@/db/schema";
import { paystackProvider } from "./paystack";
import type { PaymentProvider } from "./types";

export * from "./types";

const providers: Record<string, PaymentProvider> = {
  paystack: paystackProvider,
};

export function getPaymentProvider(id: string): PaymentProvider {
  const provider = providers[id];
  if (!provider) throw new Error(`Unknown payment provider: ${id}`);
  return provider;
}

export function isOnlinePaymentEnabled(): boolean {
  return paystackProvider.isConfigured();
}

export function providerForMethod(method: PaymentMethod): PaymentProvider | null {
  return method === "paystack" ? paystackProvider : null;
}

// Account details supplied by the shop owner. Do not replace these with
// deployment environment defaults or unverified demo account information.
export const BANK_TRANSFER_DETAILS = {
  bankName: "GTBank",
  accountName: "Alli Ibrahim Olanrewaju",
  accountNumber: "0172349956",
  configured: true,
} as const;
