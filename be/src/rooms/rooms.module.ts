import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { RealtimeModule } from "../realtime/realtime.module";
import {
  RoomType,
  RoomTypeSchema,
} from "../room-types/schemas/room-type.schema";
import { RoomsController } from "./rooms.controller";
import { Room, RoomSchema } from "./schemas";
import { RoomsService } from "./services";

@Module({
  imports: [
    AuthModule,
    RealtimeModule,
    MongooseModule.forFeature([
      {
        name: Room.name,
        schema: RoomSchema,
      },
      {
        name: RoomType.name,
        schema: RoomTypeSchema,
      },
    ]),
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
