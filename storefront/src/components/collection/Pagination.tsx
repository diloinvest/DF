import Link from "next/link";

import { clsx } from "@/lib/clsx";

/**
 * Сървърна пагинация — линкове, не бутони, за да работи без JavaScript
 * и да е обхождаема от търсачки.
 */
export function Pagination({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  /** Останалите query параметри, които трябва да се запазят. */
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(target: number) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) query.set(key, value);
    }
    if (target > 1) query.set("page", String(target));
    const suffix = query.toString();
    return suffix ? `${basePath}?${suffix}` : basePath;
  }

  const pages = pageWindow(page, totalPages);

  return (
    <nav aria-label="Pagination" className="mt-12 flex justify-center">
      <ul className="flex items-center gap-1">
        <li>
          <PageLink
            href={hrefFor(page - 1)}
            disabled={page === 1}
            label="Previous page"
          >
            ‹
          </PageLink>
        </li>

        {pages.map((entry, index) =>
          entry === "gap" ? (
            <li
              key={`gap-${index}`}
              aria-hidden="true"
              className="px-2 text-[var(--color-text-muted)]"
            >
              …
            </li>
          ) : (
            <li key={entry}>
              <PageLink
                href={hrefFor(entry)}
                current={entry === page}
                label={`Page ${entry}`}
              >
                {entry}
              </PageLink>
            </li>
          ),
        )}

        <li>
          <PageLink
            href={hrefFor(page + 1)}
            disabled={page === totalPages}
            label="Next page"
          >
            ›
          </PageLink>
        </li>
      </ul>
    </nav>
  );
}

function PageLink({
  href,
  children,
  label,
  current = false,
  disabled = false,
}: {
  href: string;
  children: React.ReactNode;
  label: string;
  current?: boolean;
  disabled?: boolean;
}) {
  const className = clsx(
    "flex h-10 min-w-10 items-center justify-center border px-3 text-sm transition-colors",
    current
      ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-text)]"
      : "border-[var(--color-border)] hover:bg-[var(--color-surface)]",
    disabled && "pointer-events-none opacity-40",
  );

  if (disabled) {
    return (
      <span className={className} aria-disabled="true" aria-label={label}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={current ? "page" : undefined}
      className={className}
    >
      {children}
    </Link>
  );
}

/** 1 … 4 5 [6] 7 8 … 20 — държи лентата с постоянна ширина. */
function pageWindow(page: number, total: number): (number | "gap")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const result: (number | "gap")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);

  if (start > 2) result.push("gap");
  for (let i = start; i <= end; i += 1) result.push(i);
  if (end < total - 1) result.push("gap");

  result.push(total);
  return result;
}
