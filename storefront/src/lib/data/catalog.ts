import { site } from "@/content/site";
import type { Collection, Page, Product, ProductVariant } from "@/lib/types";

/**
 * Локален каталог — резервният източник на данни.
 *
 * Приложението тръгва на този файл, когато няма Shopify Storefront токен,
 * така че магазинът е видим и работещ от първото пускане. Формата съвпада
 * едно към едно с това, което `src/lib/shopify` връща, затова смяната към
 * живи данни не изисква промяна в нито един компонент.
 *
 * Замяна с реални данни:
 *   npm run capture   (виж README) → презаписва този файл от products.json
 */

const CURRENCY = site.currencyCode;

type VariantSeed = {
  options: Record<string, string>;
  price: number;
  compareAt?: number;
  available?: boolean;
};

type ProductSeed = {
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  tags: string[];
  description: string;
  details: string[];
  images: number;
  optionNames: string[];
  variants: VariantSeed[];
  featured?: boolean;
  createdAt: string;
};

function money(amount: number) {
  return { amount: amount.toFixed(2), currencyCode: CURRENCY };
}

function buildProduct(seed: ProductSeed, index: number): Product {
  const variants: ProductVariant[] = seed.variants.map((v, i) => ({
    id: `gid://local/ProductVariant/${index + 1}-${i + 1}`,
    title: Object.values(v.options).join(" / ") || "Default",
    availableForSale: v.available ?? true,
    price: money(v.price),
    compareAtPrice: v.compareAt ? money(v.compareAt) : null,
    selectedOptions: v.options,
  }));

  const prices = variants.map((v) => Number(v.price.amount));
  const compareAt = variants.find((v) => v.compareAtPrice)?.compareAtPrice ?? null;

  const images = Array.from({ length: seed.images }, (_, i) => ({
    url: `/images/products/${seed.handle}-${i + 1}.svg`,
    altText: `${seed.title} — view ${i + 1}`,
    width: 1000,
    height: 1250,
  }));

  const detailsHtml = seed.details.map((d) => `<li>${d}</li>`).join("");

  return {
    id: `gid://local/Product/${index + 1}`,
    handle: seed.handle,
    title: seed.title,
    description: seed.description,
    descriptionHtml: `<p>${seed.description}</p><ul>${detailsHtml}</ul>`,
    productType: seed.productType,
    tags: seed.tags,
    vendor: seed.vendor,
    images,
    options: seed.optionNames.map((name) => ({
      name,
      values: [
        ...new Set(seed.variants.map((v) => v.options[name]).filter(Boolean)),
      ],
    })),
    variants,
    priceRange: { min: money(Math.min(...prices)), max: money(Math.max(...prices)) },
    compareAtPrice: compareAt,
    availableForSale: variants.some((v) => v.availableForSale),
    featured: seed.featured ?? false,
    createdAt: seed.createdAt,
  };
}

