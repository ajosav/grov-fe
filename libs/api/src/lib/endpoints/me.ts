import type {AuthResponse, ClientConfig, ConsentBody, Me, UpdateMeBody} from '@grov/models';

import type {ApiClient} from '../client';

export function meApi(client: ApiClient) {
  return {
    /** Profile, pending gates and access. Admin-audience calls also carry `access.admin`. */
    get: () => client.request<Me>({method: 'get', url: '/v1/me'}),
    update: (body: UpdateMeBody) =>
      client.request<Me>({method: 'patch', url: '/v1/me', data: body}),
    acceptConsent: (body: ConsentBody) =>
      client.request<AuthResponse>({method: 'post', url: '/v1/me/consents', data: body}),
  };
}
export type MeApi = ReturnType<typeof meApi>;

export function configApi(client: ApiClient) {
  return {
    /** Bootstrap config: legal versions, feature flags, limits. Public. */
    get: () => client.request<ClientConfig>({method: 'get', url: '/v1/config'}),
  };
}
export type ConfigApi = ReturnType<typeof configApi>;
