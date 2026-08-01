#!/usr/bin/env node
// Harvest the live Shopify storefront into local data files.
//
// PHASE 0 of the Cartely rebuild. Pulls real product content — it never
// invents, summarizes, or retypes anything. Run this wherever the store
// host is reachable, then commit the produced data/ directory.
//
//   node scripts/harvest.mjs
//   STORE=cartely-2.myshopify.com node scripts/harvest.mjs
//
// Inside a Claude Code web session the store host must be allow-listed in
// the environment's egress policy first, and Node's built-in fetch must be
// told to honour the proxy:
//
//   NODE_USE_ENV_PROXY=1 node scripts/harvest.mjs
//
// Output:
//   data/catalog.json            every product, verbatim values
//   data/policies/<handle>.html  the five policy pages, main content only
//   data/pages/contact.html      the contact page, main content only
//
// No dependencies — Node 18+ built-in fetch only.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const STORE = process.env.STORE || "cartely-2.myshopify.com";
const BASE = `https://${STORE}`;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const UA =
  "Mozilla/5.0 (cartely-harvest; +https://github.com/diloinvest/DF)";

async function getJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function getText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.text();
}

async function save(relPath, contents) {
  const abs = resolve(ROOT, relPath);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, contents);
  return abs;
}

// Page through /products.json until an empty array comes back. Fall back to
// the collections/all endpoint if the primary one is disabled.
async function fetchAllProducts() {
  const endpoints = [
    (page) => `${BASE}/products.json?limit=250&page=${page}`,
    (page) => `${BASE}/collections/all/products.json?limit=250&page=${page}`,
  ];
  for (const build of endpoints) {
    try {
      const all = [];
      for (let page = 1; page < 1000; page++) {
        const data = await getJson(build(page));
        const batch = Array.isArray(data.products) ? data.products : [];
        if (batch.length === 0) break;
        all.push(...batch);
        process.stdout.write(
          `  fetched page ${page} (${batch.length}) — ${all.length} total\n`
        );
      }
      if (all.length > 0) return all;
    } catch (err) {
      console.warn(`  endpoint failed: ${err.message}`);
    }
  }
  throw new Error(
    "Could not read any products. The JSON endpoints may be disabled — " +
      "generate a Storefront API token and adapt this script, or check that " +
      `${STORE} is reachable / allow-listed.`
  );
}

// Pull the readable body out of a themed Shopify page without a DOM library.
// Prefers the policy/rich-text container, then <main>, then <body>.
function extractMain(html) {
  const patterns = [
    /<div[^>]*class="[^"]*shopify-policy__body[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
    /<div[^>]*class="[^"]*rte[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<body[^>]*>([\s\S]*?)<\/body>/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1].trim().length > 40) return m[1].trim();
  }
  return html;
}

async function fetchPage(path) {
  try {
    return extractMain(await getText(`${BASE}${path}`));
  } catch (err) {
    console.warn(`  page ${path} failed: ${err.message}`);
    return null;
  }
}

function summarize(products) {
  let variants = 0;
  let images = 0;
  let min = Infinity;
  let max = -Infinity;
  for (const p of products) {
    for (const v of p.variants || []) {
      variants++;
      const price = parseFloat(v.price);
      if (Number.isFinite(price)) {
        if (price < min) min = price;
        if (price > max) max = price;
      }
    }
    images += (p.images || []).length;
  }
  return { products: products.length, variants, images, min, max };
}

async function main() {
  console.log(`Harvesting ${BASE} …`);

  const products = await fetchAllProducts();
  await save("data/catalog.json", JSON.stringify({ products }, null, 2));

  const policies = [
    "privacy-policy",
    "contact-information",
    "terms-of-service",
    "refund-policy",
    "shipping-policy",
  ];
  for (const handle of policies) {
    const body = await fetchPage(`/policies/${handle}`);
    if (body != null) await save(`data/policies/${handle}.html`, body);
  }

  const contact = await fetchPage("/pages/contact");
  if (contact != null) await save("data/pages/contact.html", contact);

  const s = summarize(products);
  const fmt = (n) =>
    Number.isFinite(n)
      ? new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
        }).format(n)
      : "n/a";

  console.log("\n──────── HARVEST SUMMARY ────────");
  console.log(`  Products ......... ${s.products}`);
  console.log(`  Variants ......... ${s.variants}`);
  console.log(`  Images ........... ${s.images}`);
  console.log(`  Min price ........ ${fmt(s.min)}`);
  console.log(`  Max price ........ ${fmt(s.max)}`);
  console.log("─────────────────────────────────");
  console.log("Wrote data/catalog.json + data/policies/ + data/pages/.");
}

main().catch((err) => {
  console.error(`\nHarvest failed: ${err.message}`);
  process.exit(1);
});
