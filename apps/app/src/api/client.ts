import { CATEGORIES, LISTINGS } from "./demo-data";
import type { Category, Listing, Region, User } from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";
const TOKEN_KEY = "mm_token";

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

// ---- Auth: token saqlash ----
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* localStorage mavjud bo'lmasa (SSR/privat rejim) — jim o'tkazamiz */
  }
}

async function parseError(res: Response, fallback: string): Promise<never> {
  const data = await res.json().catch(() => null);
  throw new Error((data && (data.message as string)) || fallback);
}

// ---- Auth: telefon + OTP ----
export async function requestOtp(phone: string): Promise<{ ok: boolean; ttl: number }> {
  const res = await fetch(`${API_BASE}/auth/otp/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) return parseError(res, "Kod yuborilmadi");
  return res.json();
}

export async function verifyOtp(phone: string, code: string): Promise<{ accessToken: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code }),
  });
  if (!res.ok) return parseError(res, "Kod noto'g'ri yoki muddati o'tgan");
  return res.json();
}

export async function getMe(token: string): Promise<User | null> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function updateMe(
  token: string,
  data: { name?: string; regionId?: number },
): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) return parseError(res, "Saqlashda xatolik");
  return res.json();
}

// ---- Hududlar (viloyat → tuman → MFY) ----
export async function getRegions(parentId?: number): Promise<Region[]> {
  const qs = parentId !== undefined ? `?parentId=${parentId}` : "";
  const data = await tryFetch<Region[]>(`/regions${qs}`);
  return data ?? [];
}

export async function getRegion(id: number): Promise<Region | null> {
  return tryFetch<Region>(`/regions/${id}`);
}

// ---- E'lon yaratish (auth talab qiladi) ----
export async function createListing(
  token: string,
  data: {
    title: string;
    categoryId: number;
    description?: string;
    price?: number;
    isFree?: boolean;
    regionId?: number;
  },
): Promise<Listing> {
  const res = await fetch(`${API_BASE}/listings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) return parseError(res, "E'lon joylashda xatolik");
  return res.json();
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
