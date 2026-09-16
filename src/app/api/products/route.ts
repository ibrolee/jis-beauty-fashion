import { NextResponse } from "next/server";
import { getProducts, getProductsByIds } from "@/lib/data/products";
import { parseProductFilters } from "@/lib/shop-params";

/**
 * GET /api/products?ids=1,2,3   -> specific products (wishlist page)
 * GET /api/products?q=oud&...   -> same filters as the shop page (JSON)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids");

  if (ids) {
    const list = ids.split(",").map((n) => Number(n)).filter((n) => Number.isInteger(n) && n > 0).slice(0, 100);
    const products = await getProductsByIds(list);
    return NextResponse.json({ items: products });
  }

  const params: Record<string, string> = {};
  searchParams.forEach((v, k) => (params[k] = v));
  const result = await getProducts(parseProductFilters(params));
  return NextResponse.json(result);
}
