import type {
  AdminCoverage,
  AdminStore,
  AdminStoreDetail,
  CoverageCheckBody,
  CreateStoreBody,
  EffectiveDeliveryConfig,
  SetDeliveryZoneBody,
  StoreStatus,
  UpdateStoreBody,
} from '@grov/models';

import type {ApiClient} from '../client';

export interface StoreListParams {
  status?: StoreStatus;
  cityId?: string;
  cursor?: string;
  limit?: number;
}

/**
 * `/v1/admin/stores`: Grov's fulfilment nodes (ADR 0001). The list only holds
 * stores the admin may act on; adding a store needs all-store access.
 */
export function adminStoresApi(client: ApiClient) {
  const url = (id: string) => `/v1/admin/stores/${encodeURIComponent(id)}`;
  return {
    list: (params: StoreListParams = {}) =>
      client.requestEnvelope<AdminStore[]>({method: 'get', url: '/v1/admin/stores', params}),
    get: (id: string) => client.request<AdminStoreDetail>({method: 'get', url: url(id)}),
    /** grov-be requires an Idempotency-Key: one per user intent, reused on retry. */
    create: (body: CreateStoreBody, idempotencyKey: string) =>
      client.request<AdminStoreDetail>({
        method: 'post',
        url: '/v1/admin/stores',
        data: body,
        headers: {'Idempotency-Key': idempotencyKey},
      }),
    update: (id: string, body: UpdateStoreBody) =>
      client.request<AdminStoreDetail>({method: 'patch', url: url(id), data: body}),
    setDeliveryZone: (id: string, body: SetDeliveryZoneBody) =>
      client.request<AdminStoreDetail>({
        method: 'put',
        url: `${url(id)}/delivery-zone`,
        data: body,
      }),
    deliveryConfig: (id: string) =>
      client.request<EffectiveDeliveryConfig>({method: 'get', url: `${url(id)}/delivery-config`}),
    checkCoverage: (body: CoverageCheckBody) =>
      client.request<AdminCoverage>({
        method: 'post',
        url: '/v1/admin/stores/coverage-check',
        data: body,
      }),
  };
}
export type AdminStoresApi = ReturnType<typeof adminStoresApi>;
