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

// Owner-confirmed bank recipient for JIS website transfers (20 September 2026).
// This is the only authoritative account shown by the server-rendered order page.
export const BANK_TRANSFER_DETAILS = {
  bankName: "GTBank",
  accountName: "Salmon Salmat Oyindamola",
  accountNumber: "0165946091",
  configured: true,
} as const;
