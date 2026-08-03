"use server";

import { createCheckout, isShopifyConfigured } from "@/lib/shopify";

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; reason: "not-configured" | "failed"; message: string };

/**
 * Разменя редовете на количката за Shopify checkout URL.
 *
 * Плащането умишлено остава в Shopify — тук не се пипат карти, адреси
 * или данъци. Без Storefront токен връщаме ясна причина, вместо да
 * пращаме потребителя в счупен поток.
 */
export async function startCheckout(
  lines: { variantId: string; quantity: number }[],
): Promise<CheckoutResult> {
  if (lines.length === 0) {
    return { ok: false, reason: "failed", message: "The cart is empty." };
  }

  if (!isShopifyConfigured()) {
    return {
      ok: false,
      reason: "not-configured",
      message:
        "Checkout runs on Shopify. Add SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN to .env.local to enable it.",
    };
  }

  try {
    const url = await createCheckout(lines);
    return { ok: true, url };
  } catch (error) {
    return {
      ok: false,
      reason: "failed",
      message:
        error instanceof Error
          ? error.message
          : "Could not reach Shopify checkout.",
    };
  }
}
