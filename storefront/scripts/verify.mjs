/**
 * Проверка на живо: минава целия път до checkout и снима всяка ключова
 * страница на 375px и 1440px.
 *
 *   npm run build && npm run start -- --port 3100
 *   node scripts/verify.mjs
 */

import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const OUT = join(process.cwd(), "verification");

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "desktop", width: 1440, height: 1000 },
];

const PAGES = [
  { name: "home", path: "/" },
  { name: "collection", path: "/collections/all" },
  { name: "product", path: "/products/hallow-stoneware-mug" },
  { name: "search", path: "/search?q=linen" },
  { name: "cart-empty", path: "/cart" },
  { name: "page-about", path: "/pages/about" },
  { name: "not-found", path: "/no-such-page" },
];

const failures = [];
const consoleErrors = [];

function check(label, condition, detail = "") {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
    failures.push(label);
  }
}

async function main() {
  await mkdir(OUT, { recursive: true });
  // Средата има готов Chromium, но с друг build номер от този, който тази
  // версия на Playwright очаква — затова го сочим явно вместо да сваляме нов.
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROMIUM_PATH ??
      (existsSync("/opt/pw-browsers/chromium")
        ? "/opt/pw-browsers/chromium"
        : undefined),
  });

  console.log("\nScreenshots");
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    });
    const page = await context.newPage();
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      // 404 страницата умишлено връща 404 — браузърът логва това като грешка
      // на ресурса, но точно тя е проверяваното поведение.
      if (page.url().includes("/no-such-page")) return;
      consoleErrors.push(`${viewport.name} ${page.url()}: ${message.text()}`);
    });

    for (const target of PAGES) {
      const response = await page.goto(`${BASE}${target.path}`, {
        waitUntil: "networkidle",
      });
      const status = response?.status() ?? 0;
      const expected = target.name === "not-found" ? 404 : 200;
      check(
        `${target.name} @ ${viewport.name} → ${expected}`,
        status === expected,
        `got ${status}`,
      );

      // Скролваме докрай, за да се заредят lazy изображенията — иначе
      // full-page screenshot-ът показва празни кутии под сгъвката.
      await page.evaluate(async () => {
        const step = window.innerHeight;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForLoadState("networkidle");

      // Хоризонтален скрол на body е дефект — проверяваме го, не го гадаем.
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      check(`${target.name} @ ${viewport.name} no horizontal scroll`, !overflows);

      await page.screenshot({
        path: join(OUT, `${target.name}-${viewport.name}.png`),
        fullPage: true,
      });
    }
    await context.close();
  }

  console.log("\nCheckout path");
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(`checkout: ${m.text()}`);
  });

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  check("home loads", await page.locator("h1").first().isVisible());

  await page.getByRole("link", { name: "Shop the collection" }).click();
  await page.waitForURL("**/collections/all");
  check("hero CTA → collection", page.url().includes("/collections/all"));

  await page.locator("article a").first().click();
  await page.waitForURL("**/products/**");
  check("collection → product", page.url().includes("/products/"));

  const optionButtons = page.locator("fieldset button");
  if ((await optionButtons.count()) > 1) {
    await optionButtons.nth(1).click();
    check("variant selectable", true);
  }

  await page.getByLabel("Increase quantity").click();
  check("quantity increments", (await page.getByTestId("quantity").innerText()) === "2");

  await page.getByTestId("add-to-cart").click();
  const drawer = page.getByTestId("cart-drawer");
  await drawer.waitFor({ state: "visible", timeout: 5000 });
  check("cart drawer opens on add", await drawer.isVisible());
  check("drawer shows the line", (await drawer.locator("li").count()) > 0);

  await page.screenshot({
    path: join(OUT, "cart-drawer-desktop.png"),
    fullPage: false,
  });

  await page.getByTestId("checkout-button").first().click();
  await page.waitForTimeout(1500);
  const notice = await drawer.getByRole("status").innerText().catch(() => "");
  check(
    "checkout reports missing Storefront token instead of failing silently",
    notice.includes("SHOPIFY_STOREFRONT_ACCESS_TOKEN"),
    notice || "no status message",
  );

  await page.goto(`${BASE}/cart`, { waitUntil: "networkidle" });
  check("cart persists across navigation", (await page.locator("aside").count()) > 0);
  await page.screenshot({ path: join(OUT, "cart-filled-desktop.png"), fullPage: true });

  await context.close();
  await browser.close();

  console.log("\nConsole errors");
  if (consoleErrors.length === 0) {
    console.log("  ok   none");
  } else {
    for (const error of consoleErrors) console.log(`  FAIL ${error}`);
    failures.push(...consoleErrors);
  }

  console.log(
    `\n${failures.length === 0 ? "PASS" : `FAIL — ${failures.length} problem(s)`}`,
  );
  process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
