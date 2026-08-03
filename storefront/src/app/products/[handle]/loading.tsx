import { Container } from "@/components/ui/Container";

export default function ProductLoading() {
  return (
    <Container className="py-8 lg:py-12" aria-hidden="true">
      <div className="mb-6 h-5 w-64 animate-pulse rounded bg-[var(--color-surface)]" />
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="aspect-4/5 animate-pulse bg-[var(--color-surface)]" />
        <div className="space-y-5 lg:pt-4">
          <div className="h-4 w-24 animate-pulse rounded bg-[var(--color-surface)]" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-[var(--color-surface)]" />
          <div className="h-8 w-32 animate-pulse rounded bg-[var(--color-surface)]" />
          <div className="h-10 w-56 animate-pulse rounded bg-[var(--color-surface)]" />
          <div className="h-13 w-full animate-pulse rounded bg-[var(--color-surface)]" />
          <div className="space-y-2 pt-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-4 w-full animate-pulse rounded bg-[var(--color-surface)]"
              />
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
