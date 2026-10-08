import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { randomInt } from 'crypto';
import { eq } from 'drizzle-orm';
import type { Db } from '../db/client';
import { InjectDb } from '../db/db.module';
import { users } from '../db/schema';

const OTP_TTL = 300; // soniya
const OTP_COOLDOWN = 60;

@Injectable()
export class AuthService {
  private log = new Logger(AuthService.name);
  private redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', { lazyConnect: true });

  constructor(@InjectDb() private db: Db, private jwt: JwtService) {}

  static normalizePhone(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    const full = digits.length === 9 ? `998${digits}` : digits;
    if (!/^998\d{9}$/.test(full)) throw new BadRequestException("Telefon raqami noto'g'ri");
    return `+${full}`;
  }

  async requestOtp(rawPhone: string) {
    const phone = AuthService.normalizePhone(rawPhone);
    const cool = await this.redis.set(`otp:cool:${phone}`, '1', 'EX', OTP_COOLDOWN, 'NX');
    if (!cool) throw new BadRequestException("Kodni qayta so'rash uchun biroz kuting");
    const code = process.env.NODE_ENV === 'production' ? String(randomInt(100000, 999999)) : '123456';
    await this.redis.set(`otp:${phone}`, code, 'EX', OTP_TTL);
    // TODO: Eskiz.uz SMS provayderi (BullMQ navbati orqali)
    this.log.log(`OTP ${phone} -> ${process.env.NODE_ENV === 'production' ? '***' : code}`);
    return { ok: true, ttl: OTP_TTL };
  }

  async verifyOtp(rawPhone: string, code: string) {
    const phone = AuthService.normalizePhone(rawPhone);
    const saved = await this.redis.get(`otp:${phone}`);
    if (!saved || saved !== code) throw new BadRequestException("Kod noto'g'ri yoki muddati o'tgan");
    await this.redis.del(`otp:${phone}`);
    const [user] = await this.db
      .insert(users)
      .values({ phone })
      .onConflictDoUpdate({ target: users.phone, set: { phone } })
      .returning();
    if (user.isBlocked) throw new BadRequestException('Hisob bloklangan');
    const accessToken = await this.jwt.signAsync({ sub: user.id });
    return { accessToken, user };
  }

  async me(userId: string) {
    return this.db.query.users.findFirst({ where: eq(users.id, userId) });
  }

  async updateMe(userId: string, data: { name?: string; regionId?: number }) {
    const [user] = await this.db.update(users).set(data).where(eq(users.id, userId)).returning();
    return user;
  }
}
