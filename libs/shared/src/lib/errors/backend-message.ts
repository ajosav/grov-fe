import {isApiError} from '@grov/api';
import {ErrorCode} from '@grov/models';

/**
 * The message grov-be sent, word for word. Requests that never got an answer from grov-be
 * (offline, an unreadable reply) have none, so they fall back to the app's own copy.
 */
export function backendMessage(error: unknown): string | null {
  if (!isApiError(error)) return null;
  if (error.code === ErrorCode.NETWORK_ERROR || error.code === ErrorCode.UNKNOWN) return null;
  return error.message.trim() || null;
}
