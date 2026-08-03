export type Money = {
  amount: string;
  currencyCode: string;
};

export type ProductImage = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type ProductOption = {
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  /** Опция-стойности по име, напр. { Size: "M", Color: "Sand" } */
  selectedOptions: Record<string, string>;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  tags: string[];
  vendor: string;
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  priceRange: { min: Money; max: Money };
  compareAtPrice: Money | null;
  availableForSale: boolean;
  featured: boolean;
  /** ISO дата — ползва се за сортиране „най-нови" */
  createdAt: string;
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ProductImage | null;
  productHandles: string[];
};

export type Page = {
  handle: string;
  title: string;
  bodyHtml: string;
};

export type CartLine = {
  variantId: string;
  productHandle: string;
  quantity: number;
};

export type ResolvedCartLine = {
  line: CartLine;
  product: Product;
  variant: ProductVariant;
  lineTotal: number;
};

export type SortKey =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "title-asc"
  | "newest";
