/**
 * ЦЕЛИЯТ текст на сайта е тук.
 *
 * Смяна на заглавие, меню, бутон, секция или език — само в този файл.
 * Компонентите не съдържат hardcoded копи. Ако добавяш секция на
 * началната страница, добави ѝ обект тук и я подреди в `homeSections`.
 */

export const site = {
  name: "Cartely",
  tagline: "Watches",
  description:
    "Cartely is a watch shop — automatics, chronographs, divers and dress pieces, listed with the specs that actually matter.",
  currencyCode: "EUR",
  locale: "en",
  email: "hello@cartely.store",
  phone: "+359 2 491 0180",
  address: "bul. Vitosha 24, 1000 Sofia, Bulgaria",
} as const;

/** Оригиналът няма лента най-горе — стои изключена, но е готова за пускане. */
export const announcement = {
  enabled: false,
  text: "Free shipping on orders over €150 — delivered in 2–4 working days",
  linkLabel: "Shipping info",
  linkHref: "/pages/shipping",
} as const;

export const mainNav = [
  { label: "Home", href: "/" },
  { label: "Catalog", href: "/collections/all" },
  { label: "Contact", href: "/pages/contact" },
] as const;

/**
 * Валутата в header-а е дисплей, не превключвател — оригиналът показва
 * "EUR ⌄". Реалната смяна на валута идва от Shopify Markets.
 */
export const currencies = ["EUR", "USD", "GBP", "BGN"] as const;

/**
 * Hero-то в оригинала е само изображение, пълна ширина, без текст върху него.
 * Затова `heading` е празен — сложи текст тук и overlay-ът се появява.
 */
export const hero = {
  heading: "",
  body: "",
  cta: { label: "", href: "/collections/all" },
  image: "/images/hero.svg",
  imageAlt: "Rose gold open-heart automatic watch on a dark marble surface",
} as const;

export const usps = [
  {
    title: "Free shipping over €150",
    body: "Tracked delivery in 2–4 working days across the EU.",
    icon: "truck",
  },
  {
    title: "30-day returns",
    body: "Unworn, with the tags and box? Send it back, we cover the label.",
    icon: "return",
  },
  {
    title: "2-year warranty",
    body: "Movement and case covered. Servicing handled in-house, not shipped abroad.",
    icon: "shield",
  },
  {
    title: "Talk to a human",
    body: "Weekdays 9–18 EET. No bots, no ticket queue — you get a name.",
    icon: "chat",
  },
] as const;

export const featuredCollection = {
  handle: "new-in",
  heading: "Watches example products",
  body: "",
  ctaLabel: "View all",
} as const;

export const bestSellers = {
  handle: "best-sellers",
  heading: "Most wanted",
  body: "The references people come back for.",
  ctaLabel: "Shop best sellers",
} as const;

export const editorial = {
  eyebrow: "Our standard",
  heading: "Every watch is opened, timed and regulated before it ships.",
  body: "We check the movement on a timegrapher, log the daily rate, and regulate anything outside spec. The measured rate goes in the box on a printed card. No watch leaves here on the manufacturer's word alone.",
  cta: { label: "How we check", href: "/pages/about" },
  image: "/images/editorial.svg",
  imageAlt: "A watchmaker's bench with a movement holder and loupe",
} as const;

export const testimonials = {
  heading: "What people say",
  items: [
    {
      quote:
        "Arrived running +2 seconds a day with the timing card in the box. Nobody else bothers to do that at this price.",
      author: "Marion K.",
      meta: "Verified buyer",
    },
    {
      quote:
        "Bracelet was two links too long. They sized it before shipping because I mentioned my wrist size in the order note.",
      author: "Devon R.",
      meta: "Verified buyer",
    },
    {
      quote:
        "The listings say the movement, the lug width and the actual lug-to-lug. That alone put them ahead of every other shop I looked at.",
      author: "Ana P.",
      meta: "Verified buyer",
    },
  ],
} as const;

export const newsletter = {
  heading: "One email a month",
  body: "New arrivals, restocks, and the occasional note on a movement worth knowing about. Unsubscribe in one click.",
  placeholder: "your@email.com",
  buttonLabel: "Subscribe",
  successMessage: "You're on the list. Check your inbox to confirm.",
  errorMessage: "That email doesn't look right — mind checking it?",
  disclaimer: "No sharing, no reselling. See our privacy policy.",
} as const;

export const footer = {
  blurb:
    "A watch shop that lists the movement, the lug width and the measured daily rate.",
  columns: [
    {
      heading: "Shop",
      links: [
        { label: "Catalog", href: "/collections/all" },
        { label: "New in", href: "/collections/new-in" },
        { label: "Automatics", href: "/collections/automatics" },
        { label: "Divers", href: "/collections/divers" },
        { label: "Sale", href: "/collections/sale" },
      ],
    },
    {
      heading: "Help",
      links: [
        { label: "Shipping", href: "/pages/shipping" },
        { label: "Returns", href: "/pages/returns" },
        { label: "Contact", href: "/pages/contact" },
        { label: "FAQ", href: "/pages/faq" },
      ],
    },
    {
      heading: "About",
      links: [
        { label: "Our standard", href: "/pages/about" },
        { label: "Servicing", href: "/pages/materials" },
        { label: "Privacy", href: "/pages/privacy" },
        { label: "Terms", href: "/pages/terms" },
      ],
    },
  ],
  paymentMethods: ["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay", "Shop"],
  copyright: `© ${new Date().getFullYear()} ${site.name}. All rights reserved.`,
} as const;

/** Редът на секциите на началната страница. Разместваш тук. */
export const homeSections = [
  "hero",
  "usps",
  "featured",
  "editorial",
  "bestSellers",
  "testimonials",
  "newsletter",
] as const;

export type HomeSection = (typeof homeSections)[number];

/** UI низове — етикети на бутони, състояния, съобщения. */
export const ui = {
  addToCart: "Add to cart",
  adding: "Adding…",
  added: "Added",
  soldOut: "Sold out",
  outOfStock: "Out of stock",
  checkout: "Checkout",
  continueShopping: "Continue shopping",
  cart: "Cart",
  cartEmpty: "Your cart is empty.",
  cartEmptyBody: "Nothing here yet — the catalogue is a good place to start.",
  subtotal: "Subtotal",
  shippingNote: "Shipping and taxes calculated at checkout.",
  remove: "Remove",
  quantity: "Quantity",
  search: "Search",
  searchPlaceholder: "Search products",
  searchEmpty: "No products matched",
  searchEmptyBody: "Try a shorter word, or browse the full catalogue.",
  sortBy: "Sort by",
  filters: "Filters",
  clearFilters: "Clear all",
  showing: "Showing",
  products: "products",
  noProducts: "No products in this collection yet.",
  relatedProducts: "You might also like",
  description: "Description",
  details: "Details",
  sale: "Sale",
  new: "New",
  menu: "Menu",
  close: "Close",
  notFoundHeading: "Page not found",
  notFoundBody:
    "That link doesn't lead anywhere. It may have moved, or never existed.",
  backHome: "Back to home",
} as const;

export const sortOptions: { value: string; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "title-asc", label: "Alphabetical" },
];
