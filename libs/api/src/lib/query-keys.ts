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
    orderStats: (params: object) =>
      ['admin', 'product-analytics', 'orders', 'stats', params] as const,
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
  /** Stock at the active store. `admin` first, so switching store refreshes it. */
  adminStock: {
    all: ['admin', 'stock'] as const,
    overviewAll: ['admin', 'stock', 'overview'] as const,
    overview: (params: object) => ['admin', 'stock', 'overview', params] as const,
    summary: ['admin', 'stock', 'summary'] as const,
    movementsAll: ['admin', 'stock', 'movements'] as const,
    movements: (params: object) => ['admin', 'stock', 'movements', params] as const,
  },
  /** Inventory at the active store (suppliers are global but share the prefix for one invalidation). */
  adminInventory: {
    all: ['admin', 'inventory'] as const,
    locations: ['admin', 'inventory', 'locations'] as const,
    batchesAll: ['admin', 'inventory', 'batches'] as const,
    batches: (params: object) => ['admin', 'inventory', 'batches', params] as const,
    batch: (id: string) => ['admin', 'inventory', 'batch', id] as const,
    corrections: (id: string) => ['admin', 'inventory', 'corrections', id] as const,
    importJob: (id: string) => ['admin', 'inventory', 'import', id] as const,
    balances: (productId: string) => ['admin', 'inventory', 'balances', productId] as const,
    alerts: (params: object) => ['admin', 'inventory', 'alerts', params] as const,
    grns: (params: object) => ['admin', 'inventory', 'grns', params] as const,
    grn: (id: string) => ['admin', 'inventory', 'grn', id] as const,
    transfers: (params: object) => ['admin', 'inventory', 'transfers', params] as const,
    transfer: (id: string) => ['admin', 'inventory', 'transfer', id] as const,
    counts: (params: object) => ['admin', 'inventory', 'counts', params] as const,
    count: (id: string) => ['admin', 'inventory', 'count', id] as const,
    suppliers: (params: object) => ['admin', 'inventory', 'suppliers', params] as const,
    supplier: (id: string) => ['admin', 'inventory', 'supplier', id] as const,
  },
  // gen:resource:keys
} as const;
