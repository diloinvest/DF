"use client";

import { useMemo, useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import { ui } from "@/content/site";
import { clsx } from "@/lib/clsx";
import { discountPercent, formatMoney } from "@/lib/money";
import type { Product, ProductVariant } from "@/lib/types";

const MAX_PER_LINE = 10;

/** Първият вариант, който съвпада с избраните опции. */
function matchVariant(
  product: Product,
  selection: Record<string, string>,
): ProductVariant | undefined {
  return product.variants.find((variant) =>
    Object.entries(selection).every(
      ([name, value]) => variant.selectedOptions[name] === value,
    ),
  );
}

export function ProductPurchase({ product }: { product: Product }) {
  const firstAvailable =
    product.variants.find((v) => v.availableForSale) ?? product.variants[0];

  const [selection, setSelection] = useState<Record<string, string>>(
    firstAvailable?.selectedOptions ?? {},
  );
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const { add } = useCart();

  const variant = useMemo(
    () => matchVariant(product, selection) ?? firstAvailable,
    [product, selection, firstAvailable],
  );

  if (!variant) return null;

  const discount = discountPercent(variant.price, variant.compareAtPrice);
  const soldOut = !variant.availableForSale;

  /**
   * Вариантът, до който води дадена стойност при текущия избор на останалите
   * опции. `undefined` = комбинацията не съществува изобщо.
   */
  function candidateFor(
    optionName: string,
    value: string,
  ): ProductVariant | undefined {
    return product.variants.find((candidate) => {
      if (candidate.selectedOptions[optionName] !== value) return false;
      return Object.entries(selection).every(
        ([name, selected]) =>
          name === optionName || candidate.selectedOptions[name] === selected,
      );
    });
  }

  function onAdd() {
    if (!variant || soldOut) return;
    add(
      {
        variantId: variant.id,
        productHandle: product.handle,
        productTitle: product.title,
        variantTitle: variant.title,
        price: Number(variant.price.amount),
        currencyCode: variant.price.currencyCode,
        image: product.images[0]?.url ?? null,
        imageAlt: product.images[0]?.altText ?? product.title,
        maxQuantity: MAX_PER_LINE,
      },
      quantity,
    );
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <p className={clsx("text-2xl", discount > 0 && "text-[var(--color-sale)]")}>
          {formatMoney(variant.price)}
        </p>
        {variant.compareAtPrice ? (
          <>
            <span className="text-lg text-[var(--color-text-muted)] line-through">
              {formatMoney(variant.compareAtPrice)}
            </span>
            <span className="rounded-[var(--radius)] bg-[var(--color-sale)] px-2 py-0.5 text-xs font-medium text-white">
              −{discount}%
            </span>
          </>
        ) : null}
      </div>

      {product.options
        .filter((option) => option.values.length > 1)
        .map((option) => (
          <fieldset key={option.name}>
            <legend className="mb-2 text-sm font-medium">
              {option.name}
              <span className="ml-2 font-normal text-[var(--color-text-muted)]">
                {selection[option.name]}
              </span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const selected = selection[option.name] === value;
                const candidate = candidateFor(option.name, value);
                // Изчерпан и несъществуващ вариант изглеждат еднакво зачеркнати —
                // и в двата случая не можеш да го купиш в тази комбинация.
                const unavailable =
                  !candidate || !candidate.availableForSale;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setSelection((current) => ({
                        ...current,
                        [option.name]: value,
                      }))
                    }
                    aria-pressed={selected}
                    title={unavailable ? ui.soldOut : undefined}
                    className={clsx(
                      "h-10 rounded-[var(--radius)] border px-4 text-sm transition-colors",
                      selected
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-text)]"
                        : "border-[var(--color-border)] hover:bg-[var(--color-surface)]",
                      unavailable &&
                        !selected &&
                        "text-[var(--color-text-muted)] line-through decoration-1",
                    )}
                  >
                    {value}
                    {unavailable ? (
                      <span className="sr-only"> — {ui.soldOut}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-13 items-center rounded-[var(--radius)] border border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-full w-11 text-lg"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span
            className="w-8 text-center tabular-nums"
            data-testid="quantity"
            aria-label={ui.quantity}
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(MAX_PER_LINE, q + 1))}
            className="h-full w-11 text-lg disabled:opacity-40"
            disabled={quantity >= MAX_PER_LINE}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <Button
          size="lg"
          className="min-w-52 flex-1"
          onClick={onAdd}
          disabled={soldOut}
          data-testid="add-to-cart"
        >
          {soldOut ? (
            ui.soldOut
          ) : justAdded ? (
            <>
              <CheckIcon width={18} height={18} />
              {ui.added}
            </>
          ) : (
            ui.addToCart
          )}
        </Button>
      </div>

      <p className="text-sm text-[var(--color-text-muted)]">
        {soldOut ? ui.outOfStock : ui.shippingNote}
      </p>
    </div>
  );
}
