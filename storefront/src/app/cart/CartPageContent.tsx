"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { startCheckout } from "@/app/actions/checkout";
import { useCart } from "@/components/cart/CartProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ui } from "@/content/site";
import { formatAmount } from "@/lib/money";

export function CartPageContent() {
  const { items, subtotal, currencyCode, setQuantity, remove, isHydrated } =
    useCart();
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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

  if (!isHydrated) {
    return (
      <div className="space-y-4" aria-hidden="true">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-[var(--radius)] bg-[var(--color-surface)]"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-10">
        <p className="text-lg font-medium">{ui.cartEmpty}</p>
        <p className="text-[var(--color-text-muted)]">{ui.cartEmptyBody}</p>
        <ButtonLink href="/collections/all">{ui.continueShopping}</ButtonLink>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
      <ul className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
        {items.map((item) => (
          <li key={item.variantId} className="flex gap-5 py-6">
            <div className="relative h-32 w-26 shrink-0 overflow-hidden rounded-[var(--radius)] bg-[var(--color-surface)]">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.imageAlt}
                  fill
                  sizes="104px"
                  className="object-cover"
                />
              ) : null}
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/products/${item.productHandle}`}
                    className="font-medium"
                  >
                    {item.productTitle}
                  </Link>
                  {item.variantTitle && item.variantTitle !== "Default" ? (
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {item.variantTitle}
                    </p>
                  ) : null}
                </div>
                <p className="font-medium tabular-nums">
                  {formatAmount(item.price * item.quantity, item.currencyCode)}
                </p>
              </div>

              <div className="mt-auto flex items-center gap-4 pt-4">
                <div className="flex items-center rounded-[var(--radius)] border border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                    className="h-9 w-9 text-lg leading-none"
                    aria-label={`Decrease quantity of ${item.productTitle}`}
                  >
                    −
                  </button>
                  <span className="w-9 text-center text-sm tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                    disabled={item.quantity >= item.maxQuantity}
                    className="h-9 w-9 text-lg leading-none disabled:opacity-40"
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
        ))}
      </ul>

      <aside className="h-fit rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 lg:sticky lg:top-24">
        <h2 className="text-lg font-medium">Order summary</h2>

        <dl className="mt-5 space-y-3 border-b border-[var(--color-border)] pb-5">
          <div className="flex justify-between">
            <dt className="text-[var(--color-text-muted)]">{ui.subtotal}</dt>
            <dd className="tabular-nums">
              {formatAmount(subtotal, currencyCode)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--color-text-muted)]">Shipping</dt>
            <dd className="text-[var(--color-text-muted)]">
              Calculated at checkout
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex justify-between text-lg font-medium">
          <span>Total</span>
          <span className="tabular-nums">
            {formatAmount(subtotal, currencyCode)}
          </span>
        </div>

        {notice ? (
          <p
            role="status"
            className="mt-4 rounded-[var(--radius)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text-muted)]"
          >
            {notice}
          </p>
        ) : null}

        <Button
          size="lg"
          className="mt-5 w-full"
          onClick={onCheckout}
          disabled={pending}
          data-testid="checkout-button"
        >
          {pending ? `${ui.checkout}…` : ui.checkout}
        </Button>

        <Link
          href="/collections/all"
          className="mt-4 block text-center text-sm underline underline-offset-4"
        >
          {ui.continueShopping}
        </Link>
      </aside>
    </div>
  );
}
