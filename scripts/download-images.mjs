#!/usr/bin/env node
// Mirror every catalog image locally so the Shopify CDN can be cut loose.
//
//   node scripts/download-images.mjs
//
// Reads data/catalog.json, downloads each product image into
//   public/products/<handle>/<position>.webp
// and rewrites data/catalog.json so every image `src` points at the local
// path. The original remote URL is preserved on each image as `src_remote`,
// and a full pre-rewrite backup is written to data/catalog.remote.json.
//
// DO NOT RUN THIS as part of the initial rebuild — the live cdn.shopify.com
// URLs are already fast and correct, and next.config whitelists them. Run it
// only when you deliberately want to self-host the images.
//
// True WebP conversion uses `sharp` when it is installed (npm i -D sharp).
// Without sharp the original bytes are saved under the .webp filename and a
// warning is printed — install sharp for real conversion.

import { mkdir, writeFile, readFile, copyFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG = resolve(ROOT, "data/catalog.json");

let sharp = null;
try {
  ({ default: sharp } = await import("sharp"));
} catch {
  console.warn(
    "sharp not installed — saving original bytes as .webp without conversion.\n" +
      "Run `npm i -D sharp` first for real WebP encoding.\n"
  );
}

async function downloadImage(url, absPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(absPath), { recursive: true });
  if (sharp) {
    await sharp(buf).webp({ quality: 82 }).toFile(absPath);
  } else {
    await writeFile(absPath, buf);
  }
}

async function main() {
  const catalog = JSON.parse(await readFile(CATALOG, "utf8"));
  const products = catalog.products || [];

  // Back up the untouched catalog once, before any rewriting.
  await copyFile(CATALOG, resolve(ROOT, "data/catalog.remote.json"));

  let count = 0;
  for (const product of products) {
    const handle = product.handle;
    for (const image of product.images || []) {
      const remote = image.src_remote || image.src;
      if (!remote || !/^https?:\/\//.test(remote)) continue;
      const localRel = `public/products/${handle}/${image.position}.webp`;
      const absPath = resolve(ROOT, localRel);
      try {
        await downloadImage(remote, absPath);
        image.src_remote = remote;
        image.src = `/products/${handle}/${image.position}.webp`;
        count++;
        process.stdout.write(`  ${handle}/${image.position}.webp\n`);
      } catch (err) {
        console.warn(`  skipped ${remote}: ${err.message}`);
      }
    }
  }

  await writeFile(CATALOG, JSON.stringify(catalog, null, 2));
  console.log(`\nMirrored ${count} images into public/products/.`);
  console.log("Rewrote data/catalog.json (backup at data/catalog.remote.json).");
}

main().catch((err) => {
  console.error(`\nImage mirror failed: ${err.message}`);
  process.exit(1);
});
