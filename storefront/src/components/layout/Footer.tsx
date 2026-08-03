import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { footer, site } from "@/content/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)]">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <p className="text-lg font-semibold">{site.name}</p>
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
              {footer.blurb}
            </p>
            <address className="mt-4 space-y-1 text-sm not-italic text-[var(--color-text-muted)]">
              <p>
                <a
                  href={`mailto:${site.email}`}
                  className="underline underline-offset-4"
                >
                  {site.email}
                </a>
              </p>
              <p>{site.phone}</p>
            </address>
          </div>

          {footer.columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="text-sm font-medium">{column.heading}</h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col-reverse gap-4 border-t border-[var(--color-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--color-text-muted)]">
            {footer.copyright}
          </p>
          <ul className="flex flex-wrap gap-2" aria-label="Accepted payment methods">
            {footer.paymentMethods.map((method) => (
              <li
                key={method}
                className="rounded-[var(--radius)] border border-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-text-muted)]"
              >
                {method}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
