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
  newProduct: '/catalogue/products/new',
  categories: '/catalogue/categories',
  listings: '/catalogue/listings',
  shopperRequests: '/catalogue/requests',

  stockLevels: '/stock/levels',
  stockMovements: '/stock/movements',
  stockReceipts: '/stock/receipts',

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
} as const;

/** A store's page; `tab` opens a section (overview, zone, delivery, staff). */
export const storePath = (id: string, tab?: string) =>
  `${paths.stores}/${encodeURIComponent(id)}${tab ? `?tab=${tab}` : ''}`;

/** A product's page; `tab` opens a section (details, sizes, prep, images, availability). */
export const productPath = (id: string, tab?: string) =>
  `${paths.products}/${encodeURIComponent(id)}${tab ? `?tab=${tab}` : ''}`;
