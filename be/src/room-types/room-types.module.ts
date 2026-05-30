import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { AdminRoomTypesController } from "./admin-room-types.controller";
import { RoomTypesController } from "./room-types.controller";
import { RoomType, RoomTypeSchema } from "./schemas/room-type.schema";
import { RoomTypesService } from "./services";

@Module({
  imports: [
    AuthModule,
    RealtimeModule,
    MongooseModule.forFeature([
      {
        name: RoomType.name,
        schema: RoomTypeSchema,
      },
    ]),
  ],
  controllers: [AdminRoomTypesController, RoomTypesController],
  providers: [RoomTypesService],
  exports: [RoomTypesService],
})
export class RoomTypesModule {}
