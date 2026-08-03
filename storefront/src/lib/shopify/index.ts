import "server-only";

import type {
  Collection,
  Money,
  Page,
  Product,
  ProductImage,
  ProductVariant,
} from "@/lib/types";
import { ShopifyError, isShopifyConfigured, storefrontFetch } from "./client";
import {
  CART_CREATE_MUTATION,
  COLLECTIONS_QUERY,
  COLLECTION_QUERY,
  PAGE_QUERY,
  PRODUCTS_QUERY,
  PRODUCT_QUERY,
} from "./queries";

/* --- Shopify GraphQL форми (само полетата, които заявяваме) --- */

type SFMoney = { amount: string; currencyCode: string };
type SFImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};
type SFVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: SFMoney;
  compareAtPrice: SFMoney | null;
  selectedOptions: { name: string; value: string }[];
};
type SFProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  tags: string[];
  vendor: string;
  createdAt: string;
  availableForSale: boolean;
  options: { name: string; optionValues: { name: string }[] }[];
  priceRange: { minVariantPrice: SFMoney; maxVariantPrice: SFMoney };
  compareAtPriceRange: { maxVariantPrice: SFMoney } | null;
  images: { nodes: SFImage[] };
  variants: { nodes: SFVariant[] };
};
type SFCollection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: SFImage | null;
  products?: { nodes: SFProduct[] };
};

/* --- Мапване към вътрешните типове --- */

function toMoney(m: SFMoney): Money {
  return { amount: m.amount, currencyCode: m.currencyCode };
}

function toImage(image: SFImage, fallbackAlt: string): ProductImage {
  return {
    url: image.url,
    altText: image.altText ?? fallbackAlt,
    width: image.width ?? 1000,
    height: image.height ?? 1250,
  };
}

function toVariant(variant: SFVariant): ProductVariant {
  return {
    id: variant.id,
    title: variant.title,
    availableForSale: variant.availableForSale,
    price: toMoney(variant.price),
    compareAtPrice: variant.compareAtPrice
      ? toMoney(variant.compareAtPrice)
      : null,
    selectedOptions: Object.fromEntries(
      variant.selectedOptions.map((o) => [o.name, o.value]),
    ),
  };
}

function toProduct(product: SFProduct): Product {
  const compareAt = product.compareAtPriceRange?.maxVariantPrice ?? null;
  const hasDiscount =
    compareAt !== null &&
    Number(compareAt.amount) > Number(product.priceRange.minVariantPrice.amount);

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    productType: product.productType,
    tags: product.tags,
    vendor: product.vendor,
    createdAt: product.createdAt,
    availableForSale: product.availableForSale,
    featured: product.tags.includes("featured"),
    images: product.images.nodes.map((i) => toImage(i, product.title)),
    options: product.options.map((o) => ({
      name: o.name,
      values: o.optionValues.map((v) => v.name),
    })),
    variants: product.variants.nodes.map(toVariant),
    priceRange: {
      min: toMoney(product.priceRange.minVariantPrice),
      max: toMoney(product.priceRange.maxVariantPrice),
    },
    compareAtPrice: hasDiscount ? toMoney(compareAt) : null,
  };
}

/* --- Публично API --- */

export { isShopifyConfigured, ShopifyError };

export async function fetchProducts(first = 100, query?: string): Promise<Product[]> {
  const data = await storefrontFetch<{ products: { nodes: SFProduct[] } }>(
    PRODUCTS_QUERY,
    { first, query },
  );
  return data.products.nodes.map(toProduct);
}

export async function fetchProduct(handle: string): Promise<Product | null> {
  const data = await storefrontFetch<{ product: SFProduct | null }>(
    PRODUCT_QUERY,
    { handle },
  );
  return data.product ? toProduct(data.product) : null;
}

export async function fetchCollection(
  handle: string,
  first = 100,
): Promise<{ collection: Collection; products: Product[] } | null> {
  const data = await storefrontFetch<{ collection: SFCollection | null }>(
    COLLECTION_QUERY,
    { handle, first },
  );
  if (!data.collection) return null;

  const products = (data.collection.products?.nodes ?? []).map(toProduct);
  return {
    collection: {
      id: data.collection.id,
      handle: data.collection.handle,
      title: data.collection.title,
      description: data.collection.description,
      image: data.collection.image
        ? toImage(data.collection.image, data.collection.title)
        : null,
      productHandles: products.map((p) => p.handle),
    },
    products,
  };
}

export async function fetchCollections(first = 50): Promise<Collection[]> {
  const data = await storefrontFetch<{ collections: { nodes: SFCollection[] } }>(
    COLLECTIONS_QUERY,
    { first },
  );
  return data.collections.nodes.map((c) => ({
    id: c.id,
    handle: c.handle,
    title: c.title,
    description: c.description,
    image: c.image ? toImage(c.image, c.title) : null,
    productHandles: [],
  }));
}

export async function fetchPage(handle: string): Promise<Page | null> {
  const data = await storefrontFetch<{
    page: { handle: string; title: string; body: string } | null;
  }>(PAGE_QUERY, { handle });
  if (!data.page) return null;
  return {
    handle: data.page.handle,
    title: data.page.title,
    bodyHtml: data.page.body,
  };
}

/**
 * Създава Shopify cart и връща checkoutUrl. Плащането се случва в
 * Shopify Checkout — не преизграждаме checkout-а.
 */
export async function createCheckout(
  lines: { variantId: string; quantity: number }[],
): Promise<string> {
  const data = await storefrontFetch<{
    cartCreate: {
      cart: { id: string; checkoutUrl: string } | null;
      userErrors: { message: string }[];
    };
  }>(
    CART_CREATE_MUTATION,
    {
      lines: lines.map((l) => ({
        merchandiseId: l.variantId,
        quantity: l.quantity,
      })),
    },
    0,
  );

  const { cart, userErrors } = data.cartCreate;
  if (userErrors.length) {
    throw new ShopifyError(userErrors.map((e) => e.message).join("; "));
  }
  if (!cart) {
    throw new ShopifyError("cartCreate returned no cart");
  }
  return cart.checkoutUrl;
}
