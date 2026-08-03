import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { Container } from "@/components/ui/Container";
import { site, ui } from "@/content/site";
import { getAllProducts, getProduct, getRelatedProducts } from "@/lib/catalog";
import type { Product } from "@/lib/types";

type Props = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({ handle: product.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return { title: "Product not found" };

  return {
    title: product.title,
    description: product.description.slice(0, 160),
    openGraph: {
      type: "website",
      title: product.title,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    sku: product.variants[0]?.id,
    brand: { "@type": "Brand", name: product.vendor || site.name },
    image: product.images.map((image) => image.url),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: product.priceRange.min.currencyCode,
      lowPrice: product.priceRange.min.amount,
      highPrice: product.priceRange.max.amount,
      offerCount: product.variants.length,
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD е статичен и се сериализира от нашите данни, не от вход на потребителя.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />

      <Container className="py-8 lg:py-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm">
          <ol className="flex flex-wrap items-center gap-1.5 text-[var(--color-text-muted)]">
            <li>
              <Link href="/" className="hover:text-[var(--color-text)]">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/collections/all"
                className="hover:text-[var(--color-text)]"
              >
                Shop all
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-[var(--color-text)]">
              {product.title}
            </li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} title={product.title} />

          <div className="lg:pt-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              {product.productType}
            </p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
              {product.title}
            </h1>

            <div className="mt-7">
              <ProductPurchase product={product} />
            </div>

            <div className="mt-10 border-t border-[var(--color-border)] pt-8">
              <h2 className="text-sm font-medium uppercase tracking-wide">
                {ui.description}
              </h2>
              <div
                className="prose-storefront mt-4"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            </div>
          </div>
        </div>
      </Container>

      {related.length > 0 ? (
        <section className="border-t border-[var(--color-border)]">
          <Container className="py-14">
            <h2 className="mb-8 text-2xl font-semibold">{ui.relatedProducts}</h2>
            <ProductGrid products={related} />
          </Container>
        </section>
      ) : null}
    </>
  );
}
