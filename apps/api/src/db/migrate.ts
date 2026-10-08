/**
 * Production'da migratsiyalarni qo'llash (drizzle-kit'siz, faqat drizzle-orm).
 *   node dist/db/migrate.js
 */
import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { join } from "node:path";
import { createDb } from "./client";

async function main() {
  const { db, pool } = createDb();
  try {
    await migrate(db, { migrationsFolder: join(__dirname, "../../drizzle") });
    console.log("✔ migratsiyalar qo'llandi");
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
