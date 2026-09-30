import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { listPublishedItems } from "@/lib/inventory-api";
import type { InventoryItem } from "@/types/inventory";

export function HomePage() {
  const [featured, setFeatured] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPublishedItems()
      .then((items) => setFeatured(items.slice(0, 6)))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero__badge">🇺🇸 Texan owned &amp; operated · Since 2020</div>
          <h1>Liquidated golf gear. Pro-shop quality. Yard-sale prices.</h1>
          <p>
            We buy out closing pro shops, fitting studios, and wholesaler closeouts — then
            pass the savings to Texas golfers and beyond.
          </p>
          <div className="btn-row">
            <Link to="/shop" className="btn btn--primary">
              Browse the shop
            </Link>
            <Link to="/about" className="btn btn--secondary">
              How we source
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section__title">Fresh from the floor</h2>
          <p className="section__sub">Recently listed liquidation finds</p>
          {loading ? (
            <p className="empty-state">Loading inventory…</p>
          ) : featured.length === 0 ? (
            <div className="empty-state">
              <p>New drops coming soon. Check back or contact us for what&apos;s in the
                pipeline.</p>
              <Link to="/contact" className="btn btn--dark" style={{ marginTop: "1rem" }}>
                Get in touch
              </Link>
            </div>
          ) : (
            <div className="card-grid">
              {featured.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container feature-grid">
          <article className="feature-card">
            <h3>Shop closeouts</h3>
            <p>Full bag walls, demo programs, and leftover seasonal stock when stores shut
              their doors.</p>
          </article>
          <article className="feature-card">
            <h3>Fitting studios</h3>
            <p>Shafts, heads, and build components from studio upgrades and lease turnbacks.</p>
          </article>
          <article className="feature-card">
            <h3>Wholesale deals</h3>
            <p>Container-level closeouts vetted for authenticity and resell-ready condition.</p>
          </article>
        </div>
      </section>
    </>
  );
}
