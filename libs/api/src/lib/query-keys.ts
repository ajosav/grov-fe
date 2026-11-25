/**
 * TanStack Query keys, one factory per resource. Keys are arrays so a prefix
 * invalidates a family: `invalidateQueries({queryKey: queryKeys.admin.all})`.
 */
export const queryKeys = {
  me: ['me'] as const,
  config: ['config'] as const,
  admin: {
    all: ['admin'] as const,
    permissions: ['admin', 'permissions'] as const,
    roles: ['admin', 'roles'] as const,
    myStores: ['admin', 'my-stores'] as const,
  },
  adminStores: {
    all: ['admin', 'stores'] as const,
    lists: ['admin', 'stores', 'list'] as const,
    list: (filters: {status?: string; cityId?: string}) =>
      ['admin', 'stores', 'list', filters] as const,
    detail: (id: string) => ['admin', 'stores', 'detail', id] as const,
    deliveryConfig: (id: string) => ['admin', 'stores', 'detail', id, 'delivery-config'] as const,
  },
  adminCities: {
    all: ['admin', 'cities'] as const,
    list: ['admin', 'cities', 'list'] as const,
    detail: (id: string) => ['admin', 'cities', 'detail', id] as const,
  },
  adminStaff: {
    all: ['admin', 'staff'] as const,
    lists: ['admin', 'staff', 'list'] as const,
    list: (filters: {status?: string; storeId?: string; roleId?: string; q?: string}) =>
      ['admin', 'staff', 'list', filters] as const,
    detail: (userId: string) => ['admin', 'staff', 'detail', userId] as const,
    invites: (status: string) => ['admin', 'staff', 'invites', status] as const,
    allInvites: ['admin', 'staff', 'invites'] as const,
  },
  inviteCheck: (token: string) => ['auth', 'invite', token] as const,
  adminProducts: {
    all: ['admin', 'products'] as const,
    lists: ['admin', 'products', 'list'] as const,
    list: (filters: {
      categoryId?: string;
      storeId?: string;
      listed?: boolean;
      q?: string;
      active?: boolean;
    }) => ['admin', 'products', 'list', filters] as const,
    detail: (id: string) => ['admin', 'products', 'detail', id] as const,
    /** Where one product is listed, store by store. */
    listings: ['admin', 'products', 'listings'] as const,
    listingsOf: (id: string) => ['admin', 'products', 'listings', id] as const,
  },
  adminListings: {
    all: ['admin', 'listings'] as const,
    list: (filters: {state?: string}) => ['admin', 'listings', 'list', filters] as const,
    /** The active store's markups in force; the server picks the store. */
    markups: ['admin', 'listings', 'markups'] as const,
  },
  adminCategories: {
    all: ['admin', 'categories'] as const,
    list: ['admin', 'categories', 'list'] as const,
  },
  files: {
    urls: (paths: readonly string[]) => ['files', 'urls', ...paths] as const,
  },
  allergens: ['allergens'] as const,
  adminFoods: {
    all: ['admin', 'foods'] as const,
    list: (filters: {q?: string}) => ['admin', 'foods', 'list', filters] as const,
    detail: (id: string) => ['admin', 'foods', 'detail', id] as const,
    products: (id: string) => ['admin', 'foods', 'products', id] as const,
  },
  /** Catalogue metrics and product intelligence. A product's keys share `product(id)` so one write refreshes them all. */
  adminProductAnalytics: {
    all: ['admin', 'product-analytics'] as const,
    catalogue: ['admin', 'product-analytics', 'catalogue'] as const,
    summary: (params: object) =>
      ['admin', 'product-analytics', 'catalogue', 'summary', params] as const,
    list: (params: object) => ['admin', 'product-analytics', 'catalogue', 'list', params] as const,
    analytics: (params: object) =>
      ['admin', 'product-analytics', 'catalogue', 'analytics', params] as const,
    activityAll: ['admin', 'product-analytics', 'activity'] as const,
    activity: (params: object) => ['admin', 'product-analytics', 'activity', params] as const,
    productAll: ['admin', 'product-analytics', 'product'] as const,
    product: (id: string) => ['admin', 'product-analytics', 'product', id] as const,
    performance: (id: string, params: object) =>
      ['admin', 'product-analytics', 'product', id, 'performance', params] as const,
    stock: (id: string, storeId?: string) =>
      ['admin', 'product-analytics', 'product', id, 'stock', storeId ?? null] as const,
    pricing: (id: string, storeId?: string) =>
      ['admin', 'product-analytics', 'product', id, 'pricing', storeId ?? null] as const,
    importJob: (id: string) => ['admin', 'product-analytics', 'import', id] as const,
  },
  adminAuditLogs: {
    all: ['admin', 'audit-logs'] as const,
    list: (params: object) => ['admin', 'audit-logs', 'list', params] as const,
    stats: (params: object) => ['admin', 'audit-logs', 'stats', params] as const,
    facets: (params: object) => ['admin', 'audit-logs', 'facets', params] as const,
    detail: (id: string) => ['admin', 'audit-logs', 'detail', id] as const,
  },
  // gen:resource:keys
} as const;
