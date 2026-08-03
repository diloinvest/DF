import "server-only";

const API_VERSION = "2025-10";

export const shopifyConfig = {
  domain: process.env.SHOPIFY_STORE_DOMAIN ?? "",
  token: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "",
};

/** Живите данни се ползват само ако и двете променливи са налични. */
export function isShopifyConfigured(): boolean {
  return Boolean(shopifyConfig.domain && shopifyConfig.token);
}

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

export class ShopifyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShopifyError";
  }
}

export async function storefrontFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  revalidate = 300,
): Promise<T> {
  if (!isShopifyConfigured()) {
    throw new ShopifyError("Storefront API is not configured");
  }

  const endpoint = `https://${shopifyConfig.domain}/api/${API_VERSION}/graphql.json`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": shopifyConfig.token,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate, tags: ["shopify"] },
  });

  if (!response.ok) {
    throw new ShopifyError(
      `Storefront API responded ${response.status} ${response.statusText}`,
    );
  }

  const json = (await response.json()) as GraphQLResponse<T>;

  if (json.errors?.length) {
    throw new ShopifyError(json.errors.map((e) => e.message).join("; "));
  }
  if (!json.data) {
    throw new ShopifyError("Storefront API returned no data");
  }

  return json.data;
}
