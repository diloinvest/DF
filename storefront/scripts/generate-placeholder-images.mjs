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

/** Схеми за корпус и циферблат — избират се детерминирано по handle. */
const caseMetals = [
  { name: "steel", light: "#d8dade", mid: "#a8adb4", dark: "#71767d" },
  { name: "rosegold", light: "#e8c3a6", mid: "#c8926b", dark: "#9a6a47" },
  { name: "black", light: "#4a4d52", mid: "#2f3237", dark: "#1b1d20" },
];

const dialColors = [
  { name: "blue", base: "#16305c", rim: "#0d1f3d" },
  { name: "green", base: "#17402c", rim: "#0e2a1c" },
  { name: "black", base: "#1c1c1e", rim: "#0e0e10" },
  { name: "white", base: "#eceae4", rim: "#cfcdc6" },
  { name: "salmon", base: "#d6a08a", rim: "#b57e68" },
];

/**
 * Стилизиран часовник — корпус, циферблат, индекси и стрелки.
 * Оригинална векторна илюстрация, не копие на нечия фотография или
 * на дизайна на конкретна марка.
 */
function watchSvg({ title, handle, index, width = 1000, height = 1250 }) {
  const seed = hash(`${handle}-${index}`);
  const random = rng(seed);
  const tint = tints[hash(handle) % tints.length];
  const metal = caseMetals[hash(handle) % caseMetals.length];
  const dial = dialColors[hash(`${handle}-dial`) % dialColors.length];
  const isLightDial = dial.name === "white" || dial.name === "salmon";
  const handColor = isLightDial ? "#2a2a2a" : "#f2efe8";

  const cx = width / 2;
  const cy = height / 2 - 30;
  const caseR = 250;
  const dialR = caseR - 34;

  // Циферблатът се завърта леко на всяка снимка, за да не са еднакви.
  const rotation = -18 + random() * 36;
  const hourAngle = 300 + random() * 40;
  const minuteAngle = 40 + random() * 60;

  const parts = [];

  // Каишка / гривна — две трапецовидни ленти, изчезващи в кадъра.
  const strapW = 150;
  parts.push(
    `<rect x="${cx - strapW / 2}" y="${cy - caseR - 250}" width="${strapW}" height="290" rx="18" fill="${metal.mid}" opacity="0.55" />`,
    `<rect x="${cx - strapW / 2}" y="${cy + caseR - 40}" width="${strapW}" height="290" rx="18" fill="${metal.mid}" opacity="0.55" />`,
  );

  // Корона отдясно.
  parts.push(
    `<rect x="${cx + caseR - 6}" y="${cy - 26}" width="34" height="52" rx="8" fill="${metal.dark}" />`,
  );

  // Корпус, безел и циферблат.
  parts.push(
    `<circle cx="${cx}" cy="${cy}" r="${caseR}" fill="${metal.mid}" />`,
    `<circle cx="${cx}" cy="${cy}" r="${caseR - 10}" fill="${metal.light}" />`,
    `<circle cx="${cx}" cy="${cy}" r="${caseR - 24}" fill="${metal.dark}" />`,
    `<circle cx="${cx}" cy="${cy}" r="${dialR}" fill="${dial.base}" />`,
    `<circle cx="${cx}" cy="${cy}" r="${dialR}" fill="none" stroke="${dial.rim}" stroke-width="14" opacity="0.6" />`,
  );

  // Индекси на всеки час.
  const indices = [];
  for (let i = 0; i < 12; i += 1) {
    const angle = (i * 30 * Math.PI) / 180;
    const outer = dialR - 22;
    const inner = outer - (i % 3 === 0 ? 48 : 30);
    const x1 = cx + Math.sin(angle) * inner;
    const y1 = cy - Math.cos(angle) * inner;
    const x2 = cx + Math.sin(angle) * outer;
    const y2 = cy - Math.cos(angle) * outer;
    indices.push(
      `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${handColor}" stroke-width="${i % 3 === 0 ? 14 : 8}" stroke-linecap="round" opacity="0.9" />`,
    );
  }
  parts.push(
    `<g transform="rotate(${rotation.toFixed(1)} ${cx} ${cy})">${indices.join("")}</g>`,
  );

  // Стрелки и централна ос.
  parts.push(
    `<g transform="rotate(${hourAngle.toFixed(1)} ${cx} ${cy})"><rect x="${cx - 9}" y="${cy - dialR * 0.52}" width="18" height="${dialR * 0.55}" rx="9" fill="${handColor}" /></g>`,
    `<g transform="rotate(${minuteAngle.toFixed(1)} ${cx} ${cy})"><rect x="${cx - 6}" y="${cy - dialR * 0.78}" width="12" height="${dialR * 0.81}" rx="6" fill="${handColor}" /></g>`,
    `<circle cx="${cx}" cy="${cy}" r="16" fill="${metal.light}" />`,
    `<circle cx="${cx}" cy="${cy}" r="7" fill="${metal.dark}" />`,
  );

  // Отблясък върху стъклото.
  parts.push(
    `<path d="M ${cx - dialR * 0.8} ${cy - dialR * 0.35} A ${dialR} ${dialR} 0 0 1 ${cx + dialR * 0.1} ${cy - dialR * 0.94} L ${cx - dialR * 0.55} ${cy + dialR * 0.2} Z" fill="#ffffff" opacity="0.07" />`,
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escapeXml(title)}">
  <rect width="${width}" height="${height}" fill="${tint}" />
  ${parts.join("\n  ")}
</svg>
`;
}

/** Каишка или калъф — правоъгълни форми, без циферблат. */
function accessorySvg({ title, handle, index, width = 1000, height = 1250 }) {
  const random = rng(hash(`${handle}-${index}`));
  const tint = tints[hash(handle) % tints.length];
  const leather = ["#8a6a4c", "#4a4238", "#b9a58c", "#2f2c28"][
    hash(`${handle}-${index}`) % 4
  ];
  const cx = width / 2;
  const cy = height / 2 - 30;
  const bandW = 190;
  const bandH = 620;
  const tilt = -12 + random() * 24;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escapeXml(title)}">
  <rect width="${width}" height="${height}" fill="${tint}" />
  <g transform="rotate(${tilt.toFixed(1)} ${cx} ${cy})">
    <rect x="${cx - bandW / 2}" y="${cy - bandH / 2}" width="${bandW}" height="${bandH}" rx="26" fill="${leather}" />
    <rect x="${cx - bandW / 2 + 22}" y="${cy - bandH / 2 + 22}" width="${bandW - 44}" height="${bandH - 44}" rx="18" fill="none" stroke="#ffffff" stroke-width="4" stroke-dasharray="14 12" opacity="0.35" />
    <rect x="${cx - 44}" y="${cy - 46}" width="88" height="92" rx="10" fill="none" stroke="${caseMetals[0].light}" stroke-width="12" />
    <line x1="${cx}" y1="${cy - 46}" x2="${cx}" y2="${cy + 46}" stroke="${caseMetals[0].light}" stroke-width="9" />
  </g>
  <ellipse cx="${cx}" cy="${cy + bandH / 2 + 40}" rx="200" ry="26" fill="#000000" opacity="0.08" />
</svg>
`;
}

