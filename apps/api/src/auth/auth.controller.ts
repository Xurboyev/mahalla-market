import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { IsInt, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { JwtGuard } from './jwt.guard';
import { AuthService } from './auth.service';

class RequestOtpDto {
  @IsString() phone: string;
}
class VerifyOtpDto {
  @IsString() phone: string;
  @IsString() @Length(6, 6) code: string;
}

class UpdateMeDto {
  @IsOptional() @IsString() @MaxLength(40) name?: string;
  /** Tanlangan mahalla (MFY) */
  @IsOptional() @IsInt() regionId?: number;
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('otp/request')
  request(@Body() dto: RequestOtpDto) {
    return this.auth.requestOtp(dto.phone);
  }

  @Post('otp/verify')
  verify(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto.phone, dto.code);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  me(@Req() req: { user: { sub: string } }) {
    return this.auth.me(req.user.sub);
  }

  @Patch('me')
  @UseGuards(JwtGuard)
  updateMe(@Req() req: { user: { sub: string } }, @Body() dto: UpdateMeDto) {
    return this.auth.updateMe(req.user.sub, dto);
  }
}
