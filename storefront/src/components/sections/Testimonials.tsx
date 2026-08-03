import { Container } from "@/components/ui/Container";
import { testimonials } from "@/content/site";

export function Testimonials() {
  return (
    <section className="border-b border-[var(--color-border)]">
      <Container className="py-14 lg:py-20">
        <h2 className="text-2xl font-semibold sm:text-3xl">
          {testimonials.heading}
        </h2>

        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.items.map((item) => (
            <li
              key={item.author}
              className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6"
            >
              <blockquote className="flex-1 text-[var(--color-text)]">
                <p>“{item.quote}”</p>
              </blockquote>
              <footer className="mt-5 text-sm">
                <span className="font-medium">{item.author}</span>
                <span className="text-[var(--color-text-muted)]">
                  {" "}
                  — {item.meta}
                </span>
              </footer>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
