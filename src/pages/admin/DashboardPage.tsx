import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCrmStats, type CrmStats } from "@/lib/inventory-api";
import { formatPrice } from "@/types/inventory";

export function DashboardPage() {
  const [stats, setStats] = useState<CrmStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCrmStats()
      .then(setStats)
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <p style={{ color: "var(--muted)" }}>
        Snapshot of your liquidation pipeline and live shop.
      </p>

      {error ? <div className="alert alert--error">{error}</div> : null}

      {stats ? (
        <div className="stat-grid" style={{ margin: "1rem 0" }}>
          <div className="stat-card">
            <div className="stat-card__label">Active SKUs</div>
            <div className="stat-card__value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Newly acquired</div>
            <div className="stat-card__value">{stats.acquired}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">In pipeline</div>
            <div className="stat-card__value">{stats.inPipeline}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Live listings</div>
            <div className="stat-card__value">{stats.listed}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Sold (all time)</div>
            <div className="stat-card__value">{stats.sold}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Cost on hand</div>
            <div className="stat-card__value">
              {formatPrice(stats.inventoryValueCents)}
            </div>
          </div>
        </div>
      ) : (
        <p>Loading stats…</p>
      )}

      <div className="btn-row">
        <Link to="/admin/listings/new" className="btn btn--primary">
          New listing
        </Link>
        <Link to="/admin/inventory" className="btn btn--ghost">
          Open inventory CRM
        </Link>
      </div>
    </>
  );
}
