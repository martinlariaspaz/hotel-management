import { Body, Controller, Post } from "@nestjs/common";
import { CreatePublicReservationDto } from "./dto";
import { ReservationsService } from "./services";
import type { PublicReservationResponse } from "./types";

@Controller("reservations")
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post("public")
  createPublicReservation(
    @Body() dto: CreatePublicReservationDto,
  ): Promise<PublicReservationResponse> {
    return this.reservationsService.createPublicReservation(dto);
  }
}

export default ReservationsController;
