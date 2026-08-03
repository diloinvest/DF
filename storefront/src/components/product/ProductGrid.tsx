import { ui } from "@/content/site";
import { clsx } from "@/lib/clsx";
import type { Product } from "@/lib/types";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";

export function ProductGrid({
  products,
  columns = 4,
  priorityCount = 0,
}: {
  products: Product[];
  columns?: 3 | 4;
  priorityCount?: number;
}) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-[var(--color-text-muted)]">
        {ui.noProducts}
      </p>
    );
  }

  return (
    <ul
      className={clsx(
        "grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6",
        columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
      )}
    >
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
