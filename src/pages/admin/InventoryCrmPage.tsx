import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listAllItems, upsertItem } from "@/lib/inventory-api";
import type { InventoryItem, InventoryStatus } from "@/types/inventory";
import {
  SOURCE_LABELS,
  STATUS_LABELS,
  formatListPrice,
  formatPrice,
  type InventorySource,
} from "@/types/inventory";

const PIPELINE: InventoryStatus[] = [
  "acquired",
  "inspected",
  "in_stock",
  "listed",
  "sold",
  "archived",
];

export function InventoryCrmPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<InventorySource | "all">("all");

  async function refresh() {
    setLoading(true);
    try {
      setItems(await listAllItems());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (sourceFilter !== "all" && item.source_type !== sourceFilter) return false;
      return true;
    });
  }, [items, statusFilter, sourceFilter]);

  const counts = useMemo(() => {
    const map = Object.fromEntries(PIPELINE.map((s) => [s, 0])) as Record<
      InventoryStatus,
      number
    >;
    for (const item of items) map[item.status] += 1;
    return map;
  }, [items]);

  async function sellOne(item: InventoryItem) {
    const qty = item.quantity ?? 1;
    if (qty > 1) {
      setError(null);
      try {
        await upsertItem({ ...item, quantity: qty - 1 });
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Update failed");
      }
      return;
    }
    await advanceStatus(item, "sold");
  }

  async function advanceStatus(item: InventoryItem, status: InventoryStatus) {
    setError(null);
    try {
      const published =
        status === "listed"
          ? true
          : status === "sold" || status === "archived"
            ? false
            : item.published;
      const sold_at = status === "sold" ? new Date().toISOString() : item.sold_at;
      await upsertItem({ ...item, status, published, sold_at });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  return (
    <>
      <h1 style={{ marginTop: 0 }}>Inventory CRM</h1>
      <p style={{ color: "var(--muted)" }}>
        Track acquisition sources, costs, and pipeline stage for every piece of gear.
      </p>
      {error ? <div className="alert alert--error">{error}</div> : null}

      <div className="stat-grid" style={{ marginBottom: "1rem" }}>
        {PIPELINE.map((status) => (
          <button
            key={status}
            type="button"
            className="stat-card"
            style={{ textAlign: "left", cursor: "pointer" }}
            onClick={() => setStatusFilter(status)}
          >
            <div className="stat-card__label">{STATUS_LABELS[status]}</div>
            <div className="stat-card__value">{counts[status]}</div>
          </button>
        ))}
      </div>

      <div className="form-stack" style={{ marginBottom: "1rem" }}>
        <div className="field">
          <label htmlFor="status-filter">Filter by status</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InventoryStatus | "all")}
          >
            <option value="all">All statuses</option>
            {PIPELINE.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="source-filter">Filter by source</label>
          <select
            id="source-filter"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as InventorySource | "all")}
          >
            <option value="all">All sources</option>
            {(Object.keys(SOURCE_LABELS) as InventorySource[]).map((key) => (
              <option key={key} value={key}>
                {SOURCE_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading inventory…</p>
      ) : filtered.length === 0 ? (
        <p className="empty-state">No items in this view.</p>
      ) : (
        <div className="crm-board">
          {filtered.map((item) => {
            const qty = item.quantity ?? 1;
            const margin =
              item.cost_cents != null && item.price_cents > 0
                ? item.price_cents - item.cost_cents
                : null;
            return (
              <article key={item.id} className="crm-card">
                <div className="crm-card__head">
                  <div>
                    <strong>{item.title}</strong>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                      {SOURCE_LABELS[item.source_type]}
                      {item.source_detail ? ` · ${item.source_detail}` : ""}
                    </div>
                  </div>
                  <span className="pill">{STATUS_LABELS[item.status]}</span>
                </div>
                <div style={{ fontSize: "0.85rem" }}>
                  Qty {qty}
                  {" · "}
                  List {formatListPrice(item.price_cents)}
                  {item.price_cents > 0 && qty > 1 ? " each" : ""}
                  {item.cost_cents != null ? (
                    <>
                      <br />
                      Cost {formatPrice(item.cost_cents)}
                      {qty > 1
                        ? ` each (${formatPrice(item.cost_cents * qty)} total)`
                        : ""}
                      {margin != null
                        ? ` · Margin ${formatPrice(margin)}${qty > 1 ? " each" : ""}`
                        : ""}
                    </>
                  ) : null}
                </div>
                {item.notes ? (
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>
                    {item.notes}
                  </p>
                ) : null}
                <div className="btn-row">
                  <Link to={`/admin/listings/${item.id}`} className="btn btn--ghost">
                    Edit
                  </Link>
                  {item.status !== "listed" ? (
                    <button
                      type="button"
                      className="btn btn--dark"
                      onClick={() => void advanceStatus(item, "listed")}
                    >
                      Mark listed
                    </button>
                  ) : null}
                  {item.status !== "sold" ? (
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={() => void sellOne(item)}
                    >
                      {(item.quantity ?? 1) > 1 ? "Sold 1" : "Mark sold"}
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
