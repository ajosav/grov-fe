import {createContext, type ReactNode, useContext} from 'react';

import {type ApiClient, type ApiClientOptions, createApiClient} from './client';
import * as endpoints from './endpoints';

export function createApi(options: ApiClientOptions) {
  const client = createApiClient(options);
  return {
    client,
    auth: endpoints.authApi(client),
    me: endpoints.meApi(client),
    config: endpoints.configApi(client),
    adminAccess: endpoints.adminAccessApi(client),
    adminStores: endpoints.adminStoresApi(client),
    adminCities: endpoints.adminCitiesApi(client),
    adminProducts: endpoints.adminProductsApi(client),
    adminCategories: endpoints.adminCategoriesApi(client),
    adminListings: endpoints.adminListingsApi(client),
    adminMarkups: endpoints.adminMarkupsApi(client),
    files: endpoints.filesApi(client),
    allergens: endpoints.allergensApi(client),
    adminFoods: endpoints.adminFoodsApi(client),
    // gen:resource:api (yarn gen:resource adds endpoint groups above this line)
  };
}
export type Api = ReturnType<typeof createApi>;
export type {ApiClient};

const ApiContext = createContext<Api | null>(null);

export function ApiProvider({api, children}: {api: Api; children: ReactNode}) {
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export function useApi(): Api {
  const api = useContext(ApiContext);
  if (!api) throw new Error('useApi must be used inside <ApiProvider>');
  return api;
}
