import { relations } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  serial,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const regionLevel = pgEnum("region_level", ["VILOYAT", "TUMAN", "MFY"]);
export const listingStatus = pgEnum("listing_status", ["ACTIVE", "RESERVED", "SOLD", "HIDDEN"]);
export const reportStatus = pgEnum("report_status", ["OPEN", "RESOLVED", "REJECTED"]);

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

/** Viloyat → tuman/shahar → MFY (mahalla) daraxti */
export const regions = pgTable(
  "regions",
  {
    id: serial("id").primaryKey(),
    soato: varchar("soato", { length: 16 }).unique(), // Davlat SOATO kodi (import kaliti)
    name: text("name").notNull(),
    nameRu: text("name_ru"),
    level: regionLevel("level").notNull(),
    parentId: integer("parent_id").references((): AnyPgColumn => regions.id),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
  },
  (t) => [index("regions_parent_idx").on(t.parentId), index("regions_level_idx").on(t.level)],
);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: varchar("phone", { length: 16 }).notNull().unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  regionId: integer("region_id").references(() => regions.id),
  temperature: real("temperature").notNull().default(36.5), // Mahalla harorati
  isBlocked: boolean("is_blocked").notNull().default(false),
  createdAt: createdAt(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: text("name").notNull(),
  nameRu: text("name_ru"),
  position: smallint("position").notNull().default(0),
});

export const listings = pgTable(
  "listings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => users.id),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    regionId: integer("region_id")
      .notNull()
      .references(() => regions.id),
    title: varchar("title", { length: 120 }).notNull(),
    description: text("description").notNull().default(""),
    price: integer("price"), // so'm; null + isFree = tekin
    isFree: boolean("is_free").notNull().default(false),
    status: listingStatus("status").notNull().default("ACTIVE"),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    viewCount: integer("view_count").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("listings_feed_idx").on(t.regionId, t.status, t.createdAt),
    index("listings_category_idx").on(t.categoryId),
    index("listings_seller_idx").on(t.sellerId),
  ],
);

export const listingImages = pgTable("listing_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  position: smallint("position").notNull().default(0),
});

export const favorites = pgTable(
  "favorites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.listingId] })],
);

export const chatRooms = pgTable(
  "chat_rooms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    buyerId: uuid("buyer_id")
      .notNull()
      .references(() => users.id),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => users.id),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("chat_rooms_listing_buyer_uq").on(t.listingId, t.buyerId)],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roomId: uuid("room_id")
      .notNull()
      .references(() => chatRooms.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id),
    body: text("body").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("messages_room_idx").on(t.roomId, t.createdAt)],
);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id),
    reviewerId: uuid("reviewer_id")
      .notNull()
      .references(() => users.id),
    targetId: uuid("target_id")
      .notNull()
      .references(() => users.id),
    rating: smallint("rating").notNull(), // 1..5
    text: text("text"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("reviews_listing_reviewer_uq").on(t.listingId, t.reviewerId)],
);

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reporterId: uuid("reporter_id")
    .notNull()
    .references(() => users.id),
  targetType: varchar("target_type", { length: 16 }).notNull(), // LISTING | USER | MESSAGE
  targetId: text("target_id").notNull(),
  reason: text("reason").notNull(),
  status: reportStatus("status").notNull().default("OPEN"),
  createdAt: createdAt(),
});

// ---- relations (db.query.* uchun) ----
export const regionsRelations = relations(regions, ({ one, many }) => ({
  parent: one(regions, { fields: [regions.parentId], references: [regions.id], relationName: "tree" }),
  children: many(regions, { relationName: "tree" }),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  seller: one(users, { fields: [listings.sellerId], references: [users.id] }),
  region: one(regions, { fields: [listings.regionId], references: [regions.id] }),
  category: one(categories, { fields: [listings.categoryId], references: [categories.id] }),
  images: many(listingImages),
}));

export const listingImagesRelations = relations(listingImages, ({ one }) => ({
  listing: one(listings, { fields: [listingImages.listingId], references: [listings.id] }),
}));
