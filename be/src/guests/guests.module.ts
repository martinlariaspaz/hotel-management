import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Guest, GuestSchema } from "./schemas";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Guest.name,
        schema: GuestSchema,
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class GuestsModule {}
