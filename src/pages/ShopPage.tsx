import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { listPublishedItems } from "@/lib/inventory-api";
import type { InventoryItem, ItemCategory } from "@/types/inventory";
import { CATEGORY_LABELS } from "@/types/inventory";

export function ShopPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<ItemCategory | "all">("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    listPublishedItems()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.brand?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [items, category, query]);

  return (
    <section className="section">
      <div className="container">
        <h1 className="section__title">Shop</h1>
        <p className="section__sub">Everything listed is ready to move, first come, first
          served.</p>

        <div className="form-stack" style={{ marginBottom: "1rem" }}>
          <div className="field">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              type="search"
              placeholder="Brand, model, keywords…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ItemCategory | "all")}
            >
              <option value="all">All categories</option>
              {(Object.keys(CATEGORY_LABELS) as ItemCategory[]).map((key) => (
                <option key={key} value={key}>
                  {CATEGORY_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="empty-state">Loading shop…</p>
        ) : filtered.length === 0 ? (
          <p className="empty-state">No listings match your filters right now.</p>
        ) : (
          <div className="card-grid">
            {filtered.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
