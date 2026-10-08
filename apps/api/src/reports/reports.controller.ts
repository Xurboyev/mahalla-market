import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { IsIn, IsString, MaxLength, MinLength } from "class-validator";
import { AdminGuard } from "../auth/admin.guard";
import { JwtGuard } from "../auth/jwt.guard";
import { ReportsService, type ReportStatus, type ReportTargetType } from "./reports.service";

const TARGET_TYPES: ReportTargetType[] = ["LISTING", "USER", "MESSAGE"];
const STATUSES: ReportStatus[] = ["OPEN", "RESOLVED", "REJECTED"];

class CreateReportDto {
  @IsIn(TARGET_TYPES) targetType: ReportTargetType;
  @IsString() @MinLength(1) targetId: string;
  @IsString() @MinLength(3) @MaxLength(500) reason: string;
}

class StatusDto {
  @IsIn(STATUSES) status: ReportStatus;
}

type AuthReq = { user: { sub: string } };

@Controller("reports")
@UseGuards(JwtGuard)
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @Post()
  create(@Req() req: AuthReq, @Body() dto: CreateReportDto) {
    return this.reports.create(req.user.sub, dto);
  }

  /** Faqat administrator — moderatsiya navbati */
  @Get()
  @UseGuards(AdminGuard)
  list(@Query("status") status?: ReportStatus) {
    return this.reports.list(status);
  }

  @Patch(":id/status")
  @UseGuards(AdminGuard)
  setStatus(@Param("id", ParseUUIDPipe) id: string, @Body() dto: StatusDto) {
    return this.reports.updateStatus(id, dto.status);
  }
}
