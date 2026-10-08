import { Controller, Get } from "@nestjs/common";
import { sql } from "drizzle-orm";
import type { Db } from "../db/client";
import { InjectDb } from "../db/db.module";

@Controller("health")
export class HealthController {
  constructor(@InjectDb() private db: Db) {}

  @Get()
  async check() {
    await this.db.execute(sql`select 1`);
    return { status: "ok", time: new Date().toISOString() };
  }
}
