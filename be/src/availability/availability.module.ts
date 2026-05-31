import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import {
  MaintenanceBlock,
  MaintenanceBlockSchema,
} from "../maintenance-blocks/schemas";
import { Reservation, ReservationSchema } from "../reservations/schemas";
import {
  RoomType,
  RoomTypeSchema,
} from "../room-types/schemas/room-type.schema";
import { Room, RoomSchema } from "../rooms/schemas";
import { AvailabilityController } from "./availability.controller";
import { AvailabilityService } from "./services";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: RoomType.name,
        schema: RoomTypeSchema,
      },
      {
        name: Room.name,
        schema: RoomSchema,
      },
      {
        name: Reservation.name,
        schema: ReservationSchema,
      },
      {
        name: MaintenanceBlock.name,
        schema: MaintenanceBlockSchema,
      },
    ]),
  ],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}

export default AvailabilityModule;
