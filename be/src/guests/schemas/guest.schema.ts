import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

const GUEST_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GUEST_PHONE_PATTERN = /^\+?[1-9]\d{6,14}$/;

export type GuestDocument = HydratedDocument<Guest> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

@Schema({
  collection: "guests",
  timestamps: true,
})
export class Guest {
  @Prop({ required: true, trim: true, minlength: 1, maxlength: 120 })
  name: string;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 254,
    set: normalizeEmail,
    match: [GUEST_EMAIL_PATTERN, "Guest email must be valid"],
  })
  email: string;

  @Prop({
    required: true,
    trim: true,
    set: normalizePhone,
    validate: {
      validator: (value: string) => GUEST_PHONE_PATTERN.test(value),
      message: "Guest phone must be a valid contact number",
    },
  })
  phone: string;

  @Prop({ trim: true, maxlength: 1000 })
  notes?: string;
}

export const GuestSchema = SchemaFactory.createForClass(Guest);

GuestSchema.index({ email: 1 }, { unique: true, name: "unique_guest_email" });
GuestSchema.index({ phone: 1 }, { unique: true, name: "unique_guest_phone" });
GuestSchema.index({ name: 1 }, { name: "guest_name_lookup" });

GuestSchema.path("notes").set(function normalizeOptionalString(
  value: string | undefined,
) {
  if (typeof value !== "string") {
    return value;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : undefined;
});

function normalizeEmail(value: unknown): unknown {
  return typeof value === "string" ? value.trim().toLowerCase() : value;
}

function normalizePhone(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim().replace(/[().\s-]/g, "");
}
