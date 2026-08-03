"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { sortOptions, ui } from "@/content/site";
import { clsx } from "@/lib/clsx";

export function CollectionToolbar({
  productTypes,
  total,
}: {
  productTypes: string[];
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeType = searchParams.get("type") ?? "";
  const activeSort = searchParams.get("sort") ?? "featured";

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const hasFilters = Boolean(activeType) || activeSort !== "featured";

  return (
    <div className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-5">
      {productTypes.length > 1 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="sr-only">{ui.filters}</span>
          <FilterChip
            label="All"
            active={!activeType}
            onClick={() => setParam("type", "")}
          />
          {productTypes.map((type) => (
            <FilterChip
              key={type}
              label={type}
              active={activeType === type}
              onClick={() => setParam("type", activeType === type ? "" : type)}
            />
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--color-text-muted)]">
          {ui.showing} {total} {ui.products}
        </p>

        <div className="flex items-center gap-3">
          {hasFilters ? (
            <button
              type="button"
              onClick={() => router.push(pathname, { scroll: false })}
              className="text-sm underline underline-offset-4"
            >
              {ui.clearFilters}
            </button>
          ) : null}

          <label className="flex items-center gap-2 text-sm">
            <span className="text-[var(--color-text-muted)]">{ui.sortBy}</span>
            <select
              value={activeSort}
              onChange={(event) => setParam("sort", event.target.value)}
              className="h-9 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg)] px-2 text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "h-9 rounded-full border px-4 text-sm transition-colors",
        active
          ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-text)]"
          : "border-[var(--color-border)] hover:bg-[var(--color-surface)]",
      )}
    >
      {label}
    </button>
  );
}
