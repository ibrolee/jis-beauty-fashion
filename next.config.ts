import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "**/*": [
      "./node_modules/pg-cloudflare/dist/**",
      "./node_modules/pg-cloudflare/esm/**",
    ],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/avif", "image/webp"],
  },

  async rewrites() {
    const fragranceFallback =
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85";

    return {
      beforeFiles: [
        {
          source: "/images/hero.jpg",
          destination: fragranceFallback,
        },
        {
          source: "/images/products/:path*",
          destination: fragranceFallback,
        },
      ],
    };
  },

  poweredByHeader: false,
};

export default nextConfig;