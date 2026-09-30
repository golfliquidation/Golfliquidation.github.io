import {
  localDelete,
  localGetBySlug,
  localListAll,
  localListPublished,
  localUploadPhoto,
  localUpsert,
} from "@/lib/local-backend";
import { resizeImage } from "@/lib/image";
import { PHOTO_BUCKET, supabase } from "@/lib/supabase";
import type { InventoryItem, InventoryItemInsert } from "@/types/inventory";

function mapRow(row: Record<string, unknown>): InventoryItem {
  return {
    ...(row as unknown as InventoryItem),
    photo_urls: Array.isArray(row.photo_urls) ? (row.photo_urls as string[]) : [],
    quantity: typeof row.quantity === "number" ? row.quantity : 1,
  };
}

export async function listPublishedItems(): Promise<InventoryItem[]> {
  if (!supabase) return localListPublished();
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("published", true)
    .in("status", ["listed", "in_stock"])
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getItemBySlug(slug: string): Promise<InventoryItem | null> {
  if (!supabase) return localGetBySlug(slug);
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : null;
}

export async function listAllItems(): Promise<InventoryItem[]> {
  if (!supabase) return localListAll();
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function upsertItem(
  item: Partial<InventoryItemInsert> & { id?: string },
): Promise<InventoryItem> {
  if (!supabase) return localUpsert(item);
  const payload = {
    ...item,
    photo_urls: item.photo_urls ?? [],
    updated_at: new Date().toISOString(),
  };
  if (item.id) {
    const { data, error } = await supabase
      .from("inventory_items")
      .update(payload)
      .eq("id", item.id)
      .select("*")
      .single();
    if (error) throw error;
    return mapRow(data);
  }
  const { data, error } = await supabase
    .from("inventory_items")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function deleteItem(id: string): Promise<void> {
  if (!supabase) {
    localDelete(id);
    return;
  }
  const { error } = await supabase.from("inventory_items").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadListingPhoto(original: File, itemId: string): Promise<string> {
  if (!supabase) return localUploadPhoto(await resizeImage(original, 1200, 0.78), itemId);
  const file = await resizeImage(original);
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${itemId}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export type CrmStats = {
  total: number;
  acquired: number;
  inPipeline: number;
  listed: number;
  sold: number;
  inventoryValueCents: number;
};

export async function getCrmStats(): Promise<CrmStats> {
  const items = await listAllItems();
  const active = items.filter((i) => i.status !== "archived");
  return {
    total: active.length,
    acquired: active.filter((i) => i.status === "acquired").length,
    inPipeline: active.filter((i) =>
      ["inspected", "in_stock"].includes(i.status),
    ).length,
    listed: active.filter((i) => i.status === "listed").length,
    sold: items.filter((i) => i.status === "sold").length,
    inventoryValueCents: active
      .filter((i) => i.status !== "sold")
      .reduce((sum, i) => sum + (i.cost_cents ?? 0), 0),
  };
}
