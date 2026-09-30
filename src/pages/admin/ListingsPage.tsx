import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listAllItems } from "@/lib/inventory-api";
import type { InventoryItem } from "@/types/inventory";
import { formatPrice, STATUS_LABELS } from "@/types/inventory";

export function ListingsPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAllItems()
      .then(setItems)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
        <h1 style={{ margin: 0 }}>Listings</h1>
        <Link to="/admin/listings/new" className="btn btn--primary">
          + New
        </Link>
      </div>
      <p style={{ color: "var(--muted)" }}>Create shop listings with photos and pricing.</p>
      {error ? <div className="alert alert--error">{error}</div> : null}
      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <p className="empty-state">No items yet. Add your first listing.</p>
      ) : (
        <div className="table-wrap" style={{ marginTop: "1rem" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Status</th>
                <th>Live</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/admin/listings/${item.id}`}>
                      <strong>{item.title}</strong>
                    </Link>
                    {item.sku ? (
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                        SKU {item.sku}
                      </div>
                    ) : null}
                  </td>
                  <td>{item.quantity ?? 1}</td>
                  <td>{item.price_cents > 0 ? formatPrice(item.price_cents) : "—"}</td>
                  <td>{STATUS_LABELS[item.status]}</td>
                  <td>{item.published ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