const seeds: ProductSeed[] = [
  {
    handle: "meridian-open-heart-automatic",
    title: "Meridian Open Heart Automatic",
    vendor: "Cartely",
    productType: "Automatic",
    tags: ["automatic", "dress", "best-seller", "new"],
    description:
      "A 40mm rose gold-plated case with a cut-away dial showing the balance wheel at six o'clock. Sunray blue dial, applied indices, and a domed sapphire crystal that keeps the reflections honest.",
    details: [
      "Movement: Seagull ST2130 automatic, 41h reserve",
      "Case 40mm, lug-to-lug 47mm, thickness 12.1mm",
      "Sapphire crystal, exhibition caseback",
      "20mm lug width, quick-release leather strap",
      "5 ATM water resistance",
    ],
    images: 3,
    optionNames: ["Strap"],
    variants: [
      { options: { Strap: "Black leather" }, price: 389 },
      { options: { Strap: "Brown leather" }, price: 389 },
      { options: { Strap: "Steel bracelet" }, price: 429, available: false },
    ],
    featured: true,
    createdAt: "2026-07-24",
  },
  {
    handle: "atlas-diver-300",
    title: "Atlas Diver 300",
    vendor: "Cartely",
    productType: "Diver",
    tags: ["diver", "steel", "best-seller", "new"],
    description:
      "A 300m diver with a 120-click unidirectional bezel and a ceramic insert that will not fade the way aluminium does. Lume is BGW9 on the dial and the pip.",
    details: [
      "Movement: NH35A automatic, hacking and hand-winding",
      "Case 41mm, lug-to-lug 47.5mm, thickness 13mm",
      "Ceramic bezel insert, 120-click unidirectional",
      "300m water resistance, screw-down crown",
      "Super-LumiNova BGW9",
    ],
    images: 3,
    optionNames: ["Dial"],
    variants: [
      { options: { Dial: "Forest green" }, price: 445 },
      { options: { Dial: "Midnight blue" }, price: 445 },
      { options: { Dial: "Black" }, price: 445 },
    ],
    featured: true,
    createdAt: "2026-07-29",
  },
  {
    handle: "rally-chronograph",
    title: "Rally Chronograph",
    vendor: "Cartely",
    productType: "Chronograph",
    tags: ["chronograph", "steel", "new"],
    description:
      "A three-register mecaquartz chronograph. The pushers snap the way a mechanical does, and the reset is instant, because the chronograph module is mechanical even though the timekeeping is not.",
    details: [
      "Movement: Seiko VK64 mecaquartz",
      "Case 39mm, lug-to-lug 46mm, thickness 11.8mm",
      "Tachymeter bezel, box-domed sapphire",
      "20mm lug width, drilled lugs",
      "10 ATM water resistance",
    ],
    images: 3,
    optionNames: ["Dial", "Strap"],
    variants: [
      { options: { Dial: "Panda", Strap: "Rally leather" }, price: 329 },
      { options: { Dial: "Panda", Strap: "Steel bracelet" }, price: 359 },
      { options: { Dial: "Reverse panda", Strap: "Rally leather" }, price: 329 },
      {
        options: { Dial: "Reverse panda", Strap: "Steel bracelet" },
        price: 359,
      },
    ],
    featured: true,
    createdAt: "2026-07-30",
  },
  {
    handle: "shard-angular-quartz",
    title: "Shard Angular Quartz",
    vendor: "Cartely",
    productType: "Quartz",
    tags: ["quartz", "sport", "new"],
    description:
      "An asymmetric case in blackened steel with a skeleton dial. Loud on purpose, and light enough at 78 grams that you forget it is on.",
    details: [
      "Movement: Miyota 2035 quartz",
      "Case 44 × 38mm, thickness 12.4mm",
      "Blackened stainless steel, PVD coated",
      "24mm integrated silicone strap",
      "5 ATM water resistance",
    ],
    images: 2,
    optionNames: ["Finish"],
    variants: [
      { options: { Finish: "Matte black" }, price: 149 },
      { options: { Finish: "Gunmetal" }, price: 149 },
    ],
    createdAt: "2026-07-26",
  },
  {
    handle: "field-38-mechanical",
    title: "Field 38 Mechanical",
    vendor: "Cartely",
    productType: "Field",
    tags: ["mechanical", "field", "best-seller"],
    description:
      "A hand-wound field watch with a matte dial and no date window. 38mm, so it sits flat under a cuff, and the lume is thick enough to read at four in the morning.",
    details: [
      "Movement: Seagull ST3600 hand-wound, 46h reserve",
      "Case 38mm, lug-to-lug 45mm, thickness 10.2mm",
      "Matte dial, no date",
      "18mm lug width, canvas or leather",
      "5 ATM water resistance",
    ],
    images: 2,
    optionNames: ["Dial", "Strap"],
    variants: [
      { options: { Dial: "Olive", Strap: "Canvas" }, price: 265 },
      { options: { Dial: "Olive", Strap: "Leather" }, price: 275 },
      { options: { Dial: "Black", Strap: "Canvas" }, price: 265 },
      { options: { Dial: "Black", Strap: "Leather" }, price: 275 },
    ],
    createdAt: "2026-06-18",
  },
  {
    handle: "regent-dress-slim",
    title: "Regent Dress Slim",
    vendor: "Cartely",
    productType: "Dress",
    tags: ["dress", "leather"],
    description:
      "7.9mm thick, which is thin enough to disappear under a shirt cuff. Applied baton indices, a small seconds sub-dial, and nothing else on the dial.",
    details: [
      "Movement: Miyota 9015 automatic, 42h reserve",
      "Case 39mm, lug-to-lug 46mm, thickness 7.9mm",
      "Small seconds at six, no date",
      "19mm lug width, alligator-grain leather",
      "3 ATM water resistance",
    ],
    images: 2,
    optionNames: ["Dial"],
    variants: [
      { options: { Dial: "Silver" }, price: 495 },
      { options: { Dial: "Salmon" }, price: 525 },
      { options: { Dial: "Black" }, price: 495 },
    ],
    createdAt: "2026-06-05",
  },
  {
    handle: "pilot-type-b",
    title: "Pilot Type B",
    vendor: "Cartely",
    productType: "Pilot",
    tags: ["pilot", "automatic", "new"],
    description:
      "A Type B flieger layout — minutes on the outer track, hours inset. 42mm and legible at a glance, which was the entire point of the original spec.",
    details: [
      "Movement: NH38A automatic, exhibition caseback",
      "Case 42mm, lug-to-lug 50mm, thickness 12.6mm",
      "Type B flieger dial, oversized crown",
      "22mm lug width, riveted leather",
      "10 ATM water resistance",
    ],
    images: 2,
    optionNames: ["Case"],
    variants: [
      { options: { Case: "Brushed steel" }, price: 355 },
      { options: { Case: "Sandblasted black" }, price: 375 },
    ],
    createdAt: "2026-07-14",
  },
  {
    handle: "harbor-gmt",
    title: "Harbor GMT",
    vendor: "Cartely",
    productType: "GMT",
    tags: ["gmt", "travel", "steel"],
    description:
      "A true GMT with an independently jumping hour hand, so you can change local time on landing without stopping the movement.",
    details: [
      "Movement: NH34A automatic true GMT",
      "Case 40mm, lug-to-lug 47mm, thickness 12.9mm",
      "24-hour bidirectional bezel, ceramic insert",
      "20mm lug width, oyster-style bracelet",
      "20 ATM water resistance",
    ],
    images: 2,
    optionNames: ["Bezel"],
    variants: [
      { options: { Bezel: "Black / grey" }, price: 585 },
      { options: { Bezel: "Blue / red" }, price: 585 },
      { options: { Bezel: "Black / green" }, price: 585, available: false },
    ],
    createdAt: "2026-05-21",
  },
  {
    handle: "cove-skin-diver",
    title: "Cove Skin Diver",
    vendor: "Cartely",
    productType: "Diver",
    tags: ["diver", "vintage", "sale"],
    description:
      "A 38mm skin diver in the 1960s proportions — thin bezel, domed acrylic, and a case that wears smaller than the spec sheet suggests.",
    details: [
      "Movement: Miyota 8215 automatic",
      "Case 38mm, lug-to-lug 45mm, thickness 11.5mm",
      "Domed hesalite crystal",
      "20mm lug width, tropic rubber",
      "20 ATM water resistance",
    ],
    images: 2,
    optionNames: ["Dial"],
    variants: [
      { options: { Dial: "Gilt black" }, price: 289, compareAt: 359 },
      { options: { Dial: "Cream" }, price: 289, compareAt: 359 },
    ],
    createdAt: "2026-04-16",
  },
  {
    handle: "meridian-moonphase",
    title: "Meridian Moonphase",
    vendor: "Cartely",
    productType: "Dress",
    tags: ["dress", "complication"],
    description:
      "A moonphase at six with a hand-finished disc rather than a printed one. Accurate to a day every 122 years, which is longer than the warranty.",
    details: [
      "Movement: Seagull ST2504 automatic moonphase",
      "Case 40mm, lug-to-lug 47mm, thickness 12.8mm",
      "Guilloché dial, applied Roman indices",
      "20mm lug width, calf leather",
      "3 ATM water resistance",
    ],
    images: 2,
    optionNames: ["Dial"],
    variants: [
      { options: { Dial: "Ivory" }, price: 645 },
      { options: { Dial: "Navy" }, price: 645 },
    ],
    createdAt: "2026-05-08",
  },
  {
    handle: "linen-two-piece-strap",
    title: "Linen Two-Piece Strap",
    vendor: "Cartely",
    productType: "Straps",
    tags: ["strap", "accessories", "sale"],
    description:
      "Woven linen over a leather backing, with quick-release spring bars so you can change it without a tool and without scratching the lugs.",
    details: [
      "Woven linen, vegetable-tanned leather backing",
      "Quick-release spring bars fitted",
      "18, 20 or 22mm",
      "Brushed steel buckle",
      "115/75mm strap lengths",
    ],
    images: 2,
    optionNames: ["Width", "Color"],
    variants: [
      { options: { Width: "18mm", Color: "Sand" }, price: 42, compareAt: 58 },
      { options: { Width: "20mm", Color: "Sand" }, price: 42, compareAt: 58 },
      { options: { Width: "22mm", Color: "Sand" }, price: 42, compareAt: 58 },
      { options: { Width: "18mm", Color: "Charcoal" }, price: 42, compareAt: 58 },
      { options: { Width: "20mm", Color: "Charcoal" }, price: 42, compareAt: 58 },
      { options: { Width: "22mm", Color: "Charcoal" }, price: 42, compareAt: 58 },
    ],
    createdAt: "2026-04-02",
  },
  {
    handle: "travel-watch-roll",
    title: "Travel Watch Roll",
    vendor: "Cartely",
    productType: "Accessories",
    tags: ["accessories", "leather"],
    description:
      "Holds three watches with padded dividers that actually separate them, so bracelets do not mark the case next to them in a bag.",
    details: [
      "Full-grain leather, suede lining",
      "Three padded slots with dividers",
      "Fits up to 46mm cases on bracelets",
      "Elastic closure, no zip to scratch",
      "24 × 9cm rolled",
    ],
    images: 2,
    optionNames: ["Color"],
    variants: [
      { options: { Color: "Tan" }, price: 89 },
      { options: { Color: "Black" }, price: 89 },
    ],
    createdAt: "2026-03-28",
  },
];

