/**
 * grov-be response envelope (backend `core/http/api-response.ts`).
 *
 * Success: `{status: true, statusCode, message, data, meta?}`
 * Error:   `{status: false, statusCode, message, code, errors, params?, traceId?}`
 *
 * Clients branch on `code` (stable) and render copy from `code` + `params`;
 * `message` is developer text and is never shown to users.
 */
export interface PaginationMeta {
  path: string;
  perPage: number;
  nextCursor: string | null;
  prevCursor: string | null;
}

export interface SuccessEnvelope<T> {
  status: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export type FieldErrors = Record<string, string[]>;

export interface ErrorEnvelope {
  status: false;
  statusCode: number;
  message: string;
  code: string;
  errors: FieldErrors;
  params?: Record<string, unknown>;
  traceId?: string;
}

/** A cursor page as hooks see it: the items plus the cursor to fetch the next one. */
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

/** Key in `errors` for an issue on the whole input rather than one field. */
export const ROOT_ERROR_KEY = '_root';
