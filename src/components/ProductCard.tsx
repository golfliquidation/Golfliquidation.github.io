import { Link } from "react-router-dom";
import type { InventoryItem } from "@/types/inventory";
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  formatPrice,
} from "@/types/inventory";

type Props = { item: InventoryItem };

export function ProductCard({ item }: Props) {
  const image = item.photo_urls[0];
  const slug = item.slug ?? item.id;
  return (
    <Link to={`/shop/${slug}`} className="product-card">
      {image ? (
        <img src={image} alt={item.title} className="product-card__img" loading="lazy" />
      ) : (
        <div className="product-card__img" aria-hidden />
      )}
      <div className="product-card__body">
        <span className="pill">{CATEGORY_LABELS[item.category]}</span>
        <strong>{item.title}</strong>
        <span className="product-card__price">{formatPrice(item.price_cents)}</span>
        <span className="product-card__meta">
          {item.brand ? `${item.brand} · ` : ""}
          {CONDITION_LABELS[item.condition]}
        </span>
      </div>
    </Link>
  );
}
