import { Module } from "@nestjs/common";
import { AdminGuard } from "../auth/admin.guard";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";

@Module({ controllers: [ReportsController], providers: [ReportsService, AdminGuard], exports: [ReportsService] })
export class ReportsModule {}
