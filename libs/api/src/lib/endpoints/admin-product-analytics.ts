import type {
  ActivityItem,
  CatalogueAnalytics,
  CataloguePage,
  CatalogueSummary,
  CreateImportBody,
  ImportJob,
  OrderItemType,
  OrderRevenueSource,
  OrderStats,
  ProductPerformance,
  ProductPricing,
  ProductStock,
  StockState,
  StoredFile,
} from '@grov/models';

import type {ApiClient} from '../client';

/** A report period in Lagos days (YYYY-MM-DD) and, optionally, one store. */
export interface AnalyticsPeriodParams {
  from?: string;
  to?: string;
  storeId?: string;
}

export const CATALOGUE_VIEWS = [
  'best_performing',
  'declining',
  'low_stock',
  'out_of_stock',
  'high_revenue',
  'low_conversion',
] as const;
export type CatalogueView = (typeof CATALOGUE_VIEWS)[number];

export const CATALOGUE_SORTS = [
  'name',
  'updated',
  'price',
  'stock',
  'sold',
  'viewers',
  'conversion',
  'revenue',
  'margin',
] as const;
export type CatalogueSort = (typeof CATALOGUE_SORTS)[number];

export interface CatalogueParams extends AnalyticsPeriodParams {
  q?: string;
  categoryId?: string;
  status?: 'published' | 'draft' | 'inactive';
  availability?: StockState;
  performance?: 'rising' | 'declining' | 'no_sales';
  profitability?: 'thin' | 'healthy' | 'unknown';
  view?: CatalogueView;
  sort?: CatalogueSort;
  dir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface OrderStatsParams extends AnalyticsPeriodParams {
  /** Only lines of this kind. */
  itemType?: OrderItemType;
  /** Only the part of each order paid this way. */
  source?: OrderRevenueSource;
}

export interface ActivityParams {
  productId?: string;
  kind?: ActivityItem['kind'];
  cursor?: string;
  limit?: number;
}

/** `/v1/admin/product-analytics`: catalogue metrics, a product's performance, stock, pricing and timeline; price imports. */
export function adminProductAnalyticsApi(client: ApiClient) {
  const base = '/v1/admin/product-analytics';
  const product = (id: string) => `${base}/products/${encodeURIComponent(id)}`;
  return {
    summary: (params: AnalyticsPeriodParams = {}) =>
      client.request<CatalogueSummary>({method: 'get', url: `${base}/catalogue/summary`, params}),
    catalogue: (params: CatalogueParams = {}) =>
      client.request<CataloguePage>({method: 'get', url: `${base}/catalogue/products`, params}),
    analytics: (params: AnalyticsPeriodParams = {}) =>
      client.request<CatalogueAnalytics>({
        method: 'get',
        url: `${base}/catalogue/analytics`,
        params,
      }),
    /** Orders and revenue over a range, by item type and payment, and when people order. */
    orderStats: (params: OrderStatsParams = {}) =>
      client.request<OrderStats>({method: 'get', url: `${base}/orders/stats`, params}),
    /** `{items, nextCursor}` arrives as `data: [...]` with the cursor in `meta`. */
    activity: (params: ActivityParams = {}) =>
      client.requestEnvelope<ActivityItem[]>({method: 'get', url: `${base}/activity`, params}),

    performance: (id: string, params: AnalyticsPeriodParams = {}) =>
      client.request<ProductPerformance>({
        method: 'get',
        url: `${product(id)}/performance`,
        params,
      }),
    stock: (id: string, storeId?: string) =>
      client.request<ProductStock>({method: 'get', url: `${product(id)}/stock`, params: {storeId}}),
    pricing: (id: string, storeId?: string) =>
      client.request<ProductPricing>({
        method: 'get',
        url: `${product(id)}/pricing`,
        params: {storeId},
      }),

    /** A CSV for an import goes to the admin's private imports folder first (files.md). */
    uploadImportFile: (file: File, userId: string) => {
      const form = new FormData();
      form.append('file', file);
      form.append('path', `private/users/${userId}/imports`);
      return client.request<StoredFile>({method: 'post', url: '/v1/files', data: form});
    },
    startImport: (body: CreateImportBody, idempotencyKey: string) =>
      client.request<ImportJob>({
        method: 'post',
        url: '/v1/admin/imports',
        data: body,
        headers: {'Idempotency-Key': idempotencyKey},
      }),
    importJob: (id: string) =>
      client.request<ImportJob>({
        method: 'get',
        url: `/v1/admin/imports/${encodeURIComponent(id)}`,
      }),
  };
}
export type AdminProductAnalyticsApi = ReturnType<typeof adminProductAnalyticsApi>;
