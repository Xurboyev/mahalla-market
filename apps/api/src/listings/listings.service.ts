import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { and, desc, eq, ilike, inArray, ne, type SQL, sql } from "drizzle-orm";
import type { Db } from "../db/client";
import { InjectDb } from "../db/db.module";
import { chatRooms, favorites, listingImages, listings, regions, users } from "../db/schema";

export const PAGE_SIZE = 20;

export type ListingStatus = (typeof listings.$inferSelect)["status"];

/**
 * Taqiqlangan tovarlar ro'yxati (`docs/01-product.md` §3.7): qurol, dori-darmon,
 * hujjatlar va h.k. MVP uchun oddiy so'z-ro'yxati; keyinroq ML/kategoriya bo'yicha
 * kengaytiriladi (`docs/07-ish-reja.md` Sprint 2.3).
 */
const BANNED_KEYWORDS = [
  "qurol",
  "pistolet",
  "miltiq",
  "granata",
  "giyohvand",
  "narkotik",
  "bank kartasi raqami",
  "login parol sotiladi",
  "soxta pasport",
  "soxta guvohnoma",
  "qurolli",
];

function assertNotBanned(text: string) {
  const lower = text.toLowerCase();
  const hit = BANNED_KEYWORDS.find((w) => lower.includes(w));
  if (hit) {
    throw new BadRequestException("E'lon matnida taqiqlangan so'z/mavzu aniqlandi. Qoidalarni tekshiring.");
  }
}


/** Ilova (apps/app) kutadigan e'lon ko'rinishi */
export type ListingDto = {
  id: string;
  title: string;
  description: string;
  price: number | null;
  isFree: boolean;
  status: ListingStatus;
  categoryId: number;
  regionId: number;
  mahalla: string;
  createdAt: string;
  imageUrl: string | null;
  chatCount: number;
  likeCount: number;
  seller: { id: string; name: string; mahalla: string; temperature: number; avatarUrl: string | null };
};

@Injectable()
export class ListingsService {
  constructor(@InjectDb() private db: Db) {}

  /** Hudud va uning barcha ichki hududlari (viloyat → tumanlar → MFYlar) */
  async regionWithDescendants(regionId: number): Promise<number[]> {
    const res = await this.db.execute<{ id: number }>(sql`
      with recursive tree as (
        select id from ${regions} where id = ${regionId}
        union all
        select r.id from ${regions} r join tree t on r.parent_id = t.id
      )
      select id from tree`);
    return res.rows.map((r) => r.id);
  }

  private baseSelect() {
    const firstImage = sql<string | null>`(
      select ${listingImages.url} from ${listingImages}
      where ${listingImages.listingId} = ${listings.id}
      order by ${listingImages.position} limit 1)`;
    const likeCount = sql<number>`(select count(*)::int from ${favorites} where ${favorites.listingId} = ${listings.id})`;
    const chatCount = sql<number>`(select count(*)::int from ${chatRooms} where ${chatRooms.listingId} = ${listings.id})`;
    return this.db
      .select({
        id: listings.id,
        title: listings.title,
        description: listings.description,
        price: listings.price,
        isFree: listings.isFree,
        status: listings.status,
        categoryId: listings.categoryId,
        regionId: listings.regionId,
        mahalla: regions.name,
        createdAt: listings.createdAt,
        imageUrl: firstImage,
        chatCount,
        likeCount,
        sellerId: users.id,
        sellerName: users.name,
        sellerTemp: users.temperature,
        sellerAvatar: users.avatarUrl,
      })
      .from(listings)
      .innerJoin(users, eq(users.id, listings.sellerId))
      .innerJoin(regions, eq(regions.id, listings.regionId));
  }

  private toDto(r: Awaited<ReturnType<ReturnType<ListingsService["baseSelect"]>["execute"]>>[number]): ListingDto {
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      price: r.price,
      isFree: r.isFree,
      status: r.status,
      categoryId: r.categoryId,
      regionId: r.regionId,
      mahalla: r.mahalla,
      createdAt: r.createdAt.toISOString(),
      imageUrl: r.imageUrl,
      chatCount: Number(r.chatCount),
      likeCount: Number(r.likeCount),
      seller: {
        id: r.sellerId,
        name: r.sellerName ?? "Foydalanuvchi",
        mahalla: r.mahalla,
        temperature: Math.round(r.sellerTemp * 10) / 10,
        avatarUrl: r.sellerAvatar,
      },
    };
  }

  async list(q: { regionId?: number; categoryId?: number; q?: string; page?: number }) {
    const conds: SQL[] = [ne(listings.status, "HIDDEN")];
    if (q.regionId) conds.push(inArray(listings.regionId, await this.regionWithDescendants(q.regionId)));
    if (q.categoryId) conds.push(eq(listings.categoryId, q.categoryId));
    if (q.q) conds.push(ilike(listings.title, `%${q.q}%`));
    const where = and(...conds);

    const page = q.page ?? 1;
    const [rows, [{ total }]] = await Promise.all([
      this.baseSelect()
        .where(where)
        .orderBy(desc(listings.createdAt))
        .limit(PAGE_SIZE)
        .offset((page - 1) * PAGE_SIZE),
      this.db.select({ total: sql<number>`count(*)::int` }).from(listings).where(where),
    ]);
    return { items: rows.map((r) => this.toDto(r)), total, page, pageSize: PAGE_SIZE };
  }

  async get(id: string): Promise<ListingDto> {
    const [row] = await this.baseSelect().where(eq(listings.id, id)).limit(1);
    if (!row) throw new NotFoundException("E'lon topilmadi");
    return this.toDto(row);
  }

  async create(
    sellerId: string,
    dto: {
      title: string;
      description?: string;
      categoryId: number;
      regionId?: number;
      price?: number | null;
      isFree?: boolean;
      imageUrls?: string[];
    },
  ) {
    assertNotBanned(`${dto.title} ${dto.description ?? ""}`);
    let regionId = dto.regionId;
    if (!regionId) {
      const seller = await this.db.query.users.findFirst({ where: eq(users.id, sellerId) });
      regionId = seller?.regionId ?? undefined;
    }
    if (!regionId) throw new ForbiddenException("Avval mahallangizni tanlang");
    const isFree = dto.isFree ?? false;
    const [row] = await this.db
      .insert(listings)
      .values({
        sellerId,
        regionId,
        categoryId: dto.categoryId,
        title: dto.title.trim(),
        description: dto.description?.trim() ?? "",
        isFree,
        price: isFree ? null : (dto.price ?? null),
      })
      .returning({ id: listings.id });
    if (dto.imageUrls?.length) {
      await this.db.insert(listingImages).values(
        dto.imageUrls.slice(0, 10).map((url, position) => ({ listingId: row.id, url, position })),
      );
    }
    return this.get(row.id);
  }

  async setStatus(userId: string, id: string, status: ListingStatus) {
    const listing = await this.db.query.listings.findFirst({ where: eq(listings.id, id) });
    if (!listing) throw new NotFoundException("E'lon topilmadi");
    if (listing.sellerId !== userId) throw new ForbiddenException("Bu e'lon sizniki emas");
    await this.db.update(listings).set({ status }).where(eq(listings.id, id));
    return this.get(id);
  }
}
