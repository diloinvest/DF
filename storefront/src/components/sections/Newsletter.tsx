"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { newsletter } from "@/content/site";

type Status = "idle" | "success" | "error";

export function Newsletter() {
  const [status, setStatus] = useState<Status>("idle");

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    const valid =
      typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

    // Валидацията е реална; изпращането не е — закачи го за твоя ESP тук.
    setStatus(valid ? "success" : "error");
    if (valid) event.currentTarget.reset();
  }

  return (
    <section className="bg-[var(--color-surface)]">
      <Container className="py-14 lg:py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            {newsletter.heading}
          </h2>
          <p className="mt-3 text-[var(--color-text-muted)]">{newsletter.body}</p>

          <form
            onSubmit={onSubmit}
            noValidate
            className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              {newsletter.placeholder}
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={newsletter.placeholder}
              aria-invalid={status === "error"}
              className="h-11 flex-1 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-base outline-hidden placeholder:text-[var(--color-text-muted)]"
            />
            <Button type="submit">{newsletter.buttonLabel}</Button>
          </form>

          <p
            role="status"
            aria-live="polite"
            className="mt-3 min-h-5 text-sm text-[var(--color-text-muted)]"
          >
            {status === "success" ? newsletter.successMessage : null}
            {status === "error" ? newsletter.errorMessage : null}
          </p>

          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {newsletter.disclaimer}
          </p>
        </div>
      </Container>
    </section>
  );
}
