import type {
  RestockStatus,
  StockMovement,
  StockMovementKind,
  StockOverviewPage,
  StockRow,
  StockSettingsBody,
  StockSummary,
} from '@grov/models';

import type {ApiClient} from '../client';

export const STOCK_VIEWS = [
  'all',
  'needs_restock',
  'out',
  'low',
  'covered',
  'overstocked',
  'no_sales',
] as const;
export type StockView = (typeof STOCK_VIEWS)[number];

export const STOCK_SORTS = ['urgency', 'name', 'available', 'cover', 'sold', 'value'] as const;
export type StockSort = (typeof STOCK_SORTS)[number];

export interface StockOverviewParams {
  q?: string;
  view?: StockView;
  sort?: StockSort;
  dir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface StockMovementParams {
  productId?: string;
  kind?: StockMovementKind;
  q?: string;
  /** ISO instants. */
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
}

export type {RestockStatus};

/**
 * `/v1/admin/store/stock`: stock at the store this session switched to. Pace, cover, base-price
 * moves and suggested quantities come from the server; writes need an Idempotency-Key, one per
 * user intent and reused on retry.
 */
export function adminStockApi(client: ApiClient) {
  const base = '/v1/admin/store/stock';
  return {
    overview: (params: StockOverviewParams = {}) =>
      client.request<StockOverviewPage>({method: 'get', url: `${base}/overview`, params}),
    summary: () => client.request<StockSummary>({method: 'get', url: `${base}/summary`}),
    /** `{items, nextCursor}` arrives as `data: [...]` with the cursor in `meta`. */
    movements: (params: StockMovementParams = {}) =>
      client.requestEnvelope<StockMovement[]>({method: 'get', url: `${base}/movements`, params}),
    settings: (productId: string, body: StockSettingsBody) =>
      client.request<StockRow>({
        method: 'patch',
        url: `${base}/${encodeURIComponent(productId)}`,
        data: body,
      }),
  };
}
export type AdminStockApi = ReturnType<typeof adminStockApi>;
