export const paths = {
  dashboard: '/',
  signIn: '/sign-in',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  finishAccount: '/finish-account',
  settings: '/settings',
  designSystem: '/design-system',

  orders: '/orders',
  support: '/support',

  products: '/catalogue/products',
  categories: '/catalogue/categories',
  listings: '/catalogue/listings',
  shopperRequests: '/catalogue/requests',

  basePrices: '/pricing/base',
  markups: '/pricing/markups',
  publishPrices: '/pricing/publish',

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
  cities: '/stores/cities',

  roles: '/access/roles',
  staff: '/access/staff',
} as const;
