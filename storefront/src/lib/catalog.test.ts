import { describe, expect, it } from "vitest";

import { products } from "@/lib/data/catalog";
import {
  getCollection,
  getRelatedProducts,
  parseSort,
  productTypesOf,
  searchProducts,
  sortProducts,
} from "./catalog";

describe("sortProducts", () => {
  it("orders by ascending price", () => {
    const sorted = sortProducts(products, "price-asc");
    const prices = sorted.map((p) => Number(p.priceRange.min.amount));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it("orders by descending price", () => {
    const sorted = sortProducts(products, "price-desc");
    const prices = sorted.map((p) => Number(p.priceRange.min.amount));
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  it("orders newest first", () => {
    const dates = sortProducts(products, "newest").map((p) =>
      new Date(p.createdAt).getTime(),
    );
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
  });

  it("puts featured products first", () => {
    const sorted = sortProducts(products, "featured");
    const firstNonFeatured = sorted.findIndex((p) => !p.featured);
    const lastFeatured = sorted.findLastIndex((p) => p.featured);
    expect(lastFeatured).toBeLessThan(firstNonFeatured);
  });

  it("does not mutate the input array", () => {
    const original = [...products];
    sortProducts(products, "price-desc");
    expect(products).toEqual(original);
  });
});

describe("parseSort", () => {
  it("accepts the known keys", () => {
    expect(parseSort("price-desc")).toBe("price-desc");
  });

  it("falls back to featured for anything else", () => {
    expect(parseSort(undefined)).toBe("featured");
    expect(parseSort("'; DROP TABLE products;--")).toBe("featured");
  });
});

describe("searchProducts", () => {
  it("matches on the title", async () => {
    const results = await searchProducts("diver");
    expect(results.map((p) => p.handle)).toContain("atlas-diver-300");
  });

  it("matches on a tag rather than only the title", async () => {
    const results = await searchProducts("chronograph");
    expect(results.length).toBeGreaterThan(0);
  });

  it("is case insensitive and trims", async () => {
    const a = await searchProducts("  DIVER ");
    const b = await searchProducts("diver");
    expect(a.map((p) => p.handle)).toEqual(b.map((p) => p.handle));
  });

  it("returns nothing for an empty query instead of the whole catalogue", async () => {
    expect(await searchProducts("   ")).toEqual([]);
  });

  it("returns nothing when there is genuinely no match", async () => {
    expect(await searchProducts("zzzzzz")).toEqual([]);
  });
});

describe("getCollection", () => {
  it("resolves handles to real products", async () => {
    const result = await getCollection("divers");
    expect(result).not.toBeNull();
    expect(result!.products.length).toBeGreaterThan(0);
    for (const product of result!.products) {
      expect(product.tags).toContain("diver");
    }
  });

  it("returns null for an unknown handle", async () => {
    expect(await getCollection("no-such-collection")).toBeNull();
  });

  it("puts every product in the catalog collection", async () => {
    const result = await getCollection("all");
    expect(result!.products).toHaveLength(products.length);
  });
});

describe("getRelatedProducts", () => {
  it("never includes the product itself", async () => {
    const product = products[0];
    const related = await getRelatedProducts(product);
    expect(related.map((p) => p.handle)).not.toContain(product.handle);
  });

  it("respects the limit", async () => {
    expect(await getRelatedProducts(products[0], 2)).toHaveLength(2);
  });

  it("prefers the same product type", async () => {
    const diver = products.find((p) => p.productType === "Diver")!;
    const related = await getRelatedProducts(diver, 1);
    expect(related[0].productType).toBe("Diver");
  });
});

describe("productTypesOf", () => {
  it("returns unique sorted types", () => {
    const types = productTypesOf(products);
    expect(types).toEqual([...new Set(types)].sort());
  });

  it("drops empty values", () => {
    const types = productTypesOf([
      { ...products[0], productType: "" },
      products[1],
    ]);
    expect(types).not.toContain("");
  });
});
