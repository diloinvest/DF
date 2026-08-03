"use client";

import Image from "next/image";
import { useState } from "react";

import { clsx } from "@/lib/clsx";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({
  images,
  title,
}: {
  images: ProductImage[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active];

  if (!current) {
    return (
      <div className="aspect-4/5 rounded-[var(--radius)] bg-[var(--color-surface)]" />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-4/5 overflow-hidden rounded-[var(--radius)] bg-[var(--color-surface)]">
        <Image
          key={current.url}
          src={current.url}
          alt={current.altText}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 ? (
        <ul className="flex gap-3" role="list">
          {images.map((image, index) => (
            <li key={image.url}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show image ${index + 1} of ${images.length} for ${title}`}
                aria-current={index === active}
                className={clsx(
                  "relative h-20 w-16 overflow-hidden rounded-[var(--radius)] bg-[var(--color-surface)] transition-opacity",
                  index === active
                    ? "ring-2 ring-[var(--color-accent)] ring-offset-2"
                    : "opacity-70 hover:opacity-100",
                )}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
