import Image from "next/image";
import Link from "next/link";

import { ui } from "@/content/site";
import { clsx } from "@/lib/clsx";
import { discountPercent, formatMoney } from "@/lib/money";
import type { Product } from "@/lib/types";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const image = product.images[0];
  const hoverImage = product.images[1];
  const price = product.priceRange.min;
  const discount = discountPercent(price, product.compareAtPrice);
  const isNew = product.tags.includes("new");
  const rangeEnd =
    product.priceRange.max.amount !== price.amount
      ? product.priceRange.max
      : null;

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-4/5 overflow-hidden rounded-[var(--radius)] bg-[var(--color-surface)]">
        {image ? (
          <>
            <Image
              src={image.url}
              alt={image.altText}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              priority={priority}
              className={clsx(
                "object-cover transition-opacity duration-300",
                hoverImage && "group-hover:opacity-0",
              )}
            />
            {hoverImage ? (
              <Image
                src={hoverImage.url}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            ) : null}
          </>
        ) : null}

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {discount > 0 ? (
            <span className="rounded-[var(--radius)] bg-[var(--color-sale)] px-2 py-1 text-xs font-medium text-white">
              −{discount}%
            </span>
          ) : null}
          {isNew && discount === 0 ? (
            <span className="rounded-[var(--radius)] bg-[var(--color-accent)] px-2 py-1 text-xs font-medium text-[var(--color-accent-text)]">
              {ui.new}
            </span>
          ) : null}
        </div>

        {!product.availableForSale ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg)]/70">
            <span className="text-sm font-medium uppercase tracking-wide">
              {ui.soldOut}
            </span>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1">
        {/* Продуктовите заглавия са на body шрифта — серифът е за секциите. */}
        <h3 className="font-[family-name:var(--font-body)] text-[0.95rem] leading-snug font-medium">
          <Link href={`/products/${product.handle}`} className="after:absolute after:inset-0">
            {product.title}
          </Link>
        </h3>
        <p className="text-sm text-[var(--color-text-muted)]">
          {product.productType}
        </p>
        <p className="mt-1 flex items-baseline gap-2 text-[0.95rem]">
          <span className={clsx(discount > 0 && "text-[var(--color-sale)]")}>
            {formatMoney(price)}
            {rangeEnd ? ` – ${formatMoney(rangeEnd)}` : ""}
          </span>
          {product.compareAtPrice ? (
            <span className="text-sm text-[var(--color-text-muted)] line-through">
              {formatMoney(product.compareAtPrice)}
            </span>
          ) : null}
        </p>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col" aria-hidden="true">
      <div className="aspect-4/5 animate-pulse rounded-[var(--radius)] bg-[var(--color-surface)]" />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--color-surface)]" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-[var(--color-surface)]" />
        <div className="h-4 w-1/4 animate-pulse rounded bg-[var(--color-surface)]" />
      </div>
    </div>
  );
}
