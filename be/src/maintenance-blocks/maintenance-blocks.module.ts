import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { Room, RoomSchema } from "../rooms/schemas";
import { MaintenanceBlocksController } from "./maintenance-blocks.controller";
import {
  MaintenanceBlock,
  MaintenanceBlockSchema,
} from "./schemas";
import { MaintenanceBlocksService } from "./services";

@Module({
  imports: [
    AuthModule,
    RealtimeModule,
    MongooseModule.forFeature([
      {
        name: MaintenanceBlock.name,
        schema: MaintenanceBlockSchema,
      },
      {
        name: Room.name,
        schema: RoomSchema,
      },
    ]),
  ],
  controllers: [MaintenanceBlocksController],
  providers: [MaintenanceBlocksService],
  exports: [MaintenanceBlocksService],
})
export class MaintenanceBlocksModule {}
