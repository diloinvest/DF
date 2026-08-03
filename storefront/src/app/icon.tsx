import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Инициалът на магазина върху тъмния фон от header-а. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1c1c1c",
          color: "#ffffff",
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        C
      </div>
    ),
    size,
  );
}
