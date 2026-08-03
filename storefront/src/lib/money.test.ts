import { describe, expect, it } from "vitest";

import { discountPercent, formatAmount, formatMoney } from "./money";

describe("formatMoney", () => {
  it("renders the currency symbol and two decimals", () => {
    expect(formatMoney({ amount: "445", currencyCode: "EUR" })).toBe("€445.00");
  });

  it("keeps trailing zeros", () => {
    expect(formatMoney({ amount: "42.5", currencyCode: "EUR" })).toBe("€42.50");
  });

  it("handles a zero amount rather than rendering an empty string", () => {
    expect(formatAmount(0, "EUR")).toBe("€0.00");
  });
});

describe("discountPercent", () => {
  const price = { amount: "289", currencyCode: "EUR" };

  it("rounds to the nearest whole percent", () => {
    expect(discountPercent(price, { amount: "359", currencyCode: "EUR" })).toBe(
      19,
    );
  });

  it("returns 0 when there is no compare-at price", () => {
    expect(discountPercent(price, null)).toBe(0);
  });

  it("returns 0 when compare-at is not actually higher", () => {
    expect(discountPercent(price, { amount: "289", currencyCode: "EUR" })).toBe(
      0,
    );
    expect(discountPercent(price, { amount: "100", currencyCode: "EUR" })).toBe(
      0,
    );
  });

  it("does not divide by zero", () => {
    expect(discountPercent(price, { amount: "0", currencyCode: "EUR" })).toBe(0);
  });
});
