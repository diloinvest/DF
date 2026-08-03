import type { Money } from "./types";

const LOCALE = "en-US";

export function formatMoney(money: Money): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: money.currencyCode,
    minimumFractionDigits: 2,
  }).format(Number(money.amount));
}

export function formatAmount(amount: number, currencyCode: string): string {
  return formatMoney({ amount: String(amount), currencyCode });
}

export function discountPercent(price: Money, compareAt: Money | null): number {
  if (!compareAt) return 0;
  const from = Number(compareAt.amount);
  const to = Number(price.amount);
  if (!Number.isFinite(from) || from <= to || from === 0) return 0;
  return Math.round(((from - to) / from) * 100);
}
