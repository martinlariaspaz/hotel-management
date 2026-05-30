import { IsEnum } from "class-validator";
import { RoomStatus } from "../../common/enums";

export class UpdateRoomStatusDto {
  @IsEnum(RoomStatus)
  status: RoomStatus;
}

export default UpdateRoomStatusDto;

