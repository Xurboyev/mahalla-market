import { Global, Inject, Module, type OnApplicationShutdown } from "@nestjs/common";
import type { Pool } from "pg";
import { createDb, type Db } from "./client";

export const DB = Symbol("DB");
export const PG_POOL = Symbol("PG_POOL");
/** Controller/servislarda: `constructor(@InjectDb() private db: Db)` */
export const InjectDb = () => Inject(DB);

@Global()
@Module({
  providers: [
    // Ulanish modul yuklanganda emas, Nest konteyneri ishga tushganda yaratiladi (testlar uchun muhim)
    { provide: PG_POOL, useFactory: () => createDb().pool },
    { provide: DB, inject: [PG_POOL], useFactory: (pool: Pool): Db => createDb.fromPool(pool) },
  ],
  exports: [DB, PG_POOL],
})
export class DbModule implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private pool: Pool) {}
  async onApplicationShutdown() {
    await this.pool.end();
  }
}
