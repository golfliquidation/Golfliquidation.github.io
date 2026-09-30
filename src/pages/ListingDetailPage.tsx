import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getItemBySlug } from "@/lib/inventory-api";
import type { InventoryItem } from "@/types/inventory";
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  SOURCE_LABELS,
  formatPrice,
} from "@/types/inventory";

export function ListingDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    if (!slug) return;
    getItemBySlug(slug)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p>Loading listing…</p>
        </div>
      </section>
    );
  }

  if (!item) {
    return (
      <section className="section">
        <div className="container empty-state">
          <p>Listing not found or no longer available.</p>
          <Link to="/shop" className="btn btn--dark" style={{ marginTop: "1rem" }}>
            Back to shop
          </Link>
        </div>
      </section>
    );
  }

  const photos = item.photo_urls.length ? item.photo_urls : [null];

  return (
    <section className="section">
      <div className="container">
        <Link to="/shop" style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
          ← Back to shop
        </Link>
        <div className="detail-gallery" style={{ marginTop: "0.75rem" }}>
          {photos[activePhoto] ? (
            <img
              src={photos[activePhoto]!}
              alt={item.title}
              className="detail-gallery__main"
            />
          ) : (
            <div className="detail-gallery__main" aria-hidden />
          )}
          {photos.length > 1 ? (
            <div className="photo-preview-grid">
              {photos.map((url, idx) =>
                url ? (
                  <button
                    key={url}
                    type="button"
                    className="photo-preview"
                    onClick={() => setActivePhoto(idx)}
                    style={{
                      outline:
                        idx === activePhoto ? "2px solid var(--accent)" : undefined,
                    }}
                  >
                    <img src={url} alt="" />
                  </button>
                ) : null,
              )}
            </div>
          ) : null}
        </div>

        <p className="pill" style={{ marginTop: "1rem" }}>
          {CATEGORY_LABELS[item.category]}
        </p>
        <h1 style={{ margin: "0.35rem 0 0" }}>{item.title}</h1>
        <p className="detail-price">{formatPrice(item.price_cents)}</p>
        <p style={{ color: "var(--muted)" }}>
          {item.brand ? `${item.brand} · ` : ""}
          {CONDITION_LABELS[item.condition]}
        </p>
        {item.description ? (
          <p style={{ marginTop: "1rem", whiteSpace: "pre-wrap" }}>{item.description}</p>
        ) : null}
        <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "1.25rem" }}>
          Sourced via {SOURCE_LABELS[item.source_type]}
          {item.source_detail ? ` — ${item.source_detail}` : ""}
        </p>
        <Link to="/contact" className="btn btn--primary btn--block" style={{ marginTop: "1.5rem" }}>
          Ask about this item
        </Link>
      </div>
    </section>
  );
}
