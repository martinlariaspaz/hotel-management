import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type BlacklistedTokenDocument = HydratedDocument<BlacklistedToken>;

@Schema({
  collection: "auth_token_blacklist",
  timestamps: true,
})
export class BlacklistedToken {
  @Prop({ required: true, unique: true, index: true })
  jti: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  expiresAt: Date;
}

export const BlacklistedTokenSchema =
  SchemaFactory.createForClass(BlacklistedToken);

BlacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
