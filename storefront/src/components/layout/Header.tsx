"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import {
  BagIcon,
  ChevronDownIcon,
  CloseIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui/Icons";
import { Container } from "@/components/ui/Container";
import { currencies, mainNav, site, ui } from "@/content/site";
import { clsx } from "@/lib/clsx";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { count, open, isHydrated } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, searchOpen]);

  function onSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("q");
    if (typeof value === "string" && value.trim()) {
      // Затваряме тук, а не в ефект по pathname — навигацията е
      // единственият начин панелът да се затвори „сам".
      setSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-header-bg)] text-[var(--color-header-text)]">
      <Container>
        <div className="grid h-[var(--header-height)] grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Ляво: навигация на desktop, хамбургер на mobile */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="-ml-2 rounded p-2 lg:hidden"
              aria-label={ui.menu}
              aria-expanded={menuOpen}
            >
              <MenuIcon />
            </button>

            <nav aria-label="Main" className="hidden lg:block">
              <ul className="flex items-center gap-7">
                {mainNav.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={clsx(
                          "text-sm transition-colors hover:text-[var(--color-header-text)]",
                          active
                            ? "text-[var(--color-header-text)]"
                            : "text-[var(--color-header-muted)]",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Център: логото */}
          <Link
            href="/"
            className="font-heading text-lg font-bold tracking-tight sm:text-xl"
          >
            {site.name}
          </Link>

          {/* Дясно: валута и иконите */}
          <div className="flex items-center justify-end gap-1">
            <CurrencyPicker />

            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="rounded p-2"
              aria-label={ui.search}
              aria-expanded={searchOpen}
            >
              <SearchIcon />
            </button>

            <Link
              href="/pages/contact"
              className="hidden rounded p-2 sm:block"
              aria-label="Account"
            >
              <UserIcon />
            </Link>

            <button
              type="button"
              onClick={open}
              className="relative rounded p-2"
              aria-label={`${ui.cart}${isHydrated && count > 0 ? `, ${count}` : ""}`}
            >
              <BagIcon />
              {isHydrated && count > 0 ? (
                <span className="absolute right-0 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-header-text)] px-1 text-[0.625rem] font-medium text-[var(--color-header-bg)]">
                  {count}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        {searchOpen ? (
          <form
            onSubmit={onSearchSubmit}
            role="search"
            className="border-t border-white/15 py-3"
          >
            <label htmlFor="header-search" className="sr-only">
              {ui.search}
            </label>
            <div className="flex items-center gap-2">
              <SearchIcon className="shrink-0 text-[var(--color-header-muted)]" />
              <input
                id="header-search"
                ref={searchInputRef}
                name="q"
                type="search"
                placeholder={ui.searchPlaceholder}
                className="h-10 w-full bg-transparent text-base text-[var(--color-header-text)] outline-hidden placeholder:text-[var(--color-header-muted)]"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded p-1"
                aria-label={ui.close}
              >
                <CloseIcon />
              </button>
            </div>
          </form>
        ) : null}
      </Container>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}

/**
 * Дисплей на активната валута. Реалната смяна идва от Shopify Markets —
 * докато не е включен, изборът само показва списъка.
 */
function CurrencyPicker() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-1 rounded px-2 py-2 text-sm"
      >
        {site.currencyCode}
        <ChevronDownIcon width={14} height={14} />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label="Currency"
          className="absolute right-0 top-full min-w-24 border border-[var(--color-border)] bg-[var(--color-bg)] py-1 text-[var(--color-text)] shadow-[var(--shadow-overlay)]"
        >
          {currencies.map((code) => (
            <li key={code}>
              <button
                type="button"
                role="option"
                aria-selected={code === site.currencyCode}
                onClick={() => setOpen(false)}
                className={clsx(
                  "w-full px-3 py-1.5 text-left text-sm hover:bg-[var(--color-surface)]",
                  code === site.currencyCode && "font-medium",
                )}
              >
                {code}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label={ui.close}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={ui.menu}
        className="absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col bg-[var(--color-header-bg)] text-[var(--color-header-text)] shadow-[var(--shadow-overlay)] outline-hidden"
      >
        <div className="flex h-[var(--header-height)] items-center justify-between border-b border-white/15 px-5">
          <span className="font-heading text-lg font-bold">{site.name}</span>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 rounded p-2"
            aria-label={ui.close}
          >
            <CloseIcon />
          </button>
        </div>
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto p-5">
          <ul className="space-y-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="block px-3 py-3 text-base hover:bg-white/10"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
