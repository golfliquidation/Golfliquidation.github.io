import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createEmptyItem } from "@/lib/default-item";
import {
  deleteItem,
  listAllItems,
  uploadListingPhoto,
  upsertItem,
} from "@/lib/inventory-api";
import type { InventoryItemInsert } from "@/types/inventory";
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  SOURCE_LABELS,
  STATUS_LABELS,
  formatPrice,
  slugify,
  type InventorySource,
  type InventoryStatus,
  type ItemCategory,
  type ItemCondition,
} from "@/types/inventory";

function centsToText(cents: number | null): string {
  return cents ? (cents / 100).toFixed(2) : "";
}

function textToCents(text: string): number | null {
  const value = parseFloat(text.replace(/[$,\s]/g, ""));
  return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) : null;
}

export function ListingFormPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new" || !id;
  const navigate = useNavigate();
  const [form, setForm] = useState<InventoryItemInsert>(() => createEmptyItem());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string | undefined>(isNew ? undefined : id);
  const [priceText, setPriceText] = useState("");
  const [costText, setCostText] = useState("");

  useEffect(() => {
    if (isNew || !id) return;
    listAllItems()
      .then((items) => {
        const found = items.find((i) => i.id === id);
        if (!found) throw new Error("Item not found");
        setForm(found);
        setItemId(found.id);
        setPriceText(centsToText(found.price_cents));
        setCostText(centsToText(found.cost_cents));
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function updateField<K extends keyof InventoryItemInsert>(
    key: K,
    value: InventoryItemInsert[K],
  ) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title") {
        next.slug = slugify(String(value));
      }
      if (key === "status" && value === "listed") {
        next.published = true;
      }
      if (key === "status" && (value === "sold" || value === "archived")) {
        next.published = false;
      }
      return next;
    });
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const saved = await upsertItem({ ...form, id: itemId });
      setItemId(saved.id);
      setForm(saved);
      setNotice(saved.published ? "Saved. This item is live in the shop." : "Saved.");
      if (isNew) navigate(`/admin/listings/${saved.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotos(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    setNotice(null);
    try {
      let currentId = itemId;
      if (!currentId) {
        const draft = await upsertItem(form);
        currentId = draft.id;
        setItemId(draft.id);
        setForm(draft);
        navigate(`/admin/listings/${draft.id}`, { replace: true });
      }
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await uploadListingPhoto(file, currentId));
      }
      const merged = [...form.photo_urls, ...urls];
      updateField("photo_urls", merged);
      await upsertItem({ ...form, id: currentId, photo_urls: merged });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto(url: string) {
    const next = form.photo_urls.filter((p) => p !== url);
    updateField("photo_urls", next);
    if (itemId) await upsertItem({ ...form, id: itemId, photo_urls: next });
  }

  async function handleDelete() {
    if (!itemId || !confirm("Delete this item permanently?")) return;
    await deleteItem(itemId);
    navigate("/admin/listings");
  }

  if (loading) return <p>Loading…</p>;

  return (
    <>
      <Link to="/admin/listings" style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
        ← All listings
      </Link>
      <h1 style={{ marginTop: "0.5rem" }}>{isNew ? "New listing" : "Edit listing"}</h1>

      <form className="form-stack" onSubmit={(e) => void handleSave(e)}>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="slug">URL slug</label>
          <input
            id="slug"
            value={form.slug ?? ""}
            onChange={(e) => updateField("slug", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={form.description ?? ""}
            onChange={(e) => updateField("description", e.target.value || null)}
          />
        </div>
        <div className="field">
          <label htmlFor="brand">Brand</label>
          <input
            id="brand"
            value={form.brand ?? ""}
            onChange={(e) => updateField("brand", e.target.value || null)}
          />
        </div>
        <div className="field">
          <label htmlFor="sku">SKU</label>
          <input
            id="sku"
            value={form.sku ?? ""}
            onChange={(e) => updateField("sku", e.target.value || null)}
          />
        </div>
        <div className="field">
          <label htmlFor="quantity">Quantity on hand</label>
          <input
            id="quantity"
            type="number"
            min={0}
            step={1}
            value={form.quantity}
            onChange={(e) =>
              updateField("quantity", Math.max(0, parseInt(e.target.value || "0", 10)))
            }
          />
        </div>
        <div className="field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => updateField("category", e.target.value as ItemCategory)}
          >
            {(Object.keys(CATEGORY_LABELS) as ItemCategory[]).map((key) => (
              <option key={key} value={key}>
                {CATEGORY_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="condition">Condition</label>
          <select
            id="condition"
            value={form.condition}
            onChange={(e) => updateField("condition", e.target.value as ItemCondition)}
          >
            {(Object.keys(CONDITION_LABELS) as ItemCondition[]).map((key) => (
              <option key={key} value={key}>
                {CONDITION_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="price">List price per unit (USD)</label>
          <input
            id="price"
            inputMode="decimal"
            placeholder="Leave blank for “Contact for price”"
            value={priceText}
            onChange={(e) => {
              setPriceText(e.target.value);
              updateField("price_cents", textToCents(e.target.value) ?? 0);
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="cost">
            Your cost per unit (USD, private)
            {form.cost_cents && form.quantity > 1
              ? ` · ${formatPrice(form.cost_cents * form.quantity)} for all ${form.quantity}`
              : ""}
          </label>
          <input
            id="cost"
            inputMode="decimal"
            value={costText}
            onChange={(e) => {
              setCostText(e.target.value);
              updateField("cost_cents", textToCents(e.target.value));
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="source">Source</label>
          <select
            id="source"
            value={form.source_type}
            onChange={(e) => updateField("source_type", e.target.value as InventorySource)}
          >
            {(Object.keys(SOURCE_LABELS) as InventorySource[]).map((key) => (
              <option key={key} value={key}>
                {SOURCE_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="source_detail">Source detail</label>
          <input
            id="source_detail"
            value={form.source_detail ?? ""}
            onChange={(e) => updateField("source_detail", e.target.value || null)}
            placeholder="Shop name, lot #, etc."
          />
        </div>
        <div className="field">
          <label htmlFor="status">CRM status</label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => updateField("status", e.target.value as InventoryStatus)}
          >
            {(Object.keys(STATUS_LABELS) as InventoryStatus[]).map((key) => (
              <option key={key} value={key}>
                {STATUS_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => updateField("published", e.target.checked)}
              style={{ width: "auto", minHeight: "auto", marginRight: "0.5rem" }}
            />
            Published on public shop
          </label>
        </div>
        <div className="field">
          <label htmlFor="notes">Internal notes</label>
          <textarea
            id="notes"
            value={form.notes ?? ""}
            onChange={(e) => updateField("notes", e.target.value || null)}
          />
        </div>

        <div className="field">
          <label htmlFor="photos">Photos</label>
          <input
            id="photos"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              void handlePhotos(e.target.files);
              e.target.value = "";
            }}
            disabled={uploading}
          />
          {uploading ? <p style={{ fontSize: "0.85rem" }}>Uploading…</p> : null}
          {form.photo_urls.length ? (
            <div className="photo-preview-grid">
              {form.photo_urls.map((url) => (
                <div key={url} className="photo-preview">
                  <img src={url} alt="" />
                  <button type="button" onClick={() => void removePhoto(url)} aria-label="Remove">
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {error ? <div className="alert alert--error">{error}</div> : null}
        {notice ? <div className="alert alert--info">{notice}</div> : null}
        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={saving || uploading}>
            {saving ? "Saving…" : "Save"}
          </button>
          {itemId && form.slug && form.published ? (
            <Link to={`/shop/${form.slug}`} className="btn btn--ghost">
              Preview
            </Link>
          ) : null}
          {itemId ? (
            <button type="button" className="btn btn--danger" onClick={() => void handleDelete()}>
              Delete
            </button>
          ) : null}
        </div>
      </form>
    </>
  );
}
