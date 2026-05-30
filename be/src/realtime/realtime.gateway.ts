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

export const REALTIME_EVENT_NAMES = {
  MaintenanceBlocksChanged: "maintenance-blocks:changed",
  RoomsChanged: "rooms:changed",
  RoomTypesChanged: "room-types:changed",
  StaffUsersChanged: "staff-users:changed",
} as const;

export type RealtimeEventName =
  (typeof REALTIME_EVENT_NAMES)[keyof typeof REALTIME_EVENT_NAMES];

export type RealtimeMutationAction =
  | "cancelled"
  | "created"
  | "deactivated"
  | "updated";

export type RealtimeMutationPayload = {
  action: RealtimeMutationAction;
  entity: "maintenance-block" | "room" | "room-type" | "staff-user";
  id: string;
  timestamp: string;
};

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
  private server?: Server;

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
    if (!this.server) {
      return {
        event: "room:message:ack",
        data: {
          delivered: false,
        },
      };
    }

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
    if (!this.server) {
      this.logger.warn(`Socket event skipped before gateway init: ${event}`);
      return;
    }

    this.server.emit(event, payload);
  }

  emitMutationEvent(
    event: RealtimeEventName,
    payload: Omit<RealtimeMutationPayload, "timestamp">,
  ): void {
    this.emitToAll<RealtimeMutationPayload>(event, {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }
}
