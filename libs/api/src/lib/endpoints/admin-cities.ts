import type {AdminCity, CreateCityBody, UpdateCityBody} from '@grov/models';

import type {ApiClient} from '../client';

/** `/v1/admin/cities`: a store's parent, holding the delivery defaults its stores share. */
export function adminCitiesApi(client: ApiClient) {
  const url = (id: string) => `/v1/admin/cities/${encodeURIComponent(id)}`;
  return {
    list: () => client.request<AdminCity[]>({method: 'get', url: '/v1/admin/cities'}),
    get: (id: string) => client.request<AdminCity>({method: 'get', url: url(id)}),
    /** grov-be requires an Idempotency-Key: one per user intent, reused on retry. */
    create: (body: CreateCityBody, idempotencyKey: string) =>
      client.request<AdminCity>({
        method: 'post',
        url: '/v1/admin/cities',
        data: body,
        headers: {'Idempotency-Key': idempotencyKey},
      }),
    update: (id: string, body: UpdateCityBody) =>
      client.request<AdminCity>({method: 'patch', url: url(id), data: body}),
  };
}
export type AdminCitiesApi = ReturnType<typeof adminCitiesApi>;
