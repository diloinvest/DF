import { Container } from "@/components/ui/Container";
import { uspIcons, type UspIconName } from "@/components/ui/Icons";
import { usps } from "@/content/site";

export function USPStrip() {
  return (
    <section
      aria-label="Store promises"
      className="border-b border-[var(--color-border)]"
    >
      <Container className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {usps.map((usp) => {
          const Icon = uspIcons[usp.icon as UspIconName];
          return (
            <div key={usp.title} className="flex gap-3">
              <Icon className="mt-0.5 shrink-0 text-[var(--color-text-muted)]" />
              <div>
                <h3 className="text-sm font-medium">{usp.title}</h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {usp.body}
                </p>
              </div>
            </div>
          );
        })}
      </Container>
    </section>
  );
}
