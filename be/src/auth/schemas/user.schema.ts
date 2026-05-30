import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { USER_ROLES, type UserRole } from "../types/user-role.type";

export type PasswordAlgorithm = "scrypt";
export type UserDocument = HydratedDocument<User> & { _id: Types.ObjectId };

@Schema({
  collection: "users",
  timestamps: true,
})
export class User {
  @Prop({ required: true, unique: true, index: true, trim: true })
  username: string;

  @Prop({ required: true, enum: USER_ROLES })
  role: UserRole;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: true, enum: ["scrypt"] })
  passwordAlgorithm: PasswordAlgorithm;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  passwordSalt: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