export const products: Product[] = seeds.map(buildProduct);

export const collections: Collection[] = [
  {
    id: "gid://local/Collection/1",
    handle: "all",
    title: "Catalog",
    description: "The complete catalogue, most recent first.",
    image: null,
    productHandles: products.map((p) => p.handle),
  },
  {
    id: "gid://local/Collection/2",
    handle: "new-in",
    title: "New in",
    description: "Added this month.",
    image: null,
    productHandles: products
      .filter((p) => p.tags.includes("new"))
      .map((p) => p.handle),
  },
  {
    id: "gid://local/Collection/3",
    handle: "best-sellers",
    title: "Most wanted",
    description: "The references people come back for.",
    image: null,
    productHandles: products
      .filter((p) => p.tags.includes("best-seller"))
      .map((p) => p.handle),
  },
  {
    id: "gid://local/Collection/4",
    handle: "automatics",
    title: "Automatics",
    description: "Self-winding movements, no battery to replace.",
    image: null,
    productHandles: products
      .filter(
        (p) => p.tags.includes("automatic") || p.tags.includes("mechanical"),
      )
      .map((p) => p.handle),
  },
  {
    id: "gid://local/Collection/5",
    handle: "divers",
    title: "Divers",
    description: "200m and up, with a bezel that only turns one way.",
    image: null,
    productHandles: products
      .filter((p) => p.tags.includes("diver"))
      .map((p) => p.handle),
  },
  {
    id: "gid://local/Collection/6",
    handle: "sale",
    title: "Sale",
    description: "Reduced while stock lasts.",
    image: null,
    productHandles: products
      .filter((p) => p.compareAtPrice !== null)
      .map((p) => p.handle),
  },
];

