import type { InventoryItemInsert } from "@/types/inventory";
import { slugify } from "@/types/inventory";

export function createEmptyItem(
  partial?: Partial<InventoryItemInsert>,
): InventoryItemInsert {
  const title = partial?.title ?? "New item";
  return {
    sku: null,
    quantity: 1,
    title,
    description: null,
    category: "other",
    condition: "good",
    brand: null,
    source_type: "shop_closeout",
    source_detail: null,
    acquisition_date: null,
    cost_cents: null,
    price_cents: 0,
    status: "acquired",
    published: false,
    slug: slugify(title),
    photo_urls: [],
    notes: null,
    buyer_name: null,
    sold_at: null,
    ...partial,
  };
}
