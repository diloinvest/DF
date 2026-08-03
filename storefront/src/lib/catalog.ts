import "server-only";

import * as local from "@/lib/data/catalog";
import * as shopify from "@/lib/shopify";
import type { Collection, Page, Product, SortKey } from "@/lib/types";

/**
 * Единственият източник на данни за страниците.
 *
 * Ако Storefront API е конфигуриран — ползва живите данни. Ако не е, или
 * ако заявката се провали, пада обратно на локалния каталог, вместо да
 * счупи страницата. Компонентите не знаят кой от двата е активен.
 */

let warned = false;

function warnOnce(error: unknown) {
  if (warned) return;
  warned = true;
  console.warn(
    "[catalog] Storefront API unavailable, serving the local catalogue:",
    error instanceof Error ? error.message : error,
  );
}

async function withFallback<T>(
  live: () => Promise<T>,
  fallback: () => T,
): Promise<T> {
  if (!shopify.isShopifyConfigured()) return fallback();
  try {
    return await live();
  } catch (error) {
    warnOnce(error);
    return fallback();
  }
}

export function usingLiveData(): boolean {
  return shopify.isShopifyConfigured();
}

export async function getAllProducts(): Promise<Product[]> {
  return withFallback(
    () => shopify.fetchProducts(250),
    () => local.products,
  );
}

export async function getProduct(handle: string): Promise<Product | null> {
  return withFallback(
    () => shopify.fetchProduct(handle),
    () => local.products.find((p) => p.handle === handle) ?? null,
  );
}

export async function getCollections(): Promise<Collection[]> {
  return withFallback(
    () => shopify.fetchCollections(),
    () => local.collections,
  );
}

export async function getCollection(
  handle: string,
): Promise<{ collection: Collection; products: Product[] } | null> {
  return withFallback(
    () => shopify.fetchCollection(handle),
    () => {
      const collection = local.collections.find((c) => c.handle === handle);
      if (!collection) return null;
      const byHandle = new Map(local.products.map((p) => [p.handle, p]));
      const products = collection.productHandles
        .map((h) => byHandle.get(h))
        .filter((p): p is Product => Boolean(p));
      return { collection, products };
    },
  );
}

export async function getCollectionProducts(handle: string): Promise<Product[]> {
  const result = await getCollection(handle);
  return result?.products ?? [];
}

export async function getPage(handle: string): Promise<Page | null> {
  return withFallback(
    () => shopify.fetchPage(handle),
    () => local.pages.find((p) => p.handle === handle) ?? null,
  );
}

export async function getPageHandles(): Promise<string[]> {
  return local.pages.map((p) => p.handle);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  const all = await withFallback(
    () => shopify.fetchProducts(100, term),
    () => local.products,
  );

  // Филтрираме и локално — Storefront search вече е стеснил резултата,
  // но локалният каталог не е, а поведението трябва да е еднакво.
  return all.filter((product) => {
    const haystack = [
      product.title,
      product.description,
      product.productType,
      product.vendor,
      ...product.tags,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  });
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const all = await getAllProducts();
  const scored = all
    .filter((p) => p.handle !== product.handle)
    .map((p) => ({
      product: p,
      score:
        (p.productType === product.productType ? 2 : 0) +
        p.tags.filter((t) => product.tags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.product);
}

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const sorted = [...products];
  switch (sort) {
    case "price-asc":
      return sorted.sort(
        (a, b) => Number(a.priceRange.min.amount) - Number(b.priceRange.min.amount),
      );
    case "price-desc":
      return sorted.sort(
        (a, b) => Number(b.priceRange.min.amount) - Number(a.priceRange.min.amount),
      );
    case "title-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "newest":
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "featured":
    default:
      return sorted.sort(
        (a, b) => Number(b.featured) - Number(a.featured),
      );
  }
}

export function parseSort(value: string | undefined): SortKey {
  const allowed: SortKey[] = [
    "featured",
    "price-asc",
    "price-desc",
    "title-asc",
    "newest",
  ];
  return allowed.includes(value as SortKey) ? (value as SortKey) : "featured";
}

/** Уникалните продуктови типове в даден списък — за филтъра в колекцията. */
export function productTypesOf(products: Product[]): string[] {
  return [...new Set(products.map((p) => p.productType).filter(Boolean))].sort();
}
