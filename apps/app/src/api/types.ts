export type Category = { id: number; slug: string; name: string };

export type Seller = {
  id: string;
  name: string;
  mahalla: string;
  temperature: number;
  avatarUrl?: string | null;
};

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number | null;
  isFree: boolean;
  status: "ACTIVE" | "RESERVED" | "SOLD";
  categoryId: number;
  mahalla: string;
  createdAt: string;
  imageUrl?: string | null;
  chatCount: number;
  likeCount: number;
  seller: Seller;
};

export type ChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

export type RegionLevel = "VILOYAT" | "TUMAN" | "MFY";

export type Region = {
  id: number;
  soato: string | null;
  name: string;
  nameRu?: string | null;
  level: RegionLevel;
  parentId: number | null;
  lat?: number | null;
  lng?: number | null;
};

export type User = {
  id: string;
  phone: string;
  name: string | null;
  avatarUrl?: string | null;
  regionId: number | null;
  temperature: number;
  isBlocked: boolean;
  createdAt: string;
};
