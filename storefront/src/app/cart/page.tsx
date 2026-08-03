import type { Metadata } from "next";

import { Container } from "@/components/ui/Container";
import { ui } from "@/content/site";
import { CartPageContent } from "./CartPageContent";

export const metadata: Metadata = {
  title: ui.cart,
  robots: { index: false },
};

export default function CartPage() {
  return (
    <Container className="py-10 lg:py-14">
      <h1 className="mb-8 text-3xl font-semibold sm:text-4xl">{ui.cart}</h1>
      <CartPageContent />
    </Container>
  );
}
