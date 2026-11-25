import type {Food, FoodProduct, FoodStatus} from '@grov/models';

import type {ApiClient} from '../client';

export interface FoodListParams {
  /** Searches every language's name. */
  q?: string;
  status?: FoodStatus;
  cursor?: string;
  limit?: number;
}

/**
 * `/v1/admin/foods`: the food repository. A product is the sellable version of one food, so
 * the Add product flow can start from a food (doc 17 §4a).
 */
export function adminFoodsApi(client: ApiClient) {
  const url = (foodId: string) => `/v1/admin/foods/${encodeURIComponent(foodId)}`;
  return {
    list: (params: FoodListParams = {}) =>
      client.requestEnvelope<Food[]>({method: 'get', url: '/v1/admin/foods', params}),
    get: (foodId: string) => client.request<Food>({method: 'get', url: url(foodId)}),
    /** The products that supply a food, in brand order. */
    products: (foodId: string) =>
      client.request<FoodProduct[]>({method: 'get', url: `${url(foodId)}/products`}),
    /** Sends the whole list in brand order; a product left out is unlinked. */
    setProducts: (foodId: string, productIds: string[]) =>
      client.request<FoodProduct[]>({
        method: 'put',
        url: `${url(foodId)}/products`,
        data: {productIds},
      }),
  };
}
export type AdminFoodsApi = ReturnType<typeof adminFoodsApi>;
