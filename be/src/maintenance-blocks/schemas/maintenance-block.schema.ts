import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import {
  MAINTENANCE_BLOCK_STATUS_VALUES,
  MaintenanceBlockStatus,
} from "../../common/enums";
import { User } from "../../auth/schemas/user.schema";
import { Room } from "../../rooms/schemas";

export type MaintenanceBlockDocument = HydratedDocument<MaintenanceBlock> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

@Schema({
  collection: "maintenance_blocks",
  timestamps: true,
})
export class MaintenanceBlock {
  @Prop({
    type: Types.ObjectId,
    ref: Room.name,
    required: true,
    index: true,
  })
  room: Types.ObjectId;

  @Prop({ required: true, index: true })
  startDate: Date;

  @Prop({ required: true, index: true })
  endDate: Date;

  @Prop({ required: true, trim: true })
  reason: string;

  @Prop({
    required: true,
    enum: MAINTENANCE_BLOCK_STATUS_VALUES,
    default: MaintenanceBlockStatus.Active,
    index: true,
  })
  status: MaintenanceBlockStatus;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  createdBy: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    index: true,
  })
  cancelledBy?: Types.ObjectId;

  @Prop()
  cancelledAt?: Date;
}

export const MaintenanceBlockSchema =
  SchemaFactory.createForClass(MaintenanceBlock);

MaintenanceBlockSchema.index({
  room: 1,
  status: 1,
  startDate: 1,
  endDate: 1,
});

MaintenanceBlockSchema.pre("validate", function validateDateRange() {
  if (this.startDate >= this.endDate) {
    throw new Error("Maintenance block end date must be after start date");
  }
});
