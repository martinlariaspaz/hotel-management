import { BadRequestException } from "@nestjs/common";
import type { ValidationError } from "class-validator";
import {
  ApiErrorCode,
  ApiErrorPayload,
  ApiErrorType,
  type ApiValidationFieldError,
} from "./api-error.types";

function getPropertyPath(parentPath: string, property: string): string {
  return parentPath ? `${parentPath}.${property}` : property;
}

function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = "",
): ApiValidationFieldError[] {
  return errors.flatMap((error) => {
    const field = getPropertyPath(parentPath, error.property);
    const ownError = error.constraints
      ? [
          {
            field,
            messages: Object.values(error.constraints),
          },
        ]
      : [];

    return [
      ...ownError,
      ...flattenValidationErrors(error.children ?? [], field),
    ];
  });
}

export function createValidationException(
  errors: ValidationError[],
): BadRequestException {
  const payload: ApiErrorPayload = {
    type: ApiErrorType.Validation,
    code: ApiErrorCode.ValidationFailed,
    message: "Validation failed",
    details: {
      fields: flattenValidationErrors(errors),
    },
  };

  return new BadRequestException(payload);
}
