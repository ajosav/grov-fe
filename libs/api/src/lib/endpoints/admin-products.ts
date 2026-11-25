import type {
  CreateProductBody,
  Product,
  ProductListing,
  ProductSummary,
  PutListingBody,
  ReplacePrepOptionsBody,
  ReplaceSizesBody,
  StoreListing,
  UpdateProductBody,
} from '@grov/models';

import type {ApiClient} from '../client';

export interface ProductListParams {
  categoryId?: string;
  /** Only products with a live listing at this store. */
  storeId?: string;
  /** With `storeId`: false keeps only products that still can be listed there. */
  listed?: boolean;
  q?: string;
  active?: boolean;
  /** True keeps only drafts, false hides them. */
  draft?: boolean;
  cursor?: string;
  limit?: number;
}

/** `/v1/admin/products`: the global product master with its size ladder and prep options. */
export function adminProductsApi(client: ApiClient) {
  const url = (id: string) => `/v1/admin/products/${encodeURIComponent(id)}`;
  return {
    list: (params: ProductListParams = {}) =>
      client.requestEnvelope<ProductSummary[]>({
        method: 'get',
        url: '/v1/admin/products',
        params,
      }),
    get: (id: string) => client.request<Product>({method: 'get', url: url(id)}),
    /** grov-be requires an Idempotency-Key: one per user intent, reused on retry. */
    create: (body: CreateProductBody, idempotencyKey: string) =>
      client.request<Product>({
        method: 'post',
        url: '/v1/admin/products',
        data: body,
        headers: {'Idempotency-Key': idempotencyKey},
      }),
    /** Where the product is listed, for the stores this admin can act on. Delisted ones show `active: false`. */
    /**
     * grov-be's envelope turns a `{items}` result into `data: [...]`, so the body is a bare
     * array, though the OpenAPI types still say `{items}`. Read either shape.
     */
    listings: async (id: string): Promise<ProductListing[]> => {
      const data = await client.request<ProductListing[] | {items: ProductListing[]}>({
        method: 'get',
        url: `${url(id)}/listings`,
      });
      return Array.isArray(data) ? data : ((data?.items as ProductListing[] | undefined) ?? []);
    },
    /** Replaces the listing at a store: omitted fields mean listed, not paused, no minimum. */
    putListing: (id: string, storeId: string, body: PutListingBody) =>
      client.request<StoreListing>({
        method: 'put',
        url: `${url(id)}/listings/${encodeURIComponent(storeId)}`,
        data: body,
      }),
    delistAt: (id: string, storeId: string) =>
      client.request<StoreListing>({
        method: 'delete',
        url: `${url(id)}/listings/${encodeURIComponent(storeId)}`,
      }),
    update: (id: string, body: UpdateProductBody) =>
      client.request<Product>({method: 'patch', url: url(id), data: body}),
    replaceSizes: (id: string, body: ReplaceSizesBody) =>
      client.request<Product>({method: 'put', url: `${url(id)}/sizes`, data: body}),
    replacePrepOptions: (id: string, body: ReplacePrepOptionsBody) =>
      client.request<Product>({method: 'put', url: `${url(id)}/prep-options`, data: body}),
  };
}
export type AdminProductsApi = ReturnType<typeof adminProductsApi>;