/**
 * Широкият hero — един едър часовник върху тъмен фон, както в оригинала.
 */
function heroSvg({ label, width = 2400, height = 900 }) {
  const cx = width / 2;
  const cy = height / 2;
  const caseR = 340;
  const dialR = caseR - 40;
  const metal = caseMetals[1]; // rose gold
  const dial = dialColors[0]; // blue
  const hand = "#f2efe8";

  const indices = [];
  for (let i = 0; i < 12; i += 1) {
    const angle = (i * 30 * Math.PI) / 180;
    const outer = dialR - 28;
    const inner = outer - (i % 3 === 0 ? 58 : 38);
    indices.push(
      `<line x1="${(cx + Math.sin(angle) * inner).toFixed(1)}" y1="${(cy - Math.cos(angle) * inner).toFixed(1)}" x2="${(cx + Math.sin(angle) * outer).toFixed(1)}" y2="${(cy - Math.cos(angle) * outer).toFixed(1)}" stroke="${metal.light}" stroke-width="${i % 3 === 0 ? 16 : 9}" stroke-linecap="round" />`,
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escapeXml(label)}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#3a3229" />
      <stop offset="100%" stop-color="#141210" />
    </radialGradient>
    <linearGradient id="dialGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e3f75" />
      <stop offset="100%" stop-color="${dial.rim}" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#glow)" />
  <ellipse cx="${cx}" cy="${cy + caseR + 40}" rx="${caseR * 1.5}" ry="46" fill="#000000" opacity="0.45" />
  <rect x="${cx - 190}" y="0" width="380" height="${cy - caseR + 90}" rx="26" fill="#2a2118" />
  <rect x="${cx - 190}" y="${cy + caseR - 90}" width="380" height="${height - cy - caseR + 90}" rx="26" fill="#2a2118" />
  <rect x="${cx + caseR - 10}" y="${cy - 34}" width="46" height="68" rx="10" fill="${metal.dark}" />
  <circle cx="${cx}" cy="${cy}" r="${caseR}" fill="${metal.mid}" />
  <circle cx="${cx}" cy="${cy}" r="${caseR - 12}" fill="${metal.light}" />
  <circle cx="${cx}" cy="${cy}" r="${caseR - 30}" fill="${metal.dark}" />
  <circle cx="${cx}" cy="${cy}" r="${dialR}" fill="url(#dialGrad)" />
  ${indices.join("\n  ")}
  <circle cx="${cx}" cy="${cy + dialR * 0.45}" r="62" fill="${dial.rim}" />
  <circle cx="${cx}" cy="${cy + dialR * 0.45}" r="62" fill="none" stroke="${metal.light}" stroke-width="7" />
  <circle cx="${cx}" cy="${cy + dialR * 0.45}" r="26" fill="${metal.mid}" opacity="0.7" />
  <g transform="rotate(318 ${cx} ${cy})"><rect x="${cx - 11}" y="${cy - dialR * 0.5}" width="22" height="${dialR * 0.53}" rx="11" fill="${hand}" /></g>
  <g transform="rotate(58 ${cx} ${cy})"><rect x="${cx - 7}" y="${cy - dialR * 0.76}" width="14" height="${dialR * 0.79}" rx="7" fill="${hand}" /></g>
  <circle cx="${cx}" cy="${cy}" r="19" fill="${metal.light}" />
  <path d="M ${cx - dialR * 0.85} ${cy - dialR * 0.3} A ${dialR} ${dialR} 0 0 1 ${cx + dialR * 0.05} ${cy - dialR * 0.95} L ${cx - dialR * 0.6} ${cy + dialR * 0.25} Z" fill="#ffffff" opacity="0.08" />
</svg>
`;
}

/** Работната маса за editorial секцията. */
function benchSvg({ label, width = 1400, height = 1050 }) {
  const random = rng(hash(label));
  const blocks = [];

  for (let i = 0; i < 6; i += 1) {
    const w = 90 + random() * 220;
    const h = 60 + random() * 280;
    const x = random() * (width - w);
    const y = height - h - 120 - random() * 60;
    blocks.push(
      `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" rx="${random() > 0.6 ? 999 : 10}" fill="${tints[Math.floor(random() * tints.length)]}" />`,
    );
  }

  const cx = width * 0.62;
  const cy = height * 0.52;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escapeXml(label)}">
  <rect width="${width}" height="${height}" fill="${palette.bgAlt}" />
  ${blocks.join("\n  ")}
  <circle cx="${cx}" cy="${cy}" r="170" fill="${caseMetals[0].mid}" />
  <circle cx="${cx}" cy="${cy}" r="150" fill="${caseMetals[0].light}" />
  <circle cx="${cx}" cy="${cy}" r="128" fill="${dialColors[2].base}" />
  <circle cx="${cx}" cy="${cy}" r="18" fill="${caseMetals[0].light}" />
  <rect x="0" y="${height - 120}" width="${width}" height="120" fill="${palette.line}" opacity="0.6" />
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
    // Каишките и аксесоарите не са часовници — рисуват се различно.
    const isAccessory = /strap|roll|band|case/.test(seed.handle);

    for (let i = 1; i <= seed.images; i += 1) {
      const draw = isAccessory ? accessorySvg : watchSvg;
      const svg = draw({
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
    heroSvg({ label: "Rose gold automatic watch on a dark surface" }),
  );
  await writeFile(
    join(outDir, "editorial.svg"),
    benchSvg({ label: "Watchmaker's bench with a movement holder" }),
  );

  console.log(
    `Generated ${written} product images for ${seeds.length} products, plus 2 scene images.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
