import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product/category images may be pasted as external URLs from the admin
    // (Cloudinary, S3, etc.). Tighten this list to your storage host in production.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
};

export default nextConfig;
