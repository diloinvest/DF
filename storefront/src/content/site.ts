/**
 * ЦЕЛИЯТ текст на сайта е тук.
 *
 * Смяна на заглавие, меню, бутон, секция или език — само в този файл.
 * Компонентите не съдържат hardcoded копи. Ако добавяш секция на
 * началната страница, добави ѝ обект тук и я подреди в `homeSections`.
 */

export const site = {
  name: "Cartely",
  tagline: "Everyday objects, considered.",
  description:
    "Cartely is a small catalogue of home and desk objects chosen for how they wear over years, not seasons.",
  currencyCode: "USD",
  locale: "en",
  email: "hello@cartely.store",
  phone: "+1 (555) 018-4420",
  address: "Unit 4, 118 Mercer Street, New York, NY 10012",
} as const;

export const announcement = {
  enabled: true,
  text: "Free shipping on orders over $75 — delivered in 2–4 working days",
  linkLabel: "Shipping info",
  linkHref: "/pages/shipping",
} as const;

export const mainNav = [
  { label: "Shop all", href: "/collections/all" },
  { label: "New in", href: "/collections/new-in" },
  { label: "Home", href: "/collections/home" },
  { label: "Desk", href: "/collections/desk" },
  { label: "Sale", href: "/collections/sale" },
] as const;

export const hero = {
  eyebrow: "New season",
  heading: "Objects that earn their place",
  body: "A tight catalogue of home and desk pieces. No seasonal churn, no filler — everything here is meant to be used daily and kept for years.",
  primaryCta: { label: "Shop the collection", href: "/collections/all" },
  secondaryCta: { label: "What's new", href: "/collections/new-in" },
  image: "/images/hero.svg",
  imageAlt:
    "Stacked ceramic vessels and a folded linen throw arranged on a pale surface",
} as const;

export const usps = [
  {
    title: "Free shipping over $75",
    body: "Tracked delivery in 2–4 working days, anywhere in the continental US.",
    icon: "truck",
  },
  {
    title: "60-day returns",
    body: "Unused and in its packaging? Send it back, we cover the return label.",
    icon: "return",
  },
  {
    title: "Made to last",
    body: "Every piece is spec'd for repair, not replacement. Spares kept in stock.",
    icon: "shield",
  },
  {
    title: "Talk to a human",
    body: "Weekdays 9–18 ET. No bots, no ticket queue — you get a name.",
    icon: "chat",
  },
] as const;

export const featuredCollection = {
  handle: "new-in",
  heading: "New in",
  body: "Twelve pieces added this month, made in runs small enough that we know who built them.",
  ctaLabel: "View all new arrivals",
} as const;

export const bestSellers = {
  handle: "best-sellers",
  heading: "Most reordered",
  body: "The things people come back for.",
  ctaLabel: "Shop best sellers",
} as const;

export const editorial = {
  eyebrow: "Our standard",
  heading: "We stock about a hundred things. That is on purpose.",
  body: "Every product here has been used by someone on the team for at least three months before it goes live. If it chips, wobbles, fades or annoys, it does not make the catalogue. That is the whole selection process.",
  cta: { label: "How we choose", href: "/pages/about" },
  image: "/images/editorial.svg",
  imageAlt: "A workbench with tools and a half-assembled desk lamp",
} as const;

export const testimonials = {
  heading: "What people say",
  items: [
    {
      quote:
        "Third order this year. The ceramics have been through a dishwasher maybe two hundred times and still look new.",
      author: "Marion K.",
      meta: "Verified buyer",
    },
    {
      quote:
        "I emailed about a cracked lid on a Sunday and had a replacement shipped Monday morning. No forms, no photos demanded.",
      author: "Devon R.",
      meta: "Verified buyer",
    },
    {
      quote:
        "The catalogue is small enough that I actually read all of it. Refreshing after scrolling ten thousand near-identical listings elsewhere.",
      author: "Ana P.",
      meta: "Verified buyer",
    },
  ],
} as const;

export const newsletter = {
  heading: "One email a month",
  body: "New arrivals, restocks, and the occasional note on how something is made. Unsubscribe in one click.",
  placeholder: "your@email.com",
  buttonLabel: "Subscribe",
  successMessage: "You're on the list. Check your inbox to confirm.",
  errorMessage: "That email doesn't look right — mind checking it?",
  disclaimer: "No sharing, no reselling. See our privacy policy.",
} as const;

export const footer = {
  blurb:
    "A small catalogue of home and desk objects, chosen for how they wear over years.",
  columns: [
    {
      heading: "Shop",
      links: [
        { label: "All products", href: "/collections/all" },
        { label: "New in", href: "/collections/new-in" },
        { label: "Home", href: "/collections/home" },
        { label: "Desk", href: "/collections/desk" },
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
        { label: "Materials", href: "/pages/materials" },
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
