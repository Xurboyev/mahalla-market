import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { IsUUID } from "class-validator";
import { JwtGuard } from "../auth/jwt.guard";
import { ChatService } from "./chat.service";

class OpenRoomDto {
  @IsUUID() listingId: string;
}

type AuthReq = { user: { sub: string } };

@Controller("chat")
@UseGuards(JwtGuard)
export class ChatController {
  constructor(private chat: ChatService) {}

  @Post("rooms")
  open(@Req() req: AuthReq, @Body() dto: OpenRoomDto) {
    return this.chat.openRoom(req.user.sub, dto.listingId);
  }

  @Get("rooms")
  list(@Req() req: AuthReq) {
    return this.chat.listRooms(req.user.sub);
  }

  @Get("rooms/:id/messages")
  history(@Req() req: AuthReq, @Param("id", ParseUUIDPipe) id: string) {
    return this.chat.getHistory(req.user.sub, id);
  }

  @Patch("rooms/:id/read")
  read(@Req() req: AuthReq, @Param("id", ParseUUIDPipe) id: string) {
    return this.chat.markRead(req.user.sub, id);
  }
}
