import type {CopyListingsResult, PutListingBody, StoreListing} from '@grov/models';

import type {ApiClient} from '../client';

export type ListingStateFilter = 'ACTIVE' | 'PAUSED' | 'DELISTED';

export interface ListingListParams {
  state?: ListingStateFilter;
  cursor?: string;
  limit?: number;
}

/**
 * `/v1/admin/store/...`: the listings of the store this session switched to
 * (`PUT /v1/admin/active-store`). The server picks the store; none is sent here.
 */
export function adminListingsApi(client: ApiClient) {
  const url = (productId: string) => `/v1/admin/store/products/${encodeURIComponent(productId)}`;
  return {
    list: (params: ListingListParams = {}) =>
      client.requestEnvelope<StoreListing[]>({
        method: 'get',
        url: '/v1/admin/store/products',
        params,
      }),
    /** Replaces the listing: omitted fields mean listed, not paused, no minimum. */
    put: (productId: string, body: PutListingBody) =>
      client.request<StoreListing>({method: 'put', url: url(productId), data: body}),
    /** Keeps the row, so the product can be listed again. */
    delist: (productId: string) =>
      client.request<StoreListing>({method: 'delete', url: url(productId)}),
    copyFrom: (sourceStoreId: string) =>
      client.request<CopyListingsResult>({
        method: 'post',
        url: `/v1/admin/store/listings/copy-from/${encodeURIComponent(sourceStoreId)}`,
      }),
  };
}
export type AdminListingsApi = ReturnType<typeof adminListingsApi>;
