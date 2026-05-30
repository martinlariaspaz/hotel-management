import { Logger } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { RoomMessageDto } from "./dto/room-message.dto";
import { RoomDto } from "./dto/room.dto";

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : true;

@WebSocketGateway({
  namespace: "realtime",
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  afterInit(): void {
    this.logger.log("Realtime gateway initialized");
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Socket connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Socket disconnected: ${client.id}`);
  }

  @SubscribeMessage("ping")
  handlePing(): WsResponse<{ timestamp: string }> {
    return {
      event: "pong",
      data: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @SubscribeMessage("room:join")
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RoomDto,
  ): Promise<WsResponse<{ room: string }>> {
    await client.join(payload.room);

    return {
      event: "room:joined",
      data: {
        room: payload.room,
      },
    };
  }

  @SubscribeMessage("room:leave")
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RoomDto,
  ): Promise<WsResponse<{ room: string }>> {
    await client.leave(payload.room);

    return {
      event: "room:left",
      data: {
        room: payload.room,
      },
    };
  }

  @SubscribeMessage("room:message")
  handleRoomMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RoomMessageDto,
  ): WsResponse<{ delivered: boolean }> {
    this.server.to(payload.room).emit("room:message", {
      room: payload.room,
      clientId: client.id,
      message: payload.message,
      metadata: payload.metadata,
      timestamp: new Date().toISOString(),
    });

    return {
      event: "room:message:ack",
      data: {
        delivered: true,
      },
    };
  }

  emitToAll<TPayload>(event: string, payload: TPayload): void {
    this.server.emit(event, payload);
  }
}
