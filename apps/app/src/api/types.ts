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
  fromMe: boolean;
  body: string;
  createdAt: string;
};
