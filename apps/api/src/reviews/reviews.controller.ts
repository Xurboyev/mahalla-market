import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from "@nestjs/common";
import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from "class-validator";
import { JwtGuard } from "../auth/jwt.guard";
import { ReviewsService } from "./reviews.service";

class CreateReviewDto {
  @IsUUID() targetId: string;
  @IsInt() @Min(1) @Max(5) rating: number;
  @IsOptional() @IsString() @MaxLength(1000) text?: string;
}

type AuthReq = { user: { sub: string } };

@Controller()
export class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  @Post("listings/:id/reviews")
  @UseGuards(JwtGuard)
  create(@Req() req: AuthReq, @Param("id", ParseUUIDPipe) listingId: string, @Body() dto: CreateReviewDto) {
    return this.reviews.create(req.user.sub, listingId, dto);
  }

  @Get("users/:id/reviews")
  list(@Param("id", ParseUUIDPipe) userId: string) {
    return this.reviews.listForUser(userId);
  }
}
