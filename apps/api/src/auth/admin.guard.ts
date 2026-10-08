import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { Db } from "../db/client";
import { InjectDb } from "../db/db.module";
import { users } from "../db/schema";

/** JwtGuard'dan keyin ishlatiladi — req.user.sub ni talab qiladi */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(@InjectDb() private db: Db) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const userId = req.user?.sub;
    if (!userId) throw new ForbiddenException();
    const user = await this.db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user?.isAdmin) throw new ForbiddenException("Faqat administrator uchun");
    return true;
  }
}
