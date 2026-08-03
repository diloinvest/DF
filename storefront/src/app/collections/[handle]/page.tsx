import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionToolbar } from "@/components/collection/CollectionToolbar";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui/Container";
import {
  getCollection,
  getCollections,
  parseSort,
  productTypesOf,
  sortProducts,
} from "@/lib/catalog";

type Props = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ sort?: string; type?: string }>;
};

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((collection) => ({ handle: collection.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const result = await getCollection(handle);
  if (!result) return { title: "Collection not found" };

  return {
    title: result.collection.title,
    description: result.collection.description,
    openGraph: {
      title: result.collection.title,
      description: result.collection.description,
    },
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { handle } = await params;
  const { sort, type } = await searchParams;

  const result = await getCollection(handle);
  if (!result) notFound();

  const { collection, products } = result;
  const productTypes = productTypesOf(products);
  const filtered = type
    ? products.filter((product) => product.productType === type)
    : products;
  const sorted = sortProducts(filtered, parseSort(sort));

  return (
    <Container className="py-10 lg:py-14">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-semibold sm:text-4xl">{collection.title}</h1>
        {collection.description ? (
          <p className="mt-3 text-[var(--color-text-muted)]">
            {collection.description}
          </p>
        ) : null}
      </header>

      <CollectionToolbar productTypes={productTypes} total={sorted.length} />

      <div className="mt-10">
        <ProductGrid products={sorted} priorityCount={4} />
      </div>
    </Container>
  );
}
