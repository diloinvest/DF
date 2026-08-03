"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { startCheckout } from "@/app/actions/checkout";
import { Button } from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/Icons";
import { ui } from "@/content/site";
import { formatAmount } from "@/lib/money";
import { useCart } from "./CartProvider";

export function CartDrawer() {
  const { isOpen } = useCart();
  // Панелът се монтира само когато е отворен, за да не носи стар
  // notice/pending статус при следващото отваряне.
  return isOpen ? <CartPanel /> : null;
}

function CartPanel() {
  const { close, items, subtotal, currencyCode } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  async function onCheckout() {
    setPending(true);
    setNotice(null);
    const result = await startCheckout(
      items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
    );
    if (result.ok) {
      window.location.href = result.url;
      return;
    }
    setNotice(result.message);
    setPending(false);
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={close}
        aria-label={ui.close}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={ui.cart}
        data-testid="cart-drawer"
        className="absolute inset-y-0 right-0 flex w-[min(26rem,100vw)] flex-col bg-[var(--color-bg)] shadow-[var(--shadow-overlay)] outline-hidden"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5">
          <h2 className="text-base font-medium">
            {ui.cart}
            {items.length > 0 ? ` (${items.length})` : ""}
          </h2>
          <button
            type="button"
            onClick={close}
            className="-mr-2 rounded p-2"
            aria-label={ui.close}
          >
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <p className="font-medium">{ui.cartEmpty}</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              {ui.cartEmptyBody}
            </p>
            <Link
              href="/collections/all"
              onClick={close}
              className="mt-2 text-sm underline underline-offset-4"
            >
              {ui.continueShopping}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-[var(--color-border)] overflow-y-auto px-5">
              {items.map((item) => (
                <CartLineRow key={item.variantId} item={item} />
              ))}
            </ul>

            <div className="shrink-0 space-y-3 border-t border-[var(--color-border)] p-5">
              <div className="flex items-baseline justify-between">
                <span className="font-medium">{ui.subtotal}</span>
                <span className="text-lg font-medium">
                  {formatAmount(subtotal, currencyCode)}
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">
                {ui.shippingNote}
              </p>
              {notice ? (
                <p
                  role="status"
                  className="rounded-[var(--radius)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text-muted)]"
                >
                  {notice}
                </p>
              ) : null}
              <Button
                size="lg"
                className="w-full"
                onClick={onCheckout}
                disabled={pending}
                data-testid="checkout-button"
              >
                {pending ? `${ui.checkout}…` : ui.checkout}
              </Button>
              <Link
                href="/cart"
                onClick={close}
                className="block text-center text-sm underline underline-offset-4"
              >
                View full cart
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CartLineRow({
  item,
}: {
  item: ReturnType<typeof useCart>["items"][number];
}) {
  const { setQuantity, remove } = useCart();

  return (
    <li className="flex gap-4 py-4">
      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[var(--radius)] bg-[var(--color-surface)]">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.imageAlt}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          href={`/products/${item.productHandle}`}
          className="truncate text-sm font-medium"
        >
          {item.productTitle}
        </Link>
        {item.variantTitle && item.variantTitle !== "Default" ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            {item.variantTitle}
          </p>
        ) : null}
        <p className="text-sm">{formatAmount(item.price, item.currencyCode)}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center rounded-[var(--radius)] border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setQuantity(item.variantId, item.quantity - 1)}
              className="h-8 w-8 text-lg leading-none"
              aria-label={`Decrease quantity of ${item.productTitle}`}
            >
              −
            </button>
            <span
              className="w-8 text-center text-sm tabular-nums"
              aria-label={ui.quantity}
            >
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(item.variantId, item.quantity + 1)}
              disabled={item.quantity >= item.maxQuantity}
              className="h-8 w-8 text-lg leading-none disabled:opacity-40"
              aria-label={`Increase quantity of ${item.productTitle}`}
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => remove(item.variantId)}
            className="text-sm text-[var(--color-text-muted)] underline underline-offset-4"
          >
            {ui.remove}
          </button>
        </div>
      </div>
    </li>
  );
}
