import {index, layout, route, type RouteConfig} from '@react-router/dev/routes';

const pg = (page: string) => `pages/${page}.tsx`;
const layoutPg = (layout: string) => `layouts/${layout}.tsx`;

export default [
  layout(layoutPg('auth-layout'), [
    route('sign-in', pg('auth/sign-in')),
    route('forgot-password', pg('auth/forgot-password')),
    route('reset-password', pg('auth/reset-password')),
    // grov-be's reset emails link to `<APP_WEB_URL>/r/reset?t=…` (otp.handlers.ts).
    route('r/reset', pg('auth/reset-password'), {id: 'reset-password-link'}),
  ]),
  route('finish-account', pg('auth/finish-account')),
  // Staff invite link: public, and works even while signed in as someone else.
  route('invite', pg('invite')),
  layout(layoutPg('console-layout'), [
    index(pg('dashboard')),
    route('orders', pg('orders/orders')),
    // Support has no sidebar entry: Inbox in the top bar, the panel, or ⌘K.
    route('support', pg('support')),

    route('catalogue/products', pg('catalogue/products')),
    route('catalogue/products/new', pg('catalogue/new-product')),
    route('catalogue/products/:productId', pg('catalogue/product')),
    route('catalogue/analytics', pg('catalogue/analytics')),
    route('catalogue/intelligence', pg('catalogue/intelligence')),
    route('catalogue/categories', pg('catalogue/categories')),
    route('catalogue/listings', pg('catalogue/listings')),
    route('catalogue/requests', pg('catalogue/requests')),

    route('stock/levels', pg('stock/levels')),
    route('stock/levels/metrics', pg('stock/metrics')),
    route('stock/restock', pg('stock/restock')),
    route('stock/movements', pg('stock/movements')),
    route('stock/receipts', pg('stock/receipts')),
    route('stock/goods-received', pg('stock/goods-received')),
    route('stock/batches', pg('stock/batches')),
    route('stock/transfers', pg('stock/transfers')),
    route('stock/counts', pg('stock/counts')),
    route('stock/locations', pg('stock/locations')),
    route('stock/suppliers', pg('stock/suppliers')),

    route('meals/foods', pg('meals/foods')),
    route('meals/library', pg('meals/library')),

    route('planning/plans', pg('planning/plans')),
    route('planning/extras', pg('planning/extras')),
    route('planning/preview', pg('planning/preview')),
    route('planning/generation', pg('planning/generation')),
    route('planning/changes', pg('planning/changes')),

    route('stores', pg('stores/stores')),
    route('stores/new', pg('stores/new-store')),
    route('stores/cities', pg('stores/cities')),
    route('stores/:storeId', pg('stores/store')),

    route('access/staff', pg('access/staff')),
    route('access/roles', pg('access/roles')),
    route('access/audit-logs', pg('audit/audit-logs')),
    route('settings', pg('settings')),
  ]),
  // Component gallery: dev only (or VITE_SHOW_DESIGN_SYSTEM). No sign-in, no API calls.
  route('design-system', pg('design-system')),
  route('*', pg('not-found')),
] satisfies RouteConfig;
