import Image from "next/image";

import { ButtonLink } from "@/components/ui/Button";
import { hero, site } from "@/content/site";

/**
 * Пълноширок hero — изображението опира до двата ръба, без контейнер.
 * Оригиналът няма текст върху него; ако сложиш `heading` в site.ts,
 * overlay-ът се появява сам.
 */
export function Hero() {
  const hasOverlay = Boolean(hero.heading || hero.body);

  return (
    <section className="relative h-[58vw] max-h-[520px] min-h-[240px] w-full overflow-hidden">
      {/*
        Hero-то в оригинала е само изображение, но страницата пак ѝ трябва
        h1 — иначе screen reader-ите нямат заглавие на документа. Скрит е
        визуално, не програмно.
      */}
      {hasOverlay ? null : (
        <h1 className="sr-only">
          {site.name} — {site.tagline}
        </h1>
      )}

      <Image
        src={hero.image}
        alt={hero.imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {hasOverlay ? (
        <div className="absolute inset-0 flex items-center bg-black/30">
          <div className="mx-auto w-full max-w-[var(--container)] px-5 sm:px-8">
            <div className="max-w-xl text-white">
              {hero.heading ? (
                <h1 className="text-4xl leading-tight font-bold sm:text-5xl">
                  {hero.heading}
                </h1>
              ) : null}
              {hero.body ? <p className="mt-4 text-lg">{hero.body}</p> : null}
              {hero.cta.label ? (
                <ButtonLink href={hero.cta.href} size="lg" className="mt-7">
                  {hero.cta.label}
                </ButtonLink>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
