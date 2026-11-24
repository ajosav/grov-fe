import type {Category, CreateCategoryBody, UpdateCategoryBody} from '@grov/models';

import type {ApiClient} from '../client';

/** `/v1/admin/categories`: how products are grouped in Shop. One nesting level; the list is small, so it isn't paged. */
export function adminCategoriesApi(client: ApiClient) {
  const url = (id: string) => `/v1/admin/categories/${encodeURIComponent(id)}`;
  return {
    /** Every category, inactive ones too, with how many active products each holds. */
    list: () => client.request<Category[]>({method: 'get', url: '/v1/admin/categories'}),
    get: (id: string) => client.request<Category>({method: 'get', url: url(id)}),
    /** grov-be requires an Idempotency-Key: one per user intent, reused on retry. */
    create: (body: CreateCategoryBody, idempotencyKey: string) =>
      client.request<Category>({
        method: 'post',
        url: '/v1/admin/categories',
        data: body,
        headers: {'Idempotency-Key': idempotencyKey},
      }),
    update: (id: string, body: UpdateCategoryBody) =>
      client.request<Category>({method: 'patch', url: url(id), data: body}),
    /** Only a category nothing uses; otherwise 409 CATEGORY_IN_USE. Returns the deleted category. */
    remove: (id: string) => client.request<Category>({method: 'delete', url: url(id)}),
  };
}
export type AdminCategoriesApi = ReturnType<typeof adminCategoriesApi>;
