import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { ROOM_STATUS_VALUES, RoomStatus } from "../../common/enums";
import { RoomType } from "../../room-types/schemas/room-type.schema";

export type RoomDocument = HydratedDocument<Room> & {
  _id: Types.ObjectId;
};

@Schema({
  collection: "rooms",
  timestamps: true,
})
export class Room {
  @Prop({ required: true, trim: true, unique: true, index: true })
  roomNumber: string;

  @Prop({
    type: Types.ObjectId,
    ref: RoomType.name,
    required: true,
    index: true,
  })
  roomType: Types.ObjectId;

  @Prop({ trim: true, index: true })
  floor?: string;

  @Prop({ trim: true })
  notes?: string;

  @Prop({
    required: true,
    enum: ROOM_STATUS_VALUES,
    default: RoomStatus.Available,
    index: true,
  })
  status: RoomStatus;
}

export const RoomSchema = SchemaFactory.createForClass(Room);

RoomSchema.path("floor").set(function normalizeOptionalString(
  value: string | undefined,
) {
  if (typeof value !== "string") {
    return value;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : undefined;
});

RoomSchema.path("notes").set(function normalizeOptionalString(
  value: string | undefined,
) {
  if (typeof value !== "string") {
    return value;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : undefined;
});

