import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/Container";
import { getPage, getPageHandles } from "@/lib/catalog";

type Props = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  const handles = await getPageHandles();
  return handles.map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const page = await getPage(handle);
  if (!page) return { title: "Page not found" };
  return { title: page.title };
}

export default async function ContentPage({ params }: Props) {
  const { handle } = await params;
  const page = await getPage(handle);
  if (!page) notFound();

  return (
    <Container className="py-12 lg:py-16">
      <article className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold sm:text-4xl">{page.title}</h1>
        <div
          className="prose-storefront mt-8"
          dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
        />
      </article>
    </Container>
  );
}
