import type {Allergen} from '@grov/models';

import type {ApiClient} from '../client';

/** `/v1/allergens`: the active allergens, with aliases and local names. */
export function allergensApi(client: ApiClient) {
  return {
    list: () => client.request<Allergen[]>({method: 'get', url: '/v1/allergens'}),
  };
}
export type AllergensApi = ReturnType<typeof allergensApi>;
