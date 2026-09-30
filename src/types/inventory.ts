export type InventorySource =
  | "shop_closeout"
  | "fitting_studio"
  | "wholesaler"
  | "estate"
  | "other";

export type InventoryStatus =
  | "acquired"
  | "inspected"
  | "in_stock"
  | "listed"
  | "sold"
  | "archived";

export type ItemCondition =
  | "new"
  | "like_new"
  | "excellent"
  | "good"
  | "fair"
  | "as_is";

export type ItemCategory =
  | "drivers"
  | "fairway_woods"
  | "hybrids"
  | "irons"
  | "wedges"
  | "putters"
  | "bags"
  | "apparel"
  | "balls"
  | "accessories"
  | "sets"
  | "other";

export interface InventoryItem {
  id: string;
  sku: string | null;
  title: string;
  description: string | null;
  category: ItemCategory;
  condition: ItemCondition;
  brand: string | null;
  source_type: InventorySource;
  source_detail: string | null;
  acquisition_date: string | null;
  cost_cents: number | null;
  price_cents: number;
  status: InventoryStatus;
  published: boolean;
  slug: string | null;
  photo_urls: string[];
  notes: string | null;
  buyer_name: string | null;
  sold_at: string | null;
  created_at: string;
  updated_at: string;
}

export type InventoryItemInsert = Omit<
  InventoryItem,
  "id" | "created_at" | "updated_at"
> & { id?: string };

export const SOURCE_LABELS: Record<InventorySource, string> = {
  shop_closeout: "Shop closeout",
  fitting_studio: "Fitting studio",
  wholesaler: "Wholesaler closeout",
  estate: "Estate / bulk buy",
  other: "Other",
};

export const STATUS_LABELS: Record<InventoryStatus, string> = {
  acquired: "Acquired",
  inspected: "Inspected",
  in_stock: "In stock",
  listed: "Listed (live)",
  sold: "Sold",
  archived: "Archived",
};

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  drivers: "Drivers",
  fairway_woods: "Fairway woods",
  hybrids: "Hybrids",
  irons: "Irons",
  wedges: "Wedges",
  putters: "Putters",
  bags: "Bags",
  apparel: "Apparel",
  balls: "Golf balls",
  accessories: "Accessories",
  sets: "Complete sets",
  other: "Other",
};

export const CONDITION_LABELS: Record<ItemCondition, string> = {
  new: "New",
  like_new: "Like new",
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  as_is: "As-is",
};

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}
