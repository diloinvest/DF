"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import { cartStore, hydrationStore, type CartItem } from "@/lib/cart-store";

export type { CartItem };

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  isHydrated: boolean;
  count: number;
  subtotal: number;
  currencyCode: string;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );
  const isHydrated = useSyncExternalStore(
    hydrationStore.subscribe,
    hydrationStore.getSnapshot,
    hydrationStore.getServerSnapshot,
  );

  const [isOpen, setIsOpen] = useState(false);

  // Заключваме скрола на body, докато чекмеджето е отворено.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const add = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      cartStore.add(item, quantity);
      setIsOpen(true);
    },
    [],
  );

  const value = useMemo<CartState>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return {
      items,
      isOpen,
      isHydrated,
      count,
      subtotal,
      currencyCode: items[0]?.currencyCode ?? "USD",
      add,
      remove: cartStore.remove,
      setQuantity: cartStore.setQuantity,
      clear: cartStore.clear,
      open,
      close,
    };
  }, [items, isOpen, isHydrated, add, open, close]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return context;
}
