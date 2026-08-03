import { CollectionSection } from "@/components/sections/CollectionSection";
import { Editorial } from "@/components/sections/Editorial";
import { Hero } from "@/components/sections/Hero";
import { Newsletter } from "@/components/sections/Newsletter";
import { Testimonials } from "@/components/sections/Testimonials";
import { USPStrip } from "@/components/sections/USPStrip";
import { bestSellers, featuredCollection, homeSections } from "@/content/site";
import { getCollectionProducts } from "@/lib/catalog";

export default async function HomePage() {
  const [featuredProducts, bestSellerProducts] = await Promise.all([
    getCollectionProducts(featuredCollection.handle),
    getCollectionProducts(bestSellers.handle),
  ]);

  // Редът идва от content/site.ts — размества се там, не тук.
  const sections: Record<(typeof homeSections)[number], React.ReactNode> = {
    hero: <Hero key="hero" />,
    usps: <USPStrip key="usps" />,
    featured: (
      <CollectionSection
        key="featured"
        heading={featuredCollection.heading}
        body={featuredCollection.body}
        href={`/collections/${featuredCollection.handle}`}
        ctaLabel={featuredCollection.ctaLabel}
        products={featuredProducts}
        priorityCount={2}
      />
    ),
    editorial: <Editorial key="editorial" />,
    bestSellers: (
      <CollectionSection
        key="best-sellers"
        heading={bestSellers.heading}
        body={bestSellers.body}
        href={`/collections/${bestSellers.handle}`}
        ctaLabel={bestSellers.ctaLabel}
        products={bestSellerProducts}
      />
    ),
    testimonials: <Testimonials key="testimonials" />,
    newsletter: <Newsletter key="newsletter" />,
  };

  return <>{homeSections.map((name) => sections[name])}</>;
}
