import type { TranslationKey } from '../i18n';

export type ApiErrorType =
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'hotel_business_conflict'
  | 'bad_request'
  | 'not_found'
  | 'internal_error';

export type ApiErrorPayload = {
  code: string;
  details?: unknown;
  message: string;
  type: ApiErrorType;
};

export type ApiErrorResponse = {
  error: ApiErrorPayload;
  path: string;
  statusCode: number;
  timestamp: string;
};

export type ApiErrorTranslationOverrides = Partial<
  Record<ApiErrorType, TranslationKey>
>;

type RepositoryApiErrorOptions = {
  payload?: ApiErrorPayload;
  response?: ApiErrorResponse;
  statusCode: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isApiErrorType(value: unknown): value is ApiErrorType {
  return (
    value === 'validation' ||
    value === 'unauthorized' ||
    value === 'forbidden' ||
    value === 'hotel_business_conflict' ||
    value === 'bad_request' ||
    value === 'not_found' ||
    value === 'internal_error'
  );
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return (
    isRecord(value) &&
    typeof value.code === 'string' &&
    typeof value.message === 'string' &&
    isApiErrorType(value.type)
  );
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    isRecord(value) &&
    isApiErrorPayload(value.error) &&
    typeof value.path === 'string' &&
    typeof value.statusCode === 'number' &&
    typeof value.timestamp === 'string'
  );
}

function readLegacyMessage(value: unknown): string | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.message === 'string') {
    return value.message;
  }

  if (Array.isArray(value.message)) {
    return value.message
      .filter((message): message is string => typeof message === 'string')
      .join(', ');
  }

  return null;
}

export class RepositoryApiError extends Error {
  readonly code: string | null;
  readonly details: unknown;
  readonly response: ApiErrorResponse | null;
  readonly statusCode: number;
  readonly type: ApiErrorType | null;

  constructor(message: string, options: RepositoryApiErrorOptions) {
    super(message);
    this.name = 'RepositoryApiError';
    this.code = options.payload?.code ?? null;
    this.details = options.payload?.details;
    this.response = options.response ?? null;
    this.statusCode = options.statusCode;
    this.type = options.payload?.type ?? null;
  }
}

export async function parseApiErrorResponse(
  response: Response,
  fallbackMessage = 'Request failed',
): Promise<RepositoryApiError> {
  try {
    const data = (await response.json()) as unknown;

    if (isApiErrorResponse(data)) {
      return new RepositoryApiError(data.error.message, {
        payload: data.error,
        response: data,
        statusCode: data.statusCode,
      });
    }

    return new RepositoryApiError(readLegacyMessage(data) ?? fallbackMessage, {
      statusCode: response.status,
    });
  } catch {
    return new RepositoryApiError(fallbackMessage, {
      statusCode: response.status,
    });
  }
}

export function isRepositoryApiError(
  error: unknown,
): error is RepositoryApiError {
  return error instanceof RepositoryApiError;
}

export function getRepositoryApiErrorTranslationKey(
  error: unknown,
  overrides: ApiErrorTranslationOverrides = {},
): TranslationKey {
  if (!isRepositoryApiError(error) || !error.type) {
    return 'app.errors.unexpected';
  }

  const override = overrides[error.type];

  if (override) {
    return override;
  }

  if (error.type === 'validation' || error.type === 'bad_request') {
    return 'app.errors.validation';
  }

  if (error.type === 'unauthorized') {
    return 'app.errors.unauthorized';
  }

  if (error.type === 'forbidden') {
    return 'app.errors.forbidden';
  }

  if (error.type === 'hotel_business_conflict') {
    return 'app.errors.businessConflict';
  }

  return 'app.errors.unexpected';
}

const apiErrors = {
  RepositoryApiError,
  getRepositoryApiErrorTranslationKey,
  isRepositoryApiError,
  parseApiErrorResponse,
} as const;

export default apiErrors;
