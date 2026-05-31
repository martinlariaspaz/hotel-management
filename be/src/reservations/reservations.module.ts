import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AvailabilityModule } from "../availability/availability.module";
import { Guest, GuestSchema } from "../guests/schemas";
import {
  RoomType,
  RoomTypeSchema,
} from "../room-types/schemas/room-type.schema";
import { ReservationsController } from "./reservations.controller";
import { Reservation, ReservationSchema } from "./schemas";
import { ReservationsService } from "./services";

@Module({
  imports: [
    AvailabilityModule,
    MongooseModule.forFeature([
      {
        name: Reservation.name,
        schema: ReservationSchema,
      },
      {
        name: Guest.name,
        schema: GuestSchema,
      },
      {
        name: RoomType.name,
        schema: RoomTypeSchema,
      },
    ]),
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [MongooseModule, ReservationsService],
})
export class ReservationsModule {}
