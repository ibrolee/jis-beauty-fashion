import { count } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { seedDatabase } from "./seed";

let seedPromise: Promise<void> | null = null;

/** Explicit opt-in for demo preview databases only. Never silently create fake inventory. */
export function ensureSeeded(): Promise<void> {
  // No automatic demo data insertion in a deployed shop.
  if (process.env.NODE_ENV === "production" || process.env.VERCEL || process.env.VERCEL_ENV) return Promise.resolve();
  if (process.env.ENABLE_DEMO_SEED !== "true") return Promise.resolve();
  if (!seedPromise) {
    seedPromise = (async () => {
      const [{ value }] = await db.select({ value: count() }).from(products);
      if (value === 0) await seedDatabase();
    })().catch((error) => {
      seedPromise = null;
      console.error("Demo seed failed:", error);
    });
  }
  return seedPromise;
}
