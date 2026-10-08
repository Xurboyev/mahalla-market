import { CATEGORIES, LISTINGS } from "./demo-data";
import type { Category, Listing } from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

/** Backend javobini ilova modeliga o'giradi. Backend tayyor bo'lmasa demo ma'lumot qaytaradi. */
async function tryFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * API javobi ilova modeli bilan bir xil (apps/api ListingDto).
 * Backend ishlamasa — demo ma'lumotlar.
 */
export async function getCategories(): Promise<Category[]> {
  const data = await tryFetch<Category[]>("/categories");
  return data && data.length > 0 ? data : CATEGORIES;
}

export async function getListings(params: { categoryId?: number; regionId?: number } = {}): Promise<Listing[]> {
  const qs = new URLSearchParams();
  if (params.categoryId) qs.set("categoryId", String(params.categoryId));
  if (params.regionId) qs.set("regionId", String(params.regionId));
  const data = await tryFetch<{ items: Listing[] }>(`/listings${qs.size ? `?${qs}` : ""}`);
  if (data) return data.items;
  return LISTINGS.filter((l) => !params.categoryId || l.categoryId === params.categoryId);
}

export async function getListing(id: string): Promise<Listing | null> {
  const data = await tryFetch<Listing>(`/listings/${id}`);
  return data ?? LISTINGS.find((l) => l.id === id) ?? null;
}

/** "3 daqiqa oldin" kabi nisbiy vaqt */
export function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "hozirgina";
  if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} kun oldin`;
  return new Date(iso).toLocaleDateString("uz-UZ");
}

export function formatPrice(l: Pick<Listing, "price" | "isFree">): string {
  if (l.isFree) return "Tekin 🎁";
  if (l.price == null) return "Kelishiladi";
  return `${l.price.toLocaleString("ru-RU").replace(/,/g, " ")} so'm`;
}

export const STATUS_LABEL: Record<Listing["status"], string | null> = {
  ACTIVE: null,
  RESERVED: "Band qilingan",
  SOLD: "Sotildi",
};
