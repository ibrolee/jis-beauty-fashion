import type { Metadata } from "next";
import { AddressManager } from "@/components/account/address-manager";
import { requireUser } from "@/lib/auth/session";
import { getUserAddresses } from "@/lib/data/users";

export const metadata: Metadata = { title: "Addresses", robots: { index: false } };

export default async function AddressesPage() {
  const user = await requireUser("/account/addresses");
  const addresses = await getUserAddresses(user.id);
  return <AddressManager addresses={addresses} />;
}
