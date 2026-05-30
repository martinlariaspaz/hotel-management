import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type RoomTypeDocument = HydratedDocument<RoomType> & {
  _id: Types.ObjectId;
};

@Schema({
  collection: "roomTypes",
  timestamps: true,
})
export class RoomType {
  @Prop({ required: true, trim: true, unique: true, index: true })
  name: string;

  @Prop({ required: true, min: 1 })
  capacity: number;

  @Prop({ required: true, default: [] })
  amenities: string[];

  @Prop({ required: true, default: [] })
  photoUrls: string[];

  @Prop({ required: true, min: 1 })
  baseNightlyRate: number;

  @Prop({ required: true, default: true, index: true })
  isActive: boolean;
}

export const RoomTypeSchema = SchemaFactory.createForClass(RoomType);

RoomTypeSchema.path("amenities").set(function normalizeAmenities(
  amenities: string[],
) {
  return amenities
    .map((amenity) => amenity.trim())
    .filter((amenity) => amenity.length > 0);
});

RoomTypeSchema.path("photoUrls").set(function normalizePhotoUrls(
  photoUrls: string[],
) {
  return photoUrls
    .map((photoUrl) => photoUrl.trim())
    .filter((photoUrl) => photoUrl.length > 0);
});

