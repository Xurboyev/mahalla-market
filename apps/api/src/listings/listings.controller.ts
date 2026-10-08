import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { JwtGuard } from "../auth/jwt.guard";
import { ListingsService, type ListingStatus } from "./listings.service";

class CreateListingDto {
  @IsString() @MinLength(3) @MaxLength(120) title: string;
  @IsOptional() @IsString() @MaxLength(5000) description?: string;
  @IsInt() categoryId: number;
  /** Berilmasa — sotuvchining mahallasi */
  @IsOptional() @IsInt() regionId?: number;
  @IsOptional() @IsInt() @Min(0) @Max(2_000_000_000) price?: number;
  @IsOptional() @IsBoolean() isFree?: boolean;
  /** /uploads/presign orqali olingan publicUrl'lar, tartib bo'yicha */
  @IsOptional() @IsArray() @ArrayMaxSize(10) @IsUrl({ require_tld: false }, { each: true }) imageUrls?: string[];
}

class StatusDto {
  @IsIn(["ACTIVE", "RESERVED", "SOLD", "HIDDEN"]) status: ListingStatus;
}

class ListQuery {
  /** Mahalla, tuman yoki viloyat — ichidagi barcha hududlar bilan */
  @IsOptional() @Type(() => Number) @IsInt() regionId?: number;
  @IsOptional() @Type(() => Number) @IsInt() categoryId?: number;
  @IsOptional() @IsString() @MaxLength(100) q?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
}

type AuthReq = { user: { sub: string } };

@Controller("listings")
export class ListingsController {
  constructor(private listings: ListingsService) {}

  @Get()
  list(@Query() q: ListQuery) {
    return this.listings.list(q);
  }

  @Get(":id")
  get(@Param("id", ParseUUIDPipe) id: string) {
    return this.listings.get(id);
  }

  @Post()
  @UseGuards(JwtGuard)
  create(@Req() req: AuthReq, @Body() dto: CreateListingDto) {
    return this.listings.create(req.user.sub, dto);
  }

  @Patch(":id/status")
  @UseGuards(JwtGuard)
  setStatus(@Req() req: AuthReq, @Param("id", ParseUUIDPipe) id: string, @Body() dto: StatusDto) {
    return this.listings.setStatus(req.user.sub, id, dto.status);
  }
}
