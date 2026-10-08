import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { and, eq, or, sql } from "drizzle-orm";
import type { Db } from "../db/client";
import { InjectDb } from "../db/db.module";
import { chatRooms, listings, reviews, users } from "../db/schema";

const MIN_TEMP = 0;
const MAX_TEMP = 99;
const BASE_TEMP = 36.5;

/** Daangn'dagi "mahalla harorati" formulasi (docs/01-product.md §6) */
function ratingDelta(rating: number): number {
  switch (rating) {
    case 5:
      return 0.4;
    case 4:
      return 0.2;
    case 3:
      return 0;
    case 2:
      return -0.3;
    case 1:
      return -0.6;
    default:
      return 0;
  }
}

@Injectable()
export class ReviewsService {
  constructor(@InjectDb() private db: Db) {}

  /** Haroratni reviewlar yig'indisidan qayta hisoblaydi (drift bo'lmasligi uchun doim qaytadan) */
  private async recalcTemperature(userId: string) {
    const rows = await this.db.select({ rating: reviews.rating }).from(reviews).where(eq(reviews.targetId, userId));
    const sum = rows.reduce((acc, r) => acc + ratingDelta(r.rating), 0);
    const temperature = Math.min(MAX_TEMP, Math.max(MIN_TEMP, BASE_TEMP + sum));
    await this.db.update(users).set({ temperature }).where(eq(users.id, userId));
    return temperature;
  }

  async create(reviewerId: string, listingId: string, dto: { targetId: string; rating: number; text?: string }) {
    if (reviewerId === dto.targetId) throw new ForbiddenException("O'zingizga baho berolmaysiz");

    const listing = await this.db.query.listings.findFirst({ where: eq(listings.id, listingId) });
    if (!listing) throw new NotFoundException("E'lon topilmadi");
    if (listing.status !== "SOLD") throw new BadRequestException("Faqat sotilgan e'longa baho berish mumkin");

    const room = await this.db.query.chatRooms.findFirst({
      where: and(
        eq(chatRooms.listingId, listingId),
        or(
          and(eq(chatRooms.buyerId, reviewerId), eq(chatRooms.sellerId, dto.targetId)),
          and(eq(chatRooms.buyerId, dto.targetId), eq(chatRooms.sellerId, reviewerId)),
        ),
      ),
    });
    if (!room) throw new ForbiddenException("Siz bu bitimda qatnashmagansiz");

    try {
      const [row] = await this.db
        .insert(reviews)
        .values({ listingId, reviewerId, targetId: dto.targetId, rating: dto.rating, text: dto.text })
        .returning();
      const temperature = await this.recalcTemperature(dto.targetId);
      return { ...row, targetTemperature: Math.round(temperature * 10) / 10 };
    } catch (e: unknown) {
      const pgCode = (e as { cause?: { code?: string } })?.cause?.code;
      if (pgCode === "23505") {
        throw new ConflictException("Siz bu e'longa allaqachon baho bergansiz");
      }
      throw e;
    }
  }

  async listForUser(userId: string) {
    const rows = await this.db
      .select({
        id: reviews.id,
        listingId: reviews.listingId,
        rating: reviews.rating,
        text: reviews.text,
        createdAt: reviews.createdAt,
        reviewerId: reviews.reviewerId,
        reviewerName: users.name,
        listingTitle: listings.title,
      })
      .from(reviews)
      .innerJoin(users, eq(users.id, reviews.reviewerId))
      .innerJoin(listings, eq(listings.id, reviews.listingId))
      .where(eq(reviews.targetId, userId))
      .orderBy(sql`${reviews.createdAt} desc`);
    return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), reviewerName: r.reviewerName ?? "Foydalanuvchi" }));
  }
}
