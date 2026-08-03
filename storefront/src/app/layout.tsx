import type { Metadata } from "next";

import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { announcement, site } from "@/content/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cartely.store"),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={site.locale} className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[var(--color-accent)] focus:px-4 focus:py-2 focus:text-[var(--color-accent-text)]"
          >
            Skip to content
          </a>

          {announcement.enabled ? (
            <div className="bg-[var(--color-accent)] text-[var(--color-accent-text)]">
              <p className="mx-auto flex max-w-[var(--container)] flex-wrap items-center justify-center gap-2 px-5 py-2.5 text-center text-sm">
                {announcement.text}
                <a
                  href={announcement.linkHref}
                  className="underline underline-offset-4"
                >
                  {announcement.linkLabel}
                </a>
              </p>
            </div>
          ) : null}

          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
