"use server";

export type SubscribeResult =
  | { ok: true }
  | { ok: false; message: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Записване за бюлетина.
 *
 * Валидацията и мрежовата заявка са реални. Доставчикът е нарочно
 * незададен — сложи `NEWSLETTER_ENDPOINT` (и по избор `NEWSLETTER_API_KEY`)
 * и формата тръгва към твоя ESP без промяна в код. Без endpoint записът
 * се логва и се връща успех, за да не блокира разработката.
 */
export async function subscribe(email: string): Promise<SubscribeResult> {
  const value = email.trim().toLowerCase();

  if (!EMAIL.test(value)) {
    return { ok: false, message: "That email doesn't look right." };
  }

  const endpoint = process.env.NEWSLETTER_ENDPOINT;
  if (!endpoint) {
    console.info("[newsletter] no NEWSLETTER_ENDPOINT set, skipping:", value);
    return { ok: true };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.NEWSLETTER_API_KEY
          ? { Authorization: `Bearer ${process.env.NEWSLETTER_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({ email: value }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[newsletter] provider responded", response.status);
      return {
        ok: false,
        message: "We couldn't sign you up just now. Try again in a minute.",
      };
    }

    return { ok: true };
  } catch (error) {
    console.error("[newsletter] request failed:", error);
    return {
      ok: false,
      message: "We couldn't reach the mailing list. Try again in a minute.",
    };
  }
}
