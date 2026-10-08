import { CATEGORIES, LISTINGS } from "./demo-data";
import type { Category, ChatMessage, Listing, Region, User } from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";
/** Socket.IO to'g'ridan-to'g'ri API serveriga ulanadi (Vite'ning /api proksisi WebSocket'ni qamramaydi). */
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000";
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
    imageUrls?: string[];
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

export async function setListingStatus(
  token: string,
  id: string,
  status: "ACTIVE" | "RESERVED" | "SOLD" | "HIDDEN",
): Promise<Listing> {
  const res = await fetch(`${API_BASE}/listings/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) return parseError(res, "Holatni o'zgartirishda xatolik");
  return res.json();
}

export async function createReview(
  token: string,
  listingId: string,
  data: { targetId: string; rating: number; text?: string },
): Promise<{ id: string; targetTemperature: number }> {
  const res = await fetch(`${API_BASE}/listings/${listingId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) return parseError(res, "Baho berishda xatolik");
  return res.json();
}

export async function createReport(
  token: string,
  data: { targetType: "LISTING" | "USER" | "MESSAGE"; targetId: string; reason: string },
): Promise<void> {
  const res = await fetch(`${API_BASE}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) return parseError(res, "Shikoyat yuborishda xatolik");
}

// ---- Rasm yuklash (MinIO presigned URL) ----
export async function presignUpload(
  token: string,
  contentType: string,
): Promise<{ uploadUrl: string; publicUrl: string; maxBytes: number }> {
  const res = await fetch(`${API_BASE}/uploads/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ contentType }),
  });
  if (!res.ok) return parseError(res, "Yuklash havolasi olinmadi");
  return res.json();
}

export async function uploadToPresignedUrl(uploadUrl: string, blob: Blob, contentType: string): Promise<void> {
  const res = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": contentType }, body: blob });
  if (!res.ok) throw new Error("Rasm yuklanmadi, qayta urinib ko'ring");
}

/** Rasm faylini WebP'ga siqib (katta tomoni <= maxSize), fayl yuklash uchun Blob qaytaradi. */
export async function compressToWebp(file: File, maxSize = 1600, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas qo'llab-quvvatlanmaydi");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  if (!blob) throw new Error("Rasmni siqishda xatolik");
  return blob;
}

/** Rasm faylini tanlangandan so'ng: siqadi, presigned URL oladi, yuklaydi, public URL qaytaradi. */
export async function uploadListingImage(token: string, file: File): Promise<string> {
  const blob = await compressToWebp(file);
  const { uploadUrl, publicUrl } = await presignUpload(token, "image/webp");
  await uploadToPresignedUrl(uploadUrl, blob, "image/webp");
  return publicUrl;
}

// ---- Chat ----
export type ChatRoomDto = {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  createdAt: string;
};

export type ChatRoomSummary = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImageUrl: string | null;
  otherUser: { id: string; name: string; temperature: number; avatarUrl: string | null };
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
};

async function authedJson<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init?.headers },
  });
  if (!res.ok) return parseError(res, "So'rov bajarilmadi");
  return res.json();
}

export function openChatRoom(token: string, listingId: string): Promise<ChatRoomDto> {
  return authedJson(token, "/chat/rooms", { method: "POST", body: JSON.stringify({ listingId }) });
}

export function listChatRooms(token: string): Promise<ChatRoomSummary[]> {
  return authedJson(token, "/chat/rooms");
}

export function getChatHistory(token: string, roomId: string): Promise<ChatMessage[]> {
  return authedJson(token, `/chat/rooms/${roomId}/messages`);
}

export function markChatRead(token: string, roomId: string): Promise<void> {
  return authedJson(token, `/chat/rooms/${roomId}/read`, { method: "PATCH" });
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
