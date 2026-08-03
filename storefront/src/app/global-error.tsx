"use client";

/**
 * Хваща грешки в самия root layout. Рендира собствен <html>, защото на
 * този етап layout-ът вече е извън играта — затова стиловете са inline.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#ffffff",
          color: "#1a1a1a",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, margin: 0 }}>The shop failed to load</h1>
          <p style={{ color: "#6b6b6b", lineHeight: 1.6 }}>
            Something broke before the page could render. Reloading usually
            clears it.
          </p>
          {error.digest ? (
            <p style={{ color: "#6b6b6b", fontSize: 14 }}>
              Reference: <code>{error.digest}</code>
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16,
              height: 44,
              padding: "0 24px",
              border: "none",
              background: "#1a1a1a",
              color: "#ffffff",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
