import { count } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { seedDatabase } from "./seed";

let seedPromise: Promise<void> | null = null;

/**
 * Seeds demo data once per server process when the catalogue is empty.
 * Safe to call from any data-access function — it memoises the check.
 * Remove this call-site once you manage products through the admin panel.
 */
export function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const [{ value }] = await db.select({ value: count() }).from(products);
      if (value === 0) await seedDatabase();
    })().catch((error) => {
      seedPromise = null;
      console.error("Auto-seed failed:", error);
    });
  }
  return seedPromise;
}
