"use client";

import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Закачи тук Sentry или каквото ползваш — засега поне не се губи тихо.
    console.error("[storefront] unhandled error:", error);
  }, [error]);

  return (
    <Container className="flex flex-col items-center justify-center py-24 text-center lg:py-32">
      <h1 className="text-3xl font-bold sm:text-4xl">Something went wrong</h1>
      <p className="mt-4 max-w-md text-[var(--color-text-muted)]">
        The page failed to load. Trying again usually works — if it does not,
        the shop is having a bad minute and we are on it.
      </p>
      {error.digest ? (
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">
          Reference: <code>{error.digest}</code>
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">
          Back to home
        </ButtonLink>
      </div>
    </Container>
  );
}
