import { ConflictException } from "@nestjs/common";
import {
  ApiErrorCode,
  ApiErrorPayload,
  ApiErrorType,
} from "./api-error.types";

export class HotelBusinessConflictException extends ConflictException {
  constructor(
    message: string,
    details?: unknown,
    code: ApiErrorCode | string = ApiErrorCode.HotelBusinessConflict,
  ) {
    const payload: ApiErrorPayload = {
      type: ApiErrorType.HotelBusinessConflict,
      code,
      message,
      details,
    };

    super(payload);
  }
}
