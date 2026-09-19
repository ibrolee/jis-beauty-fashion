import { expireUnpaidBankTransfers } from "@/lib/orders/reservations";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Only Vercel's scheduler (or an authorized operator) may trigger cleanup. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const expired = await expireUnpaidBankTransfers(100);
    return Response.json({ expired });
  } catch (error) {
    console.error("Bank-transfer expiration failed:", error);
    return Response.json({ error: "Expiration failed" }, { status: 500 });
  }
}
