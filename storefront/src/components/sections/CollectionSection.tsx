import Link from "next/link";

import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon } from "@/components/ui/Icons";
import type { Product } from "@/lib/types";

export function CollectionSection({
  heading,
  body,
  href,
  ctaLabel,
  products,
  priorityCount = 0,
}: {
  heading: string;
  body?: string;
  href: string;
  ctaLabel: string;
  products: Product[];
  priorityCount?: number;
}) {
  if (products.length === 0) return null;

  return (
    <section className="border-b border-[var(--color-border)]">
      <Container className="py-14 lg:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold sm:text-3xl">{heading}</h2>
            {body ? (
              <p className="mt-2 text-[var(--color-text-muted)]">{body}</p>
            ) : null}
          </div>
          <Link
            href={href}
            className="group inline-flex items-center gap-1.5 text-sm underline underline-offset-4"
          >
            {ctaLabel}
            <ArrowRightIcon
              width={16}
              height={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        <ProductGrid products={products.slice(0, 4)} priorityCount={priorityCount} />
      </Container>
    </section>
  );
}
