import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { IsIn } from "class-validator";
import { JwtGuard } from "../auth/jwt.guard";
import { UploadsService } from "./uploads.service";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"] as const;

class PresignDto {
  @IsIn(ALLOWED) contentType: string;
}

@Controller("uploads")
export class UploadsController {
  constructor(private uploads: UploadsService) {}

  @Post("presign")
  @UseGuards(JwtGuard)
  presign(@Req() req: { user: { sub: string } }, @Body() dto: PresignDto) {
    return this.uploads.createPresignedUpload(req.user.sub, dto.contentType);
  }
}
