/**
 * Генерира SVG изображенията за локалния каталог.
 *
 * Съществува, защото демо магазинът не бива да зависи от външен CDN —
 * всичко се рендира офлайн. Когато включиш Storefront API, снимките идват
 * от cdn.shopify.com и този скрипт става ненужен.
 *
 *   node scripts/generate-placeholder-images.mjs
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "images");

const palette = {
  bg: "#f6f6f4",
  bgAlt: "#ecece8",
  ink: "#1a1a1a",
  muted: "#6b6b6b",
  line: "#d9d9d4",
};

/** Детерминиран hash → еднакъв handle дава винаги едно и също изображение. */
function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function rng(seed) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

const tints = ["#e3e1da", "#dcd9d0", "#e8e4dc", "#d6d8d3", "#e5e0d8", "#dfe1de"];

/**
 * Абстрактна продуктова композиция — концентрични форми в приглушени
 * тонове. Не изобразява реален продукт и не имитира ничия фотография.
 */
function productSvg({ title, handle, index, width = 1000, height = 1250 }) {
  const random = rng(hash(`${handle}-${index}`));
  const tint = tints[hash(handle) % tints.length];
  const cx = width / 2;
  const cy = height / 2 - 40;

  const shapes = [];
  const rings = 2 + Math.floor(random() * 2);
  for (let i = rings; i > 0; i -= 1) {
    const r = 110 + i * (75 + random() * 45);
    // Светли, ниско-контрастни пръстени — фон за продукта, не самият продукт.
    const opacity = (0.05 + i * 0.025).toFixed(3);
    shapes.push(
      `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(0)}" fill="${palette.ink}" opacity="${opacity}" />`,
    );
  }

  const barWidth = 180 + random() * 200;
  const barHeight = 220 + random() * 240;
  shapes.push(
    `<rect x="${(cx - barWidth / 2).toFixed(0)}" y="${(cy - barHeight / 2).toFixed(0)}" width="${barWidth.toFixed(0)}" height="${barHeight.toFixed(0)}" rx="${(20 + random() * 60).toFixed(0)}" fill="#ffffff" opacity="0.55" />`,
  );

  const accentY = cy + barHeight / 2 + 70;
  shapes.push(
    `<rect x="${(cx - 130).toFixed(0)}" y="${accentY.toFixed(0)}" width="260" height="6" rx="3" fill="${palette.ink}" opacity="0.12" />`,
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escapeXml(title)}">
  <rect width="${width}" height="${height}" fill="${tint}" />
  ${shapes.join("\n  ")}
  <text x="${cx}" y="${height - 90}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="34" fill="${palette.muted}">${escapeXml(title)}</text>
  <text x="${cx}" y="${height - 48}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="24" fill="${palette.muted}" opacity="0.7">View ${index}</text>
</svg>
`;
}

function sceneSvg({ label, width = 1400, height = 1050, variant = "hero" }) {
  const random = rng(hash(label));
  const blocks = [];
  const count = variant === "hero" ? 6 : 5;

  for (let i = 0; i < count; i += 1) {
    const w = 140 + random() * 320;
    const h = 140 + random() * 380;
    const x = random() * (width - w);
    const y = height - h - random() * 120;
    const fill = tints[Math.floor(random() * tints.length)];
    const rx = random() > 0.5 ? 999 : 18;
    blocks.push(
      `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" rx="${rx}" fill="${fill}" />`,
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escapeXml(label)}">
  <rect width="${width}" height="${height}" fill="${palette.bgAlt}" />
  ${blocks.join("\n  ")}
  <rect x="0" y="${height - 90}" width="${width}" height="90" fill="${palette.line}" opacity="0.55" />
</svg>
`;
}

function escapeXml(value) {
  return value.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      default:
        return "&quot;";
    }
  });
}

/** Каталогът се чете от TS файла с проста регулярка, за да няма build стъпка. */
async function readCatalogSeeds() {
  const { readFile } = await import("node:fs/promises");
  const file = await readFile(
    join(root, "src", "lib", "data", "catalog.ts"),
    "utf8",
  );

  // Само блокът `const seeds: ProductSeed[] = [ ... ];` — колекциите и
  // страниците по-долу също имат handle/title и иначе се хващат погрешно.
  const start = file.indexOf("const seeds: ProductSeed[] = [");
  const end = file.indexOf("\n];", start);
  if (start === -1 || end === -1) {
    throw new Error("Could not locate the seeds array in catalog.ts");
  }
  const source = file.slice(start, end);

  const seeds = [];
  const blockRegex = /handle:\s*"([^"]+)",\s*\n\s*title:\s*"([^"]+)"/g;
  const imageRegex = /images:\s*(\d+),/g;

  const handles = [...source.matchAll(blockRegex)].map((m) => ({
    handle: m[1],
    title: m[2],
  }));
  const imageCounts = [...source.matchAll(imageRegex)].map((m) => Number(m[1]));

  handles.forEach((entry, i) => {
    seeds.push({ ...entry, images: imageCounts[i] ?? 2 });
  });

  return seeds;
}

async function main() {
  const seeds = await readCatalogSeeds();
  if (seeds.length === 0) {
    throw new Error("No products found in src/lib/data/catalog.ts");
  }

  await mkdir(join(outDir, "products"), { recursive: true });

  let written = 0;
  for (const seed of seeds) {
    for (let i = 1; i <= seed.images; i += 1) {
      const svg = productSvg({
        title: seed.title,
        handle: seed.handle,
        index: i,
      });
      await writeFile(join(outDir, "products", `${seed.handle}-${i}.svg`), svg);
      written += 1;
    }
  }

  await writeFile(
    join(outDir, "hero.svg"),
    sceneSvg({ label: "Ceramic vessels and folded linen", variant: "hero" }),
  );
  await writeFile(
    join(outDir, "editorial.svg"),
    sceneSvg({ label: "Workbench with tools", variant: "editorial" }),
  );

  console.log(
    `Generated ${written} product images for ${seeds.length} products, plus 2 scene images.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
