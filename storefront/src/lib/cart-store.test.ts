import { beforeEach, describe, expect, it, vi } from "vitest";

import { cartStore, type CartItem } from "./cart-store";

function makeItem(overrides: Partial<CartItem> = {}): Omit<CartItem, "quantity"> {
  return {
    variantId: "gid://local/ProductVariant/1-1",
    productHandle: "atlas-diver-300",
    productTitle: "Atlas Diver 300",
    variantTitle: "Forest green",
    price: 445,
    currencyCode: "EUR",
    image: "/images/products/atlas-diver-300-1.svg",
    imageAlt: "Atlas Diver 300",
    maxQuantity: 10,
    ...overrides,
  };
}

/** Минимален localStorage, за да върви store-ът извън браузър. */
function installStorage() {
  const data = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => void data.set(key, value),
      removeItem: (key: string) => void data.delete(key),
    },
  });
  return data;
}

describe("cartStore", () => {
  beforeEach(() => {
    installStorage();
    cartStore.clear();
  });

  it("starts empty", () => {
    expect(cartStore.getSnapshot()).toEqual([]);
  });

  it("always reports an empty server snapshot", () => {
    cartStore.add(makeItem());
    expect(cartStore.getServerSnapshot()).toEqual([]);
  });

  it("adds a line", () => {
    cartStore.add(makeItem(), 2);
    const items = cartStore.getSnapshot();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it("merges a repeat add into the existing line", () => {
    cartStore.add(makeItem(), 2);
    cartStore.add(makeItem(), 3);
    expect(cartStore.getSnapshot()).toHaveLength(1);
    expect(cartStore.getSnapshot()[0].quantity).toBe(5);
  });

  it("keeps different variants as separate lines", () => {
    cartStore.add(makeItem());
    cartStore.add(makeItem({ variantId: "gid://local/ProductVariant/1-2" }));
    expect(cartStore.getSnapshot()).toHaveLength(2);
  });

  it("caps quantity at maxQuantity when merging", () => {
    cartStore.add(makeItem({ maxQuantity: 3 }), 2);
    cartStore.add(makeItem({ maxQuantity: 3 }), 5);
    expect(cartStore.getSnapshot()[0].quantity).toBe(3);
  });

  it("caps quantity at maxQuantity when set directly", () => {
    cartStore.add(makeItem({ maxQuantity: 4 }));
    cartStore.setQuantity(makeItem().variantId, 99);
    expect(cartStore.getSnapshot()[0].quantity).toBe(4);
  });

  it("removes the line when quantity drops to zero", () => {
    cartStore.add(makeItem());
    cartStore.setQuantity(makeItem().variantId, 0);
    expect(cartStore.getSnapshot()).toEqual([]);
  });

  it("removes the line when quantity goes negative", () => {
    cartStore.add(makeItem());
    cartStore.setQuantity(makeItem().variantId, -3);
    expect(cartStore.getSnapshot()).toEqual([]);
  });

  it("removes a line by id", () => {
    cartStore.add(makeItem());
    cartStore.remove(makeItem().variantId);
    expect(cartStore.getSnapshot()).toEqual([]);
  });

  it("ignores removal of an id that is not in the cart", () => {
    cartStore.add(makeItem());
    cartStore.remove("nope");
    expect(cartStore.getSnapshot()).toHaveLength(1);
  });

  it("notifies subscribers on change", () => {
    const listener = vi.fn();
    const unsubscribe = cartStore.subscribe(listener);
    cartStore.add(makeItem());
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it("stops notifying after unsubscribe", () => {
    const listener = vi.fn();
    cartStore.subscribe(listener)();
    listener.mockClear();
    cartStore.add(makeItem());
    expect(listener).not.toHaveBeenCalled();
  });

  it("persists to localStorage", () => {
    const data = installStorage();
    cartStore.clear();
    cartStore.add(makeItem(), 2);
    const raw = data.get("cartely.cart.v1");
    expect(raw).toBeDefined();
    expect(JSON.parse(raw!)[0].quantity).toBe(2);
  });
});
