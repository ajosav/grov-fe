import type {PriceMarkup, PriceMarkupValue} from '@grov/models';

import type {ApiClient} from '../client';

/** grov-be's page-size ceiling (`PAGE_LIMIT_MAX`); a larger `limit` is a 422. */
const PAGE_LIMIT = 50;

/** Where a markup applies: the whole store, a category (and its sub-categories) or one size. */
export type MarkupScopeInput =
  {kind: 'STORE'} | {kind: 'CATEGORY'; categoryId: string} | {kind: 'SIZE'; sizeId: string};

/**
 * `/v1/admin/...`: markups on the base price at the store this session switched to. A store's
 * price is the size's base price plus its markup; every write is live at once.
 */
export function adminMarkupsApi(client: ApiClient) {
  return {
    /** The markups in force, one per scope. Reads every page (grov-be caps `limit` at 50). */
    list: async (): Promise<PriceMarkup[]> => {
      const all: PriceMarkup[] = [];
      let cursor: string | undefined;
      do {
        const page = await client.requestEnvelope<PriceMarkup[] | {items: PriceMarkup[]}>({
          method: 'get',
          url: '/v1/admin/store/markups',
          params: {limit: PAGE_LIMIT, ...(cursor ? {cursor} : {})},
        });
        all.push(...(Array.isArray(page.data) ? page.data : (page.data?.items ?? [])));
        cursor = page.meta?.nextCursor ?? undefined;
      } while (cursor);
      return all;
    },
    /** grov-be requires an Idempotency-Key: one per user intent, reused on retry. */
    set: (scope: MarkupScopeInput, markup: PriceMarkupValue, idempotencyKey: string) =>
      client.request<PriceMarkup>({
        method: 'post',
        url: '/v1/admin/markups',
        data: {scope, markup},
        headers: {'Idempotency-Key': idempotencyKey},
      }),
    /** One markup for every size of a product. */
    setForProduct: async (productId: string, markup: PriceMarkupValue): Promise<PriceMarkup[]> => {
      const data = await client.request<PriceMarkup[] | {items: PriceMarkup[]}>({
        method: 'put',
        url: `/v1/admin/store/products/${encodeURIComponent(productId)}/markup`,
        data: {markup},
      });
      return Array.isArray(data) ? data : (data?.items ?? []);
    },
  };
}
export type AdminMarkupsApi = ReturnType<typeof adminMarkupsApi>;
