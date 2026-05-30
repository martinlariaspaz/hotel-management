export enum ApiErrorType {
  Validation = "validation",
  Unauthorized = "unauthorized",
  Forbidden = "forbidden",
  HotelBusinessConflict = "hotel_business_conflict",
  BadRequest = "bad_request",
  NotFound = "not_found",
  Internal = "internal_error",
}

export enum ApiErrorCode {
  ValidationFailed = "VALIDATION_FAILED",
  Unauthorized = "UNAUTHORIZED",
  Forbidden = "FORBIDDEN",
  HotelBusinessConflict = "HOTEL_BUSINESS_CONFLICT",
  BadRequest = "BAD_REQUEST",
  NotFound = "NOT_FOUND",
  InternalServerError = "INTERNAL_SERVER_ERROR",
}

export type ApiValidationFieldError = {
  field: string;
  messages: string[];
};

export type ApiErrorPayload = {
  type: ApiErrorType;
  code: ApiErrorCode | string;
  message: string;
  details?: unknown;
};

export type ApiErrorResponse = {
  statusCode: number;
  error: ApiErrorPayload;
  timestamp: string;
  path: string;
};
