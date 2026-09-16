import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/account", "/api/", "/checkout", "/cart", "/order/", "/login", "/register", "/reset-password", "/forgot-password", "/wishlist", "/search"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
