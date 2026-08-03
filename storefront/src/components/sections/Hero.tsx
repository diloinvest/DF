import Image from "next/image";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { hero } from "@/content/site";

export function Hero() {
  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <Container className="grid items-center gap-10 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div className="max-w-xl">
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            {hero.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl leading-[1.08] font-semibold sm:text-5xl lg:text-6xl">
            {hero.heading}
          </h1>
          <p className="mt-5 text-lg text-[var(--color-text-muted)]">
            {hero.body}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={hero.primaryCta.href} size="lg">
              {hero.primaryCta.label}
            </ButtonLink>
            <ButtonLink
              href={hero.secondaryCta.href}
              size="lg"
              variant="secondary"
            >
              {hero.secondaryCta.label}
            </ButtonLink>
          </div>
        </div>

        <div className="relative aspect-4/3 overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface-strong)] lg:aspect-square">
          <Image
            src={hero.image}
            alt={hero.imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </Container>
    </section>
  );
}
