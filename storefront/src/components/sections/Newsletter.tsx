"use client";

import { useState } from "react";

import { subscribe } from "@/app/actions/newsletter";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { newsletter } from "@/content/site";

type Status = "idle" | "pending" | "success" | "error";

export function Newsletter() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get("email");

    if (typeof email !== "string") return;

    setStatus("pending");
    const result = await subscribe(email);

    if (result.ok) {
      setStatus("success");
      setMessage(newsletter.successMessage);
      form.reset();
      return;
    }

    setStatus("error");
    setMessage(result.message);
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
            <Button type="submit" disabled={status === "pending"}>
              {status === "pending" ? "…" : newsletter.buttonLabel}
            </Button>
          </form>

          <p
            role="status"
            aria-live="polite"
            className="mt-3 min-h-5 text-sm text-[var(--color-text-muted)]"
          >
            {status === "success" || status === "error" ? message : null}
          </p>

          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {newsletter.disclaimer}
          </p>
        </div>
      </Container>
    </section>
  );
}
