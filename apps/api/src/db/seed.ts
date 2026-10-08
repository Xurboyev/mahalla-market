/**
 * Boshlang'ich ma'lumotlarni yozadi. Qayta ishga tushirsa ham xavfsiz (idempotent).
 *   npm run db:seed          — hududlar va kategoriyalar
 *   npm run db:seed:demo     — + namunaviy foydalanuvchi va e'lonlar (faqat dev)
 */
import "dotenv/config";
import { and, eq, isNull, sql } from "drizzle-orm";
import { createDb, type Db } from "./client";
import { categories, listings, regions, users } from "./schema";
import { DEMO, KATEGORIYALAR, PILOT_MAHALLALAR, TOSHKENT_TUMANLARI, VILOYATLAR } from "./seed-data";

async function upsertRegion(
  db: Db,
  r: { soato?: string; name: string; nameRu?: string; level: "VILOYAT" | "TUMAN" | "MFY"; parentId?: number; lat?: number; lng?: number },
): Promise<number> {
  if (r.soato) {
    const [row] = await db
      .insert(regions)
      .values(r)
      .onConflictDoUpdate({ target: regions.soato, set: { name: r.name, nameRu: r.nameRu, lat: r.lat, lng: r.lng } })
      .returning({ id: regions.id });
    return row.id;
  }
  // SOATO'siz yozuvlar: ota + nom bo'yicha qidiramiz
  const parentCond = r.parentId ? eq(regions.parentId, r.parentId) : isNull(regions.parentId);
  const existing = await db.query.regions.findFirst({ where: and(eq(regions.name, r.name), parentCond) });
  if (existing) return existing.id;
  const [row] = await db.insert(regions).values(r).returning({ id: regions.id });
  return row.id;
}

export async function seed(db: Db, { demo = false } = {}) {
  // 1) Hududlar
  const viloyatIds = new Map<string, number>();
  for (const v of VILOYATLAR) {
    viloyatIds.set(v.soato, await upsertRegion(db, { ...v, level: "VILOYAT" }));
  }
  const toshkentId = viloyatIds.get("1726")!;
  const tumanIds = new Map<string, number>();
  for (const t of TOSHKENT_TUMANLARI) {
    tumanIds.set(t.name, await upsertRegion(db, { ...t, level: "TUMAN", parentId: toshkentId }));
  }
  const pilotTumanId = tumanIds.get(PILOT_MAHALLALAR.tuman)!;
  const mahallaIds = new Map<string, number>();
  for (const m of PILOT_MAHALLALAR.items) {
    mahallaIds.set(m.name, await upsertRegion(db, { ...m, level: "MFY", parentId: pilotTumanId }));
  }

  // 2) Kategoriyalar
  for (const [i, c] of KATEGORIYALAR.entries()) {
    await db
      .insert(categories)
      .values({ ...c, position: i })
      .onConflictDoUpdate({ target: categories.slug, set: { name: c.name, nameRu: c.nameRu, position: i } });
  }

  const counts = await db.execute<{ regions: number; categories: number }>(
    sql`select (select count(*) from regions)::int as regions, (select count(*) from categories)::int as categories`,
  );
  console.log("✔ hududlar va kategoriyalar:", counts.rows[0]);

  if (!demo) return;

  // 3) Demo foydalanuvchilar va e'lonlar
  const cats = new Map((await db.select().from(categories)).map((c) => [c.slug, c.id]));
  const userIds = new Map<string, { id: string; regionId: number }>();
  for (const u of DEMO.users) {
    const regionId = mahallaIds.get(u.mahalla)!;
    const [row] = await db
      .insert(users)
      .values({ phone: u.phone, name: u.name, temperature: u.temperature, regionId })
      .onConflictDoUpdate({ target: users.phone, set: { name: u.name, temperature: u.temperature, regionId } })
      .returning({ id: users.id });
    userIds.set(u.phone, { id: row.id, regionId });
  }
  const demoSellerIds = [...userIds.values()].map((u) => u.id);
  await db.delete(listings).where(sql`${listings.sellerId} in ${demoSellerIds}`);
  for (const l of DEMO.listings) {
    const seller = userIds.get(l.seller)!;
    await db.insert(listings).values({
      sellerId: seller.id,
      regionId: seller.regionId,
      categoryId: cats.get(l.category)!,
      title: l.title,
      description: l.description,
      price: l.price,
      isFree: l.isFree,
      status: l.status,
      createdAt: new Date(Date.now() - l.minutesAgo * 60_000),
    });
  }
  console.log(`✔ demo: ${DEMO.users.length} foydalanuvchi, ${DEMO.listings.length} e'lon`);
}

if (require.main === module) {
  const { db, pool } = createDb();
  seed(db, { demo: process.argv.includes("--demo") })
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
