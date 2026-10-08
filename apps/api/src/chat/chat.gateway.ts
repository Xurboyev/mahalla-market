import { Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";

type AuthedSocket = Socket & { data: { userId: string } };

/**
 * Chat real vaqt kanali. Ulanishda JWT token (handshake.auth.token) tekshiriladi.
 * Xona nomi = chatRooms.id (Socket.IO "room" sifatida ishlatiladi).
 */
@WebSocketGateway({ cors: { origin: (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(",") } })
export class ChatGateway implements OnGatewayConnection {
  private log = new Logger(ChatGateway.name);

  @WebSocketServer() server: Server;

  constructor(private jwt: JwtService, private chat: ChatService) {}

  async handleConnection(socket: Socket) {
    try {
      const token = (socket.handshake.auth?.token as string) ?? "";
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      (socket as AuthedSocket).data.userId = payload.sub;
    } catch {
      socket.emit("error", "Unauthorized");
      socket.disconnect();
    }
  }

  @SubscribeMessage("room:join")
  async joinRoom(@ConnectedSocket() socket: AuthedSocket, @MessageBody() data: { roomId: string }) {
    // assertMember orqali tekshiriladi (sendMessage/getHistory ichida); bu yerda faqat xonaga qo'shamiz
    await socket.join(data.roomId);
    return { ok: true };
  }

  @SubscribeMessage("message:send")
  async sendMessage(@ConnectedSocket() socket: AuthedSocket, @MessageBody() data: { roomId: string; body: string }) {
    if (!socket.data?.userId) throw new UnauthorizedException();
    const message = await this.chat.sendMessage(socket.data.userId, data.roomId, data.body);
    this.server.to(data.roomId).emit("message:new", message);
    return message;
  }

  @SubscribeMessage("room:read")
  async markRead(@ConnectedSocket() socket: AuthedSocket, @MessageBody() data: { roomId: string }) {
    if (!socket.data?.userId) throw new UnauthorizedException();
    await this.chat.markRead(socket.data.userId, data.roomId);
    this.server.to(data.roomId).emit("room:read", { roomId: data.roomId, by: socket.data.userId });
    return { ok: true };
  }
}
