import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ProductGrid, ProductGridSkeleton } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui/Container";
import { ui } from "@/content/site";
import { searchProducts } from "@/lib/catalog";

type Props = { searchParams: Promise<{ q?: string }> };

export const metadata: Metadata = {
  title: ui.search,
  robots: { index: false },
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  return (
    <Container className="py-10 lg:py-14">
      <h1 className="text-3xl font-semibold sm:text-4xl">
        {query ? `Results for “${query}”` : ui.search}
      </h1>

      <div className="mt-8">
        {query ? (
          <Suspense key={query} fallback={<ProductGridSkeleton count={4} />}>
            <SearchResults query={query} />
          </Suspense>
        ) : (
          <p className="text-[var(--color-text-muted)]">
            Type a product name, material, or category in the search box above.
          </p>
        )}
      </div>
    </Container>
  );
}

async function SearchResults({ query }: { query: string }) {
  const products = await searchProducts(query);

  if (products.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-10">
        <p className="text-lg font-medium">
          {ui.searchEmpty} “{query}”
        </p>
        <p className="mt-2 text-[var(--color-text-muted)]">
          {ui.searchEmptyBody}
        </p>
        <Link
          href="/collections/all"
          className="mt-4 inline-block underline underline-offset-4"
        >
          Browse everything
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mb-8 text-sm text-[var(--color-text-muted)]">
        {ui.showing} {products.length} {ui.products}
      </p>
      <ProductGrid products={products} priorityCount={4} />
    </>
  );
}
