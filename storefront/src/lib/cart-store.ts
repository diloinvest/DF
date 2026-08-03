/**
 * Количката като външно хранилище (vanilla store + localStorage).
 *
 * Не е useState в ефект: React чете това през `useSyncExternalStore`, което
 * дава коректна хидратация (сървърът рендира празна количка, клиентът
 * веднага я заменя с реалната) без каскадни ререндери.
 */

export type CartItem = {
  variantId: string;
  productHandle: string;
  productTitle: string;
  variantTitle: string;
  price: number;
  currencyCode: string;
  image: string | null;
  imageAlt: string;
  quantity: number;
  maxQuantity: number;
};

const STORAGE_KEY = "cartely.cart.v1";

/** Стабилна референция за сървърния snapshot — иначе React се върти безкрайно. */
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<CartItem>;
  return (
    typeof item.variantId === "string" &&
    typeof item.productHandle === "string" &&
    typeof item.productTitle === "string" &&
    typeof item.price === "number" &&
    typeof item.quantity === "number" &&
    typeof item.maxQuantity === "number"
  );
}

function readStorage(): CartItem[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    const valid = parsed.filter(isCartItem);
    return valid.length > 0 ? valid : EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeStorage(next: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Частен режим или пълно хранилище — количката просто не преживява refresh.
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function commit(next: CartItem[]) {
  items = next;
  writeStorage(next);
  emit();
}

/** Първото четене от localStorage. Извиква се от subscribe при mount. */
function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const stored = readStorage();
  if (stored !== EMPTY) {
    items = stored;
    emit();
  }
}

export const cartStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    ensureLoaded();
    return () => {
      listeners.delete(listener);
    };
  },

  getSnapshot(): CartItem[] {
    return items;
  },

  getServerSnapshot(): CartItem[] {
    return EMPTY;
  },

  add(item: Omit<CartItem, "quantity">, quantity = 1) {
    const existing = items.find((i) => i.variantId === item.variantId);
    if (existing) {
      commit(
        items.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: Math.min(i.quantity + quantity, i.maxQuantity) }
            : i,
        ),
      );
      return;
    }
    commit([...items, { ...item, quantity }]);
  },

  remove(variantId: string) {
    commit(items.filter((i) => i.variantId !== variantId));
  },

  setQuantity(variantId: string, quantity: number) {
    commit(
      quantity <= 0
        ? items.filter((i) => i.variantId !== variantId)
        : items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.min(quantity, i.maxQuantity) }
              : i,
          ),
    );
  },

  clear() {
    commit(EMPTY);
  },
};

/** Отделно хранилище само за „вече сме на клиента" — пази скелетоните честни. */
export const hydrationStore = {
  subscribe(): () => void {
    return () => {};
  },
  getSnapshot(): boolean {
    return true;
  },
  getServerSnapshot(): boolean {
    return false;
  },
};
