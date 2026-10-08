import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Db = NodePgDatabase<typeof schema>;

const fromPool = (pool: Pool): Db => drizzle(pool, { schema, casing: "snake_case" });

export function createDb(url = process.env.DATABASE_URL): { db: Db; pool: Pool } {
  if (!url) throw new Error("DATABASE_URL o'rnatilmagan");
  const pool = new Pool({ connectionString: url, max: Number(process.env.DB_POOL_MAX ?? 10) });
  return { db: fromPool(pool), pool };
}
createDb.fromPool = fromPool;
