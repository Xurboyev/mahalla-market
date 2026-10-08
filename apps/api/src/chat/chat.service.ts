import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { and, desc, eq, or, sql } from "drizzle-orm";
import type { Db } from "../db/client";
import { InjectDb } from "../db/db.module";
import { chatRooms, listingImages, listings, messages, users } from "../db/schema";

export type MessageDto = {
  id: string;
  roomId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

@Injectable()
export class ChatService {
  constructor(@InjectDb() private db: Db) {}

  /** Xavfsizlik ogohlantirishi — har bir chatdagi birinchi xabardan oldin ko'rsatiladi (ilova tomonida). */
  static SAFETY_NOTE =
    "Xavfsiz bitim uchun uchrashuvni gavjum, yorug' joyda belgilang. Oldindan pul o'tkazmang.";

  private async assertMember(roomId: string, userId: string) {
    const room = await this.db.query.chatRooms.findFirst({ where: eq(chatRooms.id, roomId) });
    if (!room) throw new NotFoundException("Chat topilmadi");
    if (room.buyerId !== userId && room.sellerId !== userId) throw new ForbiddenException("Sizga tegishli emas");
    return room;
  }

  /** E'lon bo'yicha chat ochadi (xaridor tomonidan). Mavjud bo'lsa — qaytaradi. */
  async openRoom(buyerId: string, listingId: string) {
    const listing = await this.db.query.listings.findFirst({ where: eq(listings.id, listingId) });
    if (!listing) throw new NotFoundException("E'lon topilmadi");
    if (listing.sellerId === buyerId) throw new ForbiddenException("O'zingiz bilan chat ocha olmaysiz");

    const existing = await this.db.query.chatRooms.findFirst({
      where: and(eq(chatRooms.listingId, listingId), eq(chatRooms.buyerId, buyerId)),
    });
    if (existing) return existing;

    const [room] = await this.db
      .insert(chatRooms)
      .values({ listingId, buyerId, sellerId: listing.sellerId })
      .returning();
    return room;
  }

  /** Foydalanuvchining barcha chatlari — oxirgi xabar va o'qilmagan soni bilan */
  async listRooms(userId: string) {
    const rows = await this.db
      .select({
        id: chatRooms.id,
        listingId: chatRooms.listingId,
        buyerId: chatRooms.buyerId,
        sellerId: chatRooms.sellerId,
        createdAt: chatRooms.createdAt,
        listingTitle: listings.title,
        listingImageUrl: sql<string | null>`(
          select ${listingImages.url} from ${listingImages}
          where ${listingImages.listingId} = ${listings.id} order by ${listingImages.position} limit 1)`,
        otherUserId: sql<string>`case when ${chatRooms.buyerId} = ${userId} then ${chatRooms.sellerId} else ${chatRooms.buyerId} end`,
        lastMessageBody: sql<string | null>`(
          select ${messages.body} from ${messages}
          where ${messages.roomId} = ${chatRooms.id} order by ${messages.createdAt} desc limit 1)`,
        lastMessageAt: sql<Date | null>`(
          select ${messages.createdAt} from ${messages}
          where ${messages.roomId} = ${chatRooms.id} order by ${messages.createdAt} desc limit 1)`,
        unreadCount: sql<number>`(
          select count(*)::int from ${messages}
          where ${messages.roomId} = ${chatRooms.id} and ${messages.senderId} != ${userId} and ${messages.readAt} is null)`,
      })
      .from(chatRooms)
      .innerJoin(listings, eq(listings.id, chatRooms.listingId))
      .where(or(eq(chatRooms.buyerId, userId), eq(chatRooms.sellerId, userId)))
      .orderBy(desc(chatRooms.createdAt));

    const otherUsers = await this.db.query.users.findMany({
      where: (u, { inArray }) => inArray(u.id, rows.map((r) => r.otherUserId)),
    });
    const byId = new Map(otherUsers.map((u) => [u.id, u]));

    return rows.map((r) => {
      const other = byId.get(r.otherUserId);
      return {
        id: r.id,
        listingId: r.listingId,
        listingTitle: r.listingTitle,
        listingImageUrl: r.listingImageUrl,
        otherUser: {
          id: r.otherUserId,
          name: other?.name ?? "Foydalanuvchi",
          temperature: other ? Math.round(other.temperature * 10) / 10 : 36.5,
          avatarUrl: other?.avatarUrl ?? null,
        },
        lastMessage: r.lastMessageBody,
        lastMessageAt: r.lastMessageAt ? new Date(r.lastMessageAt).toISOString() : r.createdAt.toISOString(),
        unreadCount: Number(r.unreadCount),
      };
    });
  }

  async getHistory(userId: string, roomId: string): Promise<MessageDto[]> {
    await this.assertMember(roomId, userId);
    const rows = await this.db.query.messages.findMany({
      where: eq(messages.roomId, roomId),
      orderBy: (m, { asc }) => asc(m.createdAt),
      limit: 100,
    });
    return rows.map((m) => ({
      id: m.id,
      roomId: m.roomId,
      senderId: m.senderId,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      readAt: m.readAt ? m.readAt.toISOString() : null,
    }));
  }

  async sendMessage(userId: string, roomId: string, body: string): Promise<MessageDto> {
    await this.assertMember(roomId, userId);
    const trimmed = body.trim().slice(0, 2000);
    if (!trimmed) throw new ForbiddenException("Bo'sh xabar yuborilmaydi");
    const [row] = await this.db
      .insert(messages)
      .values({ roomId, senderId: userId, body: trimmed })
      .returning();
    return {
      id: row.id,
      roomId: row.roomId,
      senderId: row.senderId,
      body: row.body,
      createdAt: row.createdAt.toISOString(),
      readAt: null,
    };
  }

  async markRead(userId: string, roomId: string) {
    await this.assertMember(roomId, userId);
    await this.db
      .update(messages)
      .set({ readAt: new Date() })
      .where(and(eq(messages.roomId, roomId), sql`${messages.senderId} != ${userId}`, sql`${messages.readAt} is null`));
  }
}
