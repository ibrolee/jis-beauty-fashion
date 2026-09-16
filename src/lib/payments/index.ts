import type { PaymentMethod } from "@/db/schema";
import { paystackProvider } from "./paystack";
import type { PaymentProvider } from "./types";

export * from "./types";

const providers: Record<string, PaymentProvider> = {
  paystack: paystackProvider,
  // flutterwave: flutterwaveProvider, // <- add more providers here
};

export function getPaymentProvider(id: string): PaymentProvider {
  const provider = providers[id];
  if (!provider) throw new Error(`Unknown payment provider: ${id}`);
  return provider;
}

/** Whether the "pay online" option should be offered at checkout. */
export function isOnlinePaymentEnabled(): boolean {
  return paystackProvider.isConfigured();
}

/** Maps a checkout payment method to the provider that handles it (null = manual/offline). */
export function providerForMethod(method: PaymentMethod): PaymentProvider | null {
  return method === "paystack" ? paystackProvider : null;
}

export const BANK_TRANSFER_DETAILS = {
  bankName: process.env.NEXT_PUBLIC_BANK_NAME ?? "",
  accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ?? "JIS Beauty & Fashion",
  accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ?? "",
  get configured() {
    return Boolean(this.bankName && this.accountNumber);
  },
};
