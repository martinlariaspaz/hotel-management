import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiErrorCode,
  ApiErrorPayload,
  ApiErrorResponse,
  ApiErrorType,
} from "./api-error.types";

type HttpRequest = {
  url?: string;
};

type HttpResponse = {
  status(statusCode: number): {
    json(body: ApiErrorResponse): void;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return (
    isRecord(value) &&
    typeof value.type === "string" &&
    typeof value.code === "string" &&
    typeof value.message === "string"
  );
}

function getResponseMessage(
  response: unknown,
  fallback: string,
): string {
  if (typeof response === "string") {
    return response;
  }

  if (!isRecord(response)) {
    return fallback;
  }

  if (typeof response.message === "string") {
    return response.message;
  }

  return fallback;
}

function getResponseDetails(response: unknown): unknown {
  if (!isRecord(response) || !Array.isArray(response.message)) {
    return undefined;
  }

  return {
    messages: response.message,
  };
}

function getDefaultPayload(
  statusCode: number,
  response: unknown,
): ApiErrorPayload {
  switch (statusCode) {
    case HttpStatus.BAD_REQUEST:
      return {
        type: ApiErrorType.BadRequest,
        code: ApiErrorCode.BadRequest,
        message: getResponseMessage(response, "Bad request"),
        details: getResponseDetails(response),
      };
    case HttpStatus.UNAUTHORIZED:
      return {
        type: ApiErrorType.Unauthorized,
        code: ApiErrorCode.Unauthorized,
        message: getResponseMessage(response, "Unauthorized"),
      };
    case HttpStatus.FORBIDDEN:
      return {
        type: ApiErrorType.Forbidden,
        code: ApiErrorCode.Forbidden,
        message: getResponseMessage(response, "Forbidden"),
      };
    case HttpStatus.CONFLICT:
      return {
        type: ApiErrorType.HotelBusinessConflict,
        code: ApiErrorCode.HotelBusinessConflict,
        message: getResponseMessage(response, "Hotel business conflict"),
      };
    case HttpStatus.NOT_FOUND:
      return {
        type: ApiErrorType.NotFound,
        code: ApiErrorCode.NotFound,
        message: getResponseMessage(response, "Not found"),
      };
    default:
      return {
        type: ApiErrorType.Internal,
        code: ApiErrorCode.InternalServerError,
        message: "Internal server error",
      };
  }
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<HttpResponse>();
    const request = http.getRequest<HttpRequest>();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const payload = this.getPayload(statusCode, exceptionResponse);

    response.status(statusCode).json({
      statusCode,
      error: payload,
      timestamp: new Date().toISOString(),
      path: request.url ?? "",
    });
  }

  private getPayload(
    statusCode: number,
    exceptionResponse: unknown,
  ): ApiErrorPayload {
    if (isApiErrorPayload(exceptionResponse)) {
      return exceptionResponse;
    }

    if (
      isRecord(exceptionResponse) &&
      isApiErrorPayload(exceptionResponse.error)
    ) {
      return exceptionResponse.error;
    }

    return getDefaultPayload(statusCode, exceptionResponse);
  }
}
