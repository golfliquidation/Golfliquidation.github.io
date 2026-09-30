import type { InventoryItem, InventoryItemInsert } from "@/types/inventory";

const STORAGE_KEY = "golfliquidation.inventory.v1";
const SESSION_KEY = "golfliquidation.host.session";

export const localHostEmail = import.meta.env.VITE_HOST_EMAIL?.trim() || "";
export const localHostPassword = import.meta.env.VITE_HOST_PASSWORD || "";
export const isLocalHostConfigured = Boolean(localHostEmail && localHostPassword);

type HostSession = { email: string; at: number };

function readItems(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as InventoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeItems(items: InventoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    throw new Error(
      "Browser storage is full. Remove some photos, or connect cloud storage to add more.",
    );
  }
}

function seedIfEmpty() {
  if (readItems().length > 0) return;
  const now = new Date().toISOString();
  const seeds: InventoryItemInsert[] = [
    {
      sku: "SHAFT-VENTUS-TR-7X-2026",
      title: "2026 Fujikura Ventus TR VeloCore+ 7X Uncut",
      description: "New. Fujikura Ventus TR with VeloCore+. 7X flex, uncut length.",
      category: "accessories",
      condition: "new",
      brand: "Fujikura",
      source_type: "wholesaler",
      source_detail: null,
      acquisition_date: null,
      cost_cents: null,
      price_cents: 0,
      status: "in_stock",
      published: false,
      slug: "ventus-tr-7x-2026-uncut",
      photo_urls: [],
      notes: "On-hand qty: 3",
      buyer_name: null,
      sold_at: null,
      quantity: 3,
    },
    {
      sku: "SHAFT-VENTUS-TR-6X-2026",
      title: "2026 Fujikura Ventus TR VeloCore+ 6X Uncut",
      description: "New. Fujikura Ventus TR with VeloCore+. 6X flex, uncut length.",
      category: "accessories",
      condition: "new",
      brand: "Fujikura",
      source_type: "wholesaler",
      source_detail: null,
      acquisition_date: null,
      cost_cents: null,
      price_cents: 0,
      status: "in_stock",
      published: false,
      slug: "ventus-tr-6x-2026-uncut",
      photo_urls: [],
      notes: "On-hand qty: 7",
      buyer_name: null,
      sold_at: null,
      quantity: 7,
    },
    {
      sku: "SHAFT-KBS-130X-4PW-HALFOVER",
      title: 'KBS 130X 1/2" Over, 4-PW Shaft Set',
      description:
        "New KBS 130X (130g) iron shafts, half inch over length. 4 iron through pitching wedge (7 shafts).",
      category: "accessories",
      condition: "new",
      brand: "KBS",
      source_type: "wholesaler",
      source_detail: null,
      acquisition_date: null,
      cost_cents: null,
      price_cents: 0,
      status: "in_stock",
      published: false,
      slug: "kbs-130x-4pw-half-over",
      photo_urls: [],
      notes: "Single complete matching set.",
      buyer_name: null,
      sold_at: null,
      quantity: 1,
    },
  ];
  writeItems(
    seeds.map((s) => ({
      ...s,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    })),
  );
}

export function initLocalStore() {
  seedIfEmpty();
  const items = readItems();
  if (items.some((i) => i.title.includes("—"))) {
    writeItems(
      items.map((i) => ({
        ...i,
        title: i.title.replace(/ — Uncut/g, " Uncut").replace(/\s*—\s*/g, ", "),
      })),
    );
  }
}

export function localListAll(): InventoryItem[] {
  initLocalStore();
  return readItems().sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
}

export function localListPublished(): InventoryItem[] {
  return localListAll().filter(
    (i) => i.published && ["listed", "in_stock"].includes(i.status),
  );
}

export function localGetBySlug(slug: string): InventoryItem | null {
  return localListPublished().find((i) => i.slug === slug) ?? null;
}

export function localUpsert(
  item: Partial<InventoryItemInsert> & { id?: string },
): InventoryItem {
  initLocalStore();
  const items = readItems();
  const now = new Date().toISOString();
  if (item.id) {
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx === -1) throw new Error("Item not found");
    const merged = { ...items[idx], ...item, updated_at: now } as InventoryItem;
    items[idx] = merged;
    writeItems(items);
    return merged;
  }
  const created: InventoryItem = {
    sku: null,
    quantity: 1,
    title: "New item",
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
    slug: null,
    photo_urls: [],
    notes: null,
    buyer_name: null,
    sold_at: null,
    ...item,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };
  writeItems([created, ...items]);
  return created;
}

export function localDelete(id: string) {
  writeItems(readItems().filter((i) => i.id !== id));
}

export function localSignIn(email: string, password: string): string | null {
  if (!isLocalHostConfigured) return "Host login is not configured.";
  if (email.trim().toLowerCase() !== localHostEmail.toLowerCase()) {
    return "Invalid email or password.";
  }
  if (password !== localHostPassword) return "Invalid email or password.";
  const session: HostSession = { email: localHostEmail, at: Date.now() };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return null;
}

export function localSignOut() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function localGetSession(): HostSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as HostSession;
  } catch {
    return null;
  }
}

export async function localUploadPhoto(file: File, itemId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === "string" ? reader.result : "";
      if (!url) {
        reject(new Error("Could not read photo"));
        return;
      }
      const items = readItems();
      const idx = items.findIndex((i) => i.id === itemId);
      if (idx === -1) {
        reject(new Error("Item not found"));
        return;
      }
      items[idx] = {
        ...items[idx],
        photo_urls: [...items[idx].photo_urls, url],
        updated_at: new Date().toISOString(),
      };
      writeItems(items);
      resolve(url);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}
