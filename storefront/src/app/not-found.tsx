import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ui } from "@/content/site";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center justify-center py-24 text-center lg:py-32">
      <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
        404
      </p>
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
        {ui.notFoundHeading}
      </h1>
      <p className="mt-4 max-w-md text-[var(--color-text-muted)]">
        {ui.notFoundBody}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">{ui.backHome}</ButtonLink>
        <ButtonLink href="/collections/all" variant="secondary">
          {ui.continueShopping}
        </ButtonLink>
      </div>
    </Container>
  );
}
