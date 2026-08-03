import Image from "next/image";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { editorial } from "@/content/site";

export function Editorial() {
  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <Container className="grid items-center gap-10 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div className="relative aspect-4/3 overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface-strong)]">
          <Image
            src={editorial.image}
            alt={editorial.imageAlt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="max-w-xl">
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            {editorial.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl leading-tight font-semibold sm:text-4xl">
            {editorial.heading}
          </h2>
          <p className="mt-5 text-[var(--color-text-muted)]">{editorial.body}</p>
          <ButtonLink
            href={editorial.cta.href}
            variant="secondary"
            className="mt-7"
          >
            {editorial.cta.label}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
