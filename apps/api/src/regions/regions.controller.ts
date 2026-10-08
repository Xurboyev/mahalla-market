import { Controller, Get, NotFoundException, Param, ParseIntPipe, Query } from "@nestjs/common";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, MinLength } from "class-validator";
import { and, asc, eq, ilike, isNull } from "drizzle-orm";
import type { Db } from "../db/client";
import { InjectDb } from "../db/db.module";
import { regions } from "../db/schema";

class RegionsQuery {
  /** Berilmasa — viloyatlar ro'yxati */
  @IsOptional() @Type(() => Number) @IsInt() parentId?: number;
  /** Nomi bo'yicha qidiruv (mahalla tanlash ekrani uchun) */
  @IsOptional() @IsString() @MinLength(2) q?: string;
}

@Controller("regions")
export class RegionsController {
  constructor(@InjectDb() private db: Db) {}

  @Get()
  list(@Query() q: RegionsQuery) {
    const where = q.q
      ? ilike(regions.name, `%${q.q}%`)
      : q.parentId
        ? eq(regions.parentId, q.parentId)
        : isNull(regions.parentId);
    return this.db.select().from(regions).where(and(where)).orderBy(asc(regions.name)).limit(q.q ? 30 : 500);
  }

  @Get(":id")
  async get(@Param("id", ParseIntPipe) id: number) {
    const region = await this.db.query.regions.findFirst({
      where: eq(regions.id, id),
      with: { parent: { with: { parent: true } } },
    });
    if (!region) throw new NotFoundException("Hudud topilmadi");
    return region;
  }
}
