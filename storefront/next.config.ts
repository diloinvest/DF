import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Продуктовите снимки идват от Shopify CDN, когато Storefront API е включен.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "**.myshopify.com" },
    ],
  },
};

export default nextConfig;
