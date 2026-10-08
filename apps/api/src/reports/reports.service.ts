import { Injectable, NotFoundException } from "@nestjs/common";
import { desc, eq } from "drizzle-orm";
import type { Db } from "../db/client";
import { InjectDb } from "../db/db.module";
import { reports, type reportStatus } from "../db/schema";

export type ReportTargetType = "LISTING" | "USER" | "MESSAGE";
export type ReportStatus = (typeof reportStatus.enumValues)[number];

@Injectable()
export class ReportsService {
  constructor(@InjectDb() private db: Db) {}

  create(reporterId: string, dto: { targetType: ReportTargetType; targetId: string; reason: string }) {
    return this.db
      .insert(reports)
      .values({ reporterId, targetType: dto.targetType, targetId: dto.targetId, reason: dto.reason })
      .returning();
  }

  list(status?: ReportStatus) {
    return this.db.query.reports.findMany({
      where: status ? eq(reports.status, status) : undefined,
      orderBy: desc(reports.createdAt),
      limit: 200,
    });
  }

  async updateStatus(id: string, status: ReportStatus) {
    const existing = await this.db.query.reports.findFirst({ where: eq(reports.id, id) });
    if (!existing) throw new NotFoundException("Shikoyat topilmadi");
    const [row] = await this.db.update(reports).set({ status }).where(eq(reports.id, id)).returning();
    return row;
  }
}
