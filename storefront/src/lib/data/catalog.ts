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
    handle: "hallow-stoneware-mug",
    title: "Hallow Stoneware Mug",
    vendor: "Cartely",
    productType: "Drinkware",
    tags: ["ceramic", "kitchen", "best-seller"],
    description:
      "A 340ml stoneware mug with an unglazed foot and a handle sized for a whole hand, not two fingers. Fired twice at 1240°C, so the body stays non-porous even after the glaze wears.",
    details: [
      "340ml / 11.5oz capacity",
      "Dishwasher and microwave safe",
      "Unglazed foot ring, matte exterior",
      "Thrown in Stoke-on-Trent, UK",
    ],
    images: 3,
    optionNames: ["Color"],
    variants: [
      { options: { Color: "Chalk" }, price: 28 },
      { options: { Color: "Clay" }, price: 28 },
      { options: { Color: "Moss" }, price: 28, available: false },
    ],
    featured: true,
    createdAt: "2026-07-02",
  },
  {
    handle: "field-linen-throw",
    title: "Field Linen Throw",
    vendor: "Cartely",
    productType: "Textiles",
    tags: ["linen", "home", "best-seller"],
    description:
      "Stonewashed European flax, 140 × 200cm, with a hand-knotted fringe. Heavy enough to stay put on a sofa arm and it softens noticeably over the first ten washes.",
    details: [
      "100% European flax linen, 260gsm",
      "140 × 200cm",
      "Machine wash cold, line dry",
      "Woven in Lithuania",
    ],
    images: 3,
    optionNames: ["Color"],
    variants: [
      { options: { Color: "Oat" }, price: 145, compareAt: 180 },
      { options: { Color: "Slate" }, price: 145, compareAt: 180 },
    ],
    featured: true,
    createdAt: "2026-07-11",
  },
  {
    handle: "arc-desk-lamp",
    title: "Arc Desk Lamp",
    vendor: "Cartely",
    productType: "Lighting",
    tags: ["desk", "lighting", "new"],
    description:
      "A counterweighted task lamp in powder-coated steel. The arm holds position without a spring, so there is nothing inside to lose tension in five years.",
    details: [
      "Powder-coated steel, cast iron base",
      "E27 fitting, bulb not included",
      "Reach 62cm, height 48cm",
      "Replaceable cord and switch",
    ],
    images: 3,
    optionNames: ["Color"],
    variants: [
      { options: { Color: "Black" }, price: 210 },
      { options: { Color: "Sand" }, price: 210 },
    ],
    featured: true,
    createdAt: "2026-07-20",
  },
  {
    handle: "kerf-oak-tray",
    title: "Kerf Oak Tray",
    vendor: "Cartely",
    productType: "Kitchen",
    tags: ["wood", "kitchen", "new"],
    description:
      "Solid white oak, cut from a single board so the grain runs unbroken across the base. Finished with hardwax oil you can top up yourself instead of sending it away.",
    details: [
      "Solid white oak, hardwax oil finish",
      "38 × 24 × 3cm",
      "Hand wash only",
      "Made in Denmark",
    ],
    images: 2,
    optionNames: ["Size"],
    variants: [
      { options: { Size: "Small" }, price: 68 },
      { options: { Size: "Large" }, price: 92 },
    ],
    createdAt: "2026-07-18",
  },
  {
    handle: "plane-notebook",
    title: "Plane Notebook",
    vendor: "Cartely",
    productType: "Desk",
    tags: ["paper", "desk", "new"],
    description:
      "A 192-page notebook that opens flat because it is section-sewn, not glued. 100gsm uncoated stock that takes fountain ink without ghosting.",
    details: [
      "192 pages, 100gsm uncoated",
      "A5, section-sewn binding",
      "Ruled or dot grid",
      "Printed in Italy",
    ],
    images: 2,
    optionNames: ["Ruling", "Color"],
    variants: [
      { options: { Ruling: "Ruled", Color: "Ink" }, price: 24 },
      { options: { Ruling: "Ruled", Color: "Bone" }, price: 24 },
      { options: { Ruling: "Dot grid", Color: "Ink" }, price: 24 },
      { options: { Ruling: "Dot grid", Color: "Bone" }, price: 24, available: false },
    ],
    createdAt: "2026-07-25",
  },
  {
    handle: "column-vase",
    title: "Column Vase",
    vendor: "Cartely",
    productType: "Ceramics",
    tags: ["ceramic", "home"],
    description:
      "A straight-sided vase with a narrow neck that holds a loose stem upright instead of letting it slump against the rim.",
    details: [
      "Glazed stoneware",
      "H 26cm, Ø 9cm",
      "Watertight, no liner needed",
      "Each piece varies slightly",
    ],
    images: 2,
    optionNames: ["Color"],
    variants: [
      { options: { Color: "Chalk" }, price: 54 },
      { options: { Color: "Clay" }, price: 54 },
    ],
    createdAt: "2026-06-14",
  },
  {
    handle: "twill-apron",
    title: "Twill Apron",
    vendor: "Cartely",
    productType: "Kitchen",
    tags: ["cotton", "kitchen", "best-seller"],
    description:
      "Heavy cotton twill with riveted stress points and a neck strap that adjusts from both sides, so it sits level whichever way you tie it.",
    details: [
      "340gsm cotton twill",
      "Copper rivets, adjustable neck",
      "Two front pockets, one pen slot",
      "Machine wash warm",
    ],
    images: 2,
    optionNames: ["Size", "Color"],
    variants: [
      { options: { Size: "One size", Color: "Indigo" }, price: 62 },
      { options: { Size: "One size", Color: "Olive" }, price: 62 },
      { options: { Size: "One size", Color: "Charcoal" }, price: 62 },
    ],
    createdAt: "2026-05-30",
  },
  {
    handle: "brass-bottle-opener",
    title: "Brass Bottle Opener",
    vendor: "Cartely",
    productType: "Kitchen",
    tags: ["brass", "kitchen", "sale"],
    description:
      "Machined from a single billet of brass. Heavy in the hand, and it develops a patina that maps wherever you hold it.",
    details: [
      "Solid brass, 118g",
      "11cm long",
      "Unlacquered — will patina",
      "Machined in Sheffield, UK",
    ],
    images: 2,
    optionNames: ["Finish"],
    variants: [
      { options: { Finish: "Raw brass" }, price: 26, compareAt: 38 },
      { options: { Finish: "Brushed" }, price: 26, compareAt: 38 },
    ],
    createdAt: "2026-04-08",
  },
  {
    handle: "stack-storage-box",
    title: "Stack Storage Box",
    vendor: "Cartely",
    productType: "Storage",
    tags: ["desk", "storage"],
    description:
      "Recycled polypropylene boxes with a lid that locks flush when stacked, so a column of four does not slide apart when you pull the bottom one.",
    details: [
      "80% recycled polypropylene",
      "Three sizes, all stack together",
      "Lid included",
      "Made in the Netherlands",
    ],
    images: 2,
    optionNames: ["Size", "Color"],
    variants: [
      { options: { Size: "S", Color: "Bone" }, price: 22 },
      { options: { Size: "M", Color: "Bone" }, price: 32 },
      { options: { Size: "L", Color: "Bone" }, price: 44 },
      { options: { Size: "S", Color: "Slate" }, price: 22 },
      { options: { Size: "M", Color: "Slate" }, price: 32 },
      { options: { Size: "L", Color: "Slate" }, price: 44 },
    ],
    createdAt: "2026-06-02",
  },
  {
    handle: "grid-wall-shelf",
    title: "Grid Wall Shelf",
    vendor: "Cartely",
    productType: "Furniture",
    tags: ["steel", "home", "new"],
    description:
      "A powder-coated steel shelf that mounts on two points and carries 15kg. Ships flat with the fixings for masonry and plasterboard both in the box.",
    details: [
      "Powder-coated steel, 15kg load",
      "60 × 18cm",
      "Fixings for masonry and plasterboard",
      "Flat-packed, two-bolt mount",
    ],
    images: 2,
    optionNames: ["Color"],
    variants: [
      { options: { Color: "Black" }, price: 118 },
      { options: { Color: "Bone" }, price: 118 },
    ],
    createdAt: "2026-07-28",
  },
  {
    handle: "everyday-tumbler",
    title: "Everyday Tumbler",
    vendor: "Cartely",
    productType: "Drinkware",
    tags: ["glass", "kitchen", "best-seller"],
    description:
      "Pressed glass with a thick base that survives being set down hard. Sold in fours because one always goes missing.",
    details: [
      "Set of four, 280ml each",
      "Pressed soda-lime glass",
      "Dishwasher safe, stackable",
      "Made in Portugal",
    ],
    images: 2,
    optionNames: ["Set"],
    variants: [
      { options: { Set: "Set of 4" }, price: 42 },
      { options: { Set: "Set of 8" }, price: 76 },
    ],
    createdAt: "2026-05-12",
  },
  {
    handle: "carry-canvas-tote",
    title: "Carry Canvas Tote",
    vendor: "Cartely",
    productType: "Accessories",
    tags: ["cotton", "accessories", "sale"],
    description:
      "18oz canvas with boxed corners and webbing straps that run the full depth of the bag rather than being stitched to the rim.",
    details: [
      "18oz cotton canvas",
      "42 × 38 × 14cm, boxed base",
      "Full-length webbing straps",
      "Inner pocket with key clip",
    ],
    images: 2,
    optionNames: ["Color"],
    variants: [
      { options: { Color: "Natural" }, price: 38, compareAt: 52 },
      { options: { Color: "Charcoal" }, price: 38, compareAt: 52 },
    ],
    createdAt: "2026-04-22",
  },
];

