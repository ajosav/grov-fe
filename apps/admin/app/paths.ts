export const paths = {
  dashboard: '/',
  signIn: '/sign-in',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  finishAccount: '/finish-account',
  invite: '/invite',
  settings: '/settings',
  designSystem: '/design-system',

  orders: '/orders',
  support: '/support',

  products: '/catalogue/products',
  productAnalytics: '/catalogue/analytics',
  productIntelligence: '/catalogue/intelligence',
  newProduct: '/catalogue/products/new',
  categories: '/catalogue/categories',
  listings: '/catalogue/listings',
  shopperRequests: '/catalogue/requests',

  stockLevels: '/stock/levels',
  /** Under Stock levels, so the breadcrumb and nav stay on Stock levels. */
  stockMetrics: '/stock/levels/metrics',
  stockRestock: '/stock/restock',
  stockMovements: '/stock/movements',
  stockReceipts: '/stock/receipts',
  stockGrns: '/stock/goods-received',
  stockBatches: '/stock/batches',
  stockTransfers: '/stock/transfers',
  stockCounts: '/stock/counts',
  stockLocations: '/stock/locations',
  suppliers: '/stock/suppliers',

  foods: '/meals/foods',
  meals: '/meals/library',

  householdPlans: '/planning/plans',
  householdExtras: '/planning/extras',
  planPreview: '/planning/preview',
  generationLog: '/planning/generation',
  plannerChanges: '/planning/changes',

  stores: '/stores',
  newStore: '/stores/new',
  cities: '/stores/cities',

  roles: '/access/roles',
  staff: '/access/staff',
  auditLogs: '/access/audit-logs',
} as const;

/** A store's page; `tab` opens a section (overview, zone, delivery, staff). */
export const storePath = (id: string, tab?: string) =>
  `${paths.stores}/${encodeURIComponent(id)}${tab ? `?tab=${tab}` : ''}`;

/** A product's workspace; `tab` opens a tab (overview, analytics, inventory, pricing, intelligence, information). */
export const productPath = (id: string, tab?: string) =>
  `${paths.products}/${encodeURIComponent(id)}${tab ? `?tab=${tab}` : ''}`;
