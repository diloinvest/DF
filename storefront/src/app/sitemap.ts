import type { MetadataRoute } from "next";

import { getAllProducts, getCollections, getPageHandles } from "@/lib/catalog";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cartely.store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections, pageHandles] = await Promise.all([
    getAllProducts(),
    getCollections(),
    getPageHandles(),
  ]);

  return [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    ...collections.map((collection) => ({
      url: `${BASE_URL}/collections/${collection.handle}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${BASE_URL}/products/${product.handle}`,
      lastModified: new Date(product.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...pageHandles.map((handle) => ({
      url: `${BASE_URL}/pages/${handle}`,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