export const pages: Page[] = [
  {
    handle: "about",
    title: "Our standard",
    bodyHtml: `
      <p>Cartely started because buying a mechanical watch under €1000 usually means trusting a spec sheet nobody verified.</p>
      <h2>Every watch is timed before it ships</h2>
      <p>We put each piece on a timegrapher, log the daily rate in six positions, and regulate anything outside spec. The measured rate goes in the box on a printed card, with the date and the initials of whoever did it.</p>
      <h2>The listings say what matters</h2>
      <p>Movement, case diameter, lug-to-lug, thickness, lug width, crystal, and real water resistance. Lug-to-lug is the number that decides whether a watch fits your wrist, and almost nobody publishes it.</p>
      <h2>Servicing stays here</h2>
      <p>Movement work is done in-house in Sofia, not shipped to a third party. A full service is four to six weeks and we quote before touching anything.</p>
    `,
  },
  {
    handle: "shipping",
    title: "Shipping",
    bodyHtml: `
      <p>Orders placed before 14:00 EET ship the same working day.</p>
      <h2>Rates</h2>
      <ul>
        <li>Bulgaria, 1–2 working days — €4, free over €150</li>
        <li>EU standard, 2–4 working days — €9, free over €150</li>
        <li>EU express, next working day — €22</li>
        <li>UK and Switzerland, 3–6 working days — €26 plus duties</li>
      </ul>
      <p>Everything ships tracked and insured for the full order value. You get the tracking number when the label is printed, not when the parcel is scanned.</p>
      <h2>Bracelet sizing</h2>
      <p>Leave your wrist measurement in the order note and we size the bracelet before it goes out. Removed links ship with the watch.</p>
    `,
  },
  {
    handle: "returns",
    title: "Returns",
    bodyHtml: `
      <p>Thirty days from delivery. Unworn, with the box, tags and protective film in place, and we cover the return label.</p>
      <h2>How</h2>
      <p>Email <a href="mailto:hello@cartely.store">hello@cartely.store</a> with your order number. You will get a prepaid label back, usually within a couple of hours during the working week.</p>
      <h2>Warranty claims</h2>
      <p>Two years on the movement and case. No need to return it first — send a photo or a short video of the fault and we will tell you whether it is a service job or a replacement.</p>
      <h2>Sized bracelets</h2>
      <p>Still returnable. We keep the removed links, so send them back with the watch.</p>
    `,
  },
  {
    handle: "contact",
    title: "Contact",
    bodyHtml: `
      <p>Weekdays 9–18 EET. A person answers, and you get their name.</p>
      <ul>
        <li>Email — <a href="mailto:hello@cartely.store">hello@cartely.store</a></li>
        <li>Phone — +359 2 491 0180</li>
        <li>Workshop — bul. Vitosha 24, 1000 Sofia, Bulgaria</li>
      </ul>
      <p>Typical reply time is under four working hours. If it has been longer than a day, the email went astray — send it again.</p>
      <h2>Before you write about sizing</h2>
      <p>Measure the flat width across the top of your wrist in millimetres. That number plus the lug-to-lug in the listing tells you whether it fits, and saves a round trip.</p>
    `,
  },
  {
    handle: "faq",
    title: "FAQ",
    bodyHtml: `
      <h2>Do you restock sold-out references?</h2>
      <p>Usually within four to six weeks. The product page shows the expected date once the batch is booked.</p>
      <h2>What daily rate should I expect?</h2>
      <p>We regulate to within ±10 seconds a day for the NH35 and Miyota movements, and ±7 for the Seagull automatics. The card in the box has the measured figure, not the spec figure.</p>
      <h2>Can you size the bracelet before shipping?</h2>
      <p>Yes, free. Put your wrist measurement in the order note.</p>
      <h2>Is the water resistance tested?</h2>
      <p>Every diver is pressure-tested before it ships. Dress watches are not — 3 ATM means splashes, not swimming, whatever the caseback says.</p>
      <h2>Do you ship outside the EU?</h2>
      <p>UK and Switzerland, yes, with duties payable on arrival. Elsewhere not yet — the return shipping would make the 30-day policy dishonest.</p>
    `,
  },
  {
    handle: "materials",
    title: "Materials",
    bodyHtml: `
      <p>What we do when a watch comes back, and what it costs.</p>
      <h2>Full service</h2>
      <p>Movement stripped, cleaned, lubricated, reassembled and regulated. Gaskets replaced, case pressure-tested. Four to six weeks, €120–€180 depending on the calibre. Quoted before we start.</p>
      <h2>Regulation only</h2>
      <p>If the watch runs but drifts, this is usually all it needs. Two to five working days, €35, free inside the warranty.</p>
      <h2>Crystal and gasket replacement</h2>
      <p>Sapphire and hesalite both stocked for every reference we sell. €45 fitted, including a pressure test.</p>
      <h2>Watches we did not sell you</h2>
      <p>We take them if the calibre is one we stock parts for — the Seiko NH series, Miyota 8 and 9 series, and the Seagull ST movements. Anything else, we will say no rather than guess.</p>
    `,
  },
  {
    handle: "privacy",
    title: "Privacy",
    bodyHtml: `
      <p>We collect what an order needs and nothing beyond it: name, address, email, and what you bought.</p>
      <h2>We do not</h2>
      <ul>
        <li>Sell or share your details with anyone outside fulfilment</li>
        <li>Run advertising trackers on this site</li>
        <li>Email you unless you asked us to</li>
      </ul>
      <h2>Deleting your data</h2>
      <p>Email us and it is gone within seven days, apart from what tax law requires us to keep on invoices.</p>
    `,
  },
  {
    handle: "terms",
    title: "Terms",
    bodyHtml: `
      <p>Plain version: buy a thing, we ship it, and if it is wrong we fix it.</p>
      <h2>Orders</h2>
      <p>A confirmation email is an acknowledgement, not acceptance. If something is mispriced or out of stock we will tell you and refund in full before shipping.</p>
      <h2>Pricing</h2>
      <p>Prices are in EUR and include Bulgarian VAT. For deliveries outside the EU, VAT is deducted at checkout and local duties become payable on arrival.</p>
      <h2>Liability</h2>
      <p>Our liability is limited to the value of the order. Nothing here affects your statutory rights.</p>
    `,
  },
];