export const products: Product[] = seeds.map(buildProduct);

export const collections: Collection[] = [
  {
    id: "gid://local/Collection/1",
    handle: "all",
    title: "Shop all",
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
    title: "Most reordered",
    description: "The things people come back for.",
    image: null,
    productHandles: products
      .filter((p) => p.tags.includes("best-seller"))
      .map((p) => p.handle),
  },
  {
    id: "gid://local/Collection/4",
    handle: "home",
    title: "Home",
    description: "For the rooms you actually sit in.",
    image: null,
    productHandles: products
      .filter((p) => p.tags.includes("home") || p.tags.includes("kitchen"))
      .map((p) => p.handle),
  },
  {
    id: "gid://local/Collection/5",
    handle: "desk",
    title: "Desk",
    description: "Where the working day happens.",
    image: null,
    productHandles: products
      .filter((p) => p.tags.includes("desk"))
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
      <p>Cartely started because we kept buying the same category of object twice — once cheap, once properly — and got tired of the first purchase.</p>
      <p>Every product listed here has been used by someone on the team for at least three months before it goes live. Not photographed, not unboxed: used. If it chips, wobbles, fades, or quietly annoys, it does not make the catalogue.</p>
      <h2>Why the catalogue is small</h2>
      <p>About a hundred products, and that is the ceiling. A larger range would mean listing things we have not lived with, which is the whole thing we are trying to avoid.</p>
      <h2>Repair before replacement</h2>
      <p>We keep spares for anything with a moving part or a consumable — cords, switches, lids, straps. Email us with a photo and we will send the part rather than a whole new unit.</p>
    `,
  },
  {
    handle: "shipping",
    title: "Shipping",
    bodyHtml: `
      <p>Orders placed before 14:00 ET ship the same working day.</p>
      <h2>Rates</h2>
      <ul>
        <li>Standard, 2–4 working days — $6.50, free over $75</li>
        <li>Express, next working day — $18</li>
        <li>Canada, 5–8 working days — $22</li>
      </ul>
      <p>Every order ships tracked. You get the number by email as soon as the label is printed, not when the parcel is scanned.</p>
      <h2>Larger items</h2>
      <p>Furniture and lighting go by pallet courier and take 5–10 working days. The carrier calls to arrange a window rather than leaving a card.</p>
    `,
  },
  {
    handle: "returns",
    title: "Returns",
    bodyHtml: `
      <p>Sixty days from delivery. Unused and in its packaging, and we cover the return label.</p>
      <h2>How</h2>
      <p>Email <a href="mailto:hello@cartely.store">hello@cartely.store</a> with your order number. You will get a prepaid label back, usually within a couple of hours during the working week.</p>
      <h2>Faulty items</h2>
      <p>No time limit and no need to return it first. Send a photo and we will ship the replacement or the spare part straight away.</p>
    `,
  },
  {
    handle: "contact",
    title: "Contact",
    bodyHtml: `
      <p>Weekdays 9–18 ET. A person answers, and you get their name.</p>
      <ul>
        <li>Email — <a href="mailto:hello@cartely.store">hello@cartely.store</a></li>
        <li>Phone — +1 (555) 018-4420</li>
        <li>Post — Unit 4, 118 Mercer Street, New York, NY 10012</li>
      </ul>
      <p>Typical reply time is under four working hours. If it has been longer than a day, the email went astray — send it again.</p>
    `,
  },
  {
    handle: "faq",
    title: "FAQ",
    bodyHtml: `
      <h2>Do you restock sold-out items?</h2>
      <p>Usually, within four to six weeks. The product page shows the expected date once the run is booked.</p>
      <h2>Can I order a spare part on its own?</h2>
      <p>Yes, and for the first two years it is free. Email us with the product and the part.</p>
      <h2>Do you ship outside the US?</h2>
      <p>Canada, yes. Everywhere else, not yet — the return shipping makes the 60-day policy dishonest, so we would rather wait.</p>
      <h2>Is the packaging recyclable?</h2>
      <p>All of it. Paper tape, moulded pulp, no plastic film anywhere in the chain.</p>
    `,
  },
  {
    handle: "materials",
    title: "Materials",
    bodyHtml: `
      <p>What things are made of, and what that means when they wear.</p>
      <h2>Stoneware</h2>
      <p>Fired twice at 1240°C. The body is vitrified, so a chipped glaze does not make the piece porous — it just looks chipped.</p>
      <h2>Linen</h2>
      <p>European flax, stonewashed before it ships. Expect it to soften for about ten washes and then stay put.</p>
      <h2>Unlacquered brass</h2>
      <p>It will darken, unevenly, wherever you touch it. That is the point. A cut lemon takes it back to bright if you would rather it were not.</p>
      <h2>Powder-coated steel</h2>
      <p>Chip-resistant but not chip-proof. We keep touch-up sticks in every colourway.</p>
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
      <p>Prices are in USD and exclude sales tax, which is calculated at checkout based on your delivery address.</p>
      <h2>Liability</h2>
      <p>Our liability is limited to the value of the order. Nothing here affects your statutory rights.</p>
    `,
  },
];
