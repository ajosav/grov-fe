import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

import {Audience, type SuccessEnvelope} from '@grov/models';

import {toApiError} from './errors';

/**
 * HTTP client for the React clients (doc 10 §4.4):
 *
 * - Tokens never touch JavaScript. `X-Client: web` makes grov-be put the
 *   access and refresh tokens in httpOnly cookies; `withCredentials` sends them.
 * - Unsafe methods echo the readable CSRF cookie in `X-CSRF-Token` (double submit).
 * - Any 401 outside the auth endpoints triggers one shared refresh, then the
 *   request is retried once. The access cookie expires with the token, so an
 *   expired session usually shows up as `UNAUTHENTICATED`, not `SESSION_EXPIRED`.
 * - If the refresh fails the session is over and `onSessionEnded` runs (the
 *   app decides what that means, e.g. only toast if someone was signed in).
 */
export interface ApiClientOptions {
  baseURL: string;
  audience: Audience;
  /** grov-be cookie prefix (`<prefix>_csrf`, `<prefix>_admin_csrf`). */
  cookiePrefix: string;
  onSessionEnded?: () => void;
}

export interface ApiClient {
  axios: AxiosInstance;
  audience: Audience;
  /** Sends the request and returns the envelope's `data`. Throws ApiError. */
  request<T>(config: AxiosRequestConfig): Promise<T>;
  /** Same as `request`, but keeps pagination `meta`. */
  requestEnvelope<T>(config: AxiosRequestConfig): Promise<SuccessEnvelope<T>>;
  /** Shared, single-flight refresh. Resolves false when the session is gone. */
  refresh(): Promise<boolean>;
}

const UNSAFE = new Set(['post', 'put', 'patch', 'delete']);

/** Endpoints that answer 401 as part of their own flow; never refresh-and-retry them. */
const NO_REFRESH = /\/v1\/auth\/(refresh|logout|login|code\/|nonce|password\/|lookup)/;

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

export function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

export const csrfCookieName = (prefix: string, audience: Audience): string =>
  audience === Audience.ADMIN ? `${prefix}_admin_csrf` : `${prefix}_csrf`;

export function createApiClient(options: ApiClientOptions): ApiClient {
  const instance = axios.create({
    baseURL: options.baseURL,
    withCredentials: true,
    timeout: 30_000,
    headers: {Accept: 'application/json', 'X-Client': 'web'},
  });

  instance.interceptors.request.use(config => {
    if (UNSAFE.has((config.method ?? 'get').toLowerCase())) {
      const csrf = readCookie(csrfCookieName(options.cookiePrefix, options.audience));
      if (csrf) config.headers.set('X-CSRF-Token', csrf);
    }
    return config;
  });

  let refreshing: Promise<boolean> | null = null;

  const refresh = (): Promise<boolean> => {
    refreshing ??= instance
      // The audience picks this console's refresh cookie: a browser signed in to
      // the app and the admin holds both, on the same path.
      .post('/v1/auth/refresh', {audience: options.audience})
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
    return refreshing;
  };

  instance.interceptors.response.use(
    response => response,
    async (error: unknown) => {
      const apiError = toApiError(error);
      const config = (error as {config?: RetryableConfig}).config;
      const canRefresh =
        apiError.status === 401 && config && !config._retried && !NO_REFRESH.test(config.url ?? '');

      if (canRefresh) {
        config._retried = true;
        if (await refresh()) return instance.request(config);
        options.onSessionEnded?.();
      }
      throw apiError;
    }
  );

  const requestEnvelope = async <T>(config: AxiosRequestConfig) => {
    const response = await instance.request<SuccessEnvelope<T>>(config);
    return response.data;
  };

  return {
    axios: instance,
    audience: options.audience,
    request: async <T>(config: AxiosRequestConfig) => (await requestEnvelope<T>(config)).data,
    requestEnvelope,
    refresh,
  };
}
