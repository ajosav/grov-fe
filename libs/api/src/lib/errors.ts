import {isAxiosError} from 'axios';

import {ErrorCode, type ErrorEnvelope, type FieldErrors, ROOT_ERROR_KEY} from '@grov/models';

/**
 * Every failed request becomes an ApiError. Branch on `code` (stable, from
 * grov-be). `message` is grov-be's own text: the app-wide failure toast shows it
 * word for word (see `AppProviders`); inline copy is still built from `code` + `params`.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: FieldErrors;
  readonly params: Record<string, unknown>;
  readonly traceId?: string;

  constructor(init: {
    status: number;
    code: string;
    message: string;
    fieldErrors?: FieldErrors;
    params?: Record<string, unknown>;
    traceId?: string;
  }) {
    super(init.message);
    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.fieldErrors = init.fieldErrors ?? {};
    this.params = init.params ?? {};
    this.traceId = init.traceId;
  }

  /** First message for one field (`email`), or for the whole input. */
  fieldError(field: string = ROOT_ERROR_KEY): string | undefined {
    return this.fieldErrors[field]?.[0];
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

const isEnvelope = (data: unknown): data is ErrorEnvelope =>
  typeof data === 'object' && data !== null && (data as {status?: unknown}).status === false;

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;
  if (isAxiosError(error)) {
    const response = error.response;
    if (!response) {
      return new ApiError({
        status: 0,
        code: ErrorCode.NETWORK_ERROR,
        message: error.message || 'Network error',
      });
    }
    if (isEnvelope(response.data)) {
      const body = response.data;
      return new ApiError({
        status: body.statusCode ?? response.status,
        code: body.code,
        message: body.message,
        fieldErrors: body.errors,
        params: body.params,
        traceId: body.traceId,
      });
    }
    return new ApiError({
      status: response.status,
      code: ErrorCode.UNKNOWN,
      message: `HTTP ${response.status}`,
    });
  }
  return new ApiError({
    status: 0,
    code: ErrorCode.UNKNOWN,
    message: error instanceof Error ? error.message : 'Unknown error',
  });
}

/** Ask the user to retry? True for network failures and 5xx. */
export const isRetryable = (error: ApiError): boolean => error.status === 0 || error.status >= 500;
