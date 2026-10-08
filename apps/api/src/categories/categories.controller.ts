import { Controller, Get } from "@nestjs/common";
import { asc } from "drizzle-orm";
import type { Db } from "../db/client";
import { InjectDb } from "../db/db.module";
import { categories } from "../db/schema";

@Controller("categories")
export class CategoriesController {
  constructor(@InjectDb() private db: Db) {}

  @Get()
  list() {
    return this.db.select().from(categories).orderBy(asc(categories.position));
  }
}
