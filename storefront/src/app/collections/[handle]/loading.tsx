import { ProductGridSkeleton } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui/Container";

export default function CollectionLoading() {
  return (
    <Container className="py-10 lg:py-14">
      <div className="mb-8 space-y-3" aria-hidden="true">
        <div className="h-9 w-64 animate-pulse rounded bg-[var(--color-surface)]" />
        <div className="h-5 w-96 max-w-full animate-pulse rounded bg-[var(--color-surface)]" />
      </div>
      <div className="mb-10 h-16 animate-pulse rounded bg-[var(--color-surface)]" />
      <ProductGridSkeleton />
    </Container>
  );
}
