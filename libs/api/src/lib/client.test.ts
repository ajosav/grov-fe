import type {AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig} from 'axios';

import {Audience} from '@grov/models';

import {createApiClient} from './client';
import {ApiError} from './errors';

type Handler = (config: InternalAxiosRequestConfig) => {status: number; data: unknown};

function clientWith(handler: Handler, onSessionEnded = vi.fn(), audience: Audience = Audience.APP) {
  const client = createApiClient({
    baseURL: 'http://api.test',
    audience,
    cookiePrefix: 'brand',
    onSessionEnded,
  });
  const calls: InternalAxiosRequestConfig[] = [];
  const adapter: AxiosAdapter = async config => {
    calls.push(config);
    const {status, data} = handler(config);
    const response = {data, status, statusText: '', headers: {}, config} as AxiosResponse;
    if (status >= 400) {
      const error = Object.assign(new Error(`HTTP ${status}`), {
        isAxiosError: true,
        config,
        response,
      });
      throw error;
    }
    return response;
  };
  client.axios.defaults.adapter = adapter;
  return {client, calls, onSessionEnded};
}

const ok = (data: unknown) => ({
  status: 200,
  data: {status: true, statusCode: 200, message: 'Success', data},
});
const unauthorized = (code = 'UNAUTHENTICATED') => ({
  status: 401,
  data: {status: false, statusCode: 401, message: 'no', code, errors: {}},
});

describe('createApiClient', () => {
  afterEach(() => {
    document.cookie = 'brand_csrf=; max-age=0';
  });

  it('unwraps the envelope and marks requests as web', async () => {
    const {client, calls} = clientWith(() => ok({id: 1}));
    await expect(client.request({url: '/v1/me'})).resolves.toEqual({id: 1});
    expect(calls[0]?.headers['X-Client']).toBe('web');
    expect(calls[0]?.withCredentials).toBe(true);
  });

  it('echoes the CSRF cookie on unsafe methods only', async () => {
    document.cookie = 'brand_csrf=token123';
    const {client, calls} = clientWith(() => ok({}));
    await client.request({method: 'get', url: '/v1/me'});
    await client.request({method: 'post', url: '/v1/things', data: {}});
    expect(calls[0]?.headers['X-CSRF-Token']).toBeUndefined();
    expect(calls[1]?.headers['X-CSRF-Token']).toBe('token123');
  });

  it('refreshes once on 401 and retries the request', async () => {
    let refreshed = false;
    const {client, calls} = clientWith(config => {
      if (config.url === '/v1/auth/refresh') {
        refreshed = true;
        return ok({tokens: null});
      }
      return refreshed ? ok({id: 1}) : unauthorized();
    });
    await expect(client.request({url: '/v1/me'})).resolves.toEqual({id: 1});
    expect(calls.map(c => c.url)).toEqual(['/v1/me', '/v1/auth/refresh', '/v1/me']);
  });

  it('names its audience on refresh so the right session cookie is used', async () => {
    for (const audience of [Audience.APP, Audience.ADMIN]) {
      let refreshed = false;
      const {client, calls} = clientWith(
        config => {
          if (config.url === '/v1/auth/refresh') {
            refreshed = true;
            return ok({tokens: null});
          }
          return refreshed ? ok({}) : unauthorized();
        },
        vi.fn(),
        audience
      );
      await client.request({url: '/v1/me'});
      const refresh = calls.find(c => c.url === '/v1/auth/refresh');
      expect(JSON.parse(String(refresh?.data))).toEqual({audience});
    }
  });

  it('shares one refresh between parallel 401s', async () => {
    let refreshed = false;
    const {client, calls} = clientWith(config => {
      if (config.url === '/v1/auth/refresh') {
        refreshed = true;
        return ok({tokens: null});
      }
      return refreshed ? ok({}) : unauthorized('SESSION_EXPIRED');
    });
    await Promise.all([client.request({url: '/a'}), client.request({url: '/b'})]);
    expect(calls.filter(c => c.url === '/v1/auth/refresh')).toHaveLength(1);
  });

  it('ends the session when the refresh fails', async () => {
    const {client, onSessionEnded} = clientWith(config =>
      config.url === '/v1/auth/refresh' ? unauthorized('SESSION_REVOKED') : unauthorized()
    );
    const error = await client.request({url: '/v1/me'}).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe('UNAUTHENTICATED');
    expect(onSessionEnded).toHaveBeenCalledTimes(1);
  });

  it('never refreshes for the sign-in endpoints themselves', async () => {
    const {client, calls} = clientWith(() => unauthorized('AUTH_INVALID_CREDENTIALS'));
    await expect(
      client.request({method: 'post', url: '/v1/auth/login', data: {}})
    ).rejects.toMatchObject({
      code: 'AUTH_INVALID_CREDENTIALS',
    });
    expect(calls).toHaveLength(1);
  });

  it('maps validation errors to field messages', async () => {
    const {client} = clientWith(() => ({
      status: 422,
      data: {
        status: false,
        statusCode: 422,
        message: 'bad',
        code: 'VALIDATION_FAILED',
        errors: {email: ['Invalid email']},
      },
    }));
    const error = (await client.request({url: '/x'}).catch((e: unknown) => e)) as ApiError;
    expect(error.fieldError('email')).toBe('Invalid email');
  });
});
