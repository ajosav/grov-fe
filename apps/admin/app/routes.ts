import { index, layout, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  layout('routes/auth/layout.tsx', [
    route('sign-in', 'routes/auth/sign-in.tsx'),
    route('forgot-password', 'routes/auth/forgot-password.tsx'),
    route('reset-password', 'routes/auth/reset-password.tsx'),
    // grov-be's reset emails link to `<APP_WEB_URL>/r/reset?t=…` (otp.handlers.ts).
    route('r/reset', 'routes/auth/reset-password.tsx', { id: 'reset-password-link' }),
  ]),
  route('finish-account', 'routes/auth/finish-account.tsx'),
  layout('routes/console-layout.tsx', [
    index('routes/dashboard.tsx'),
    route('orders', 'routes/orders/orders.tsx'),
    // Support has no sidebar entry: Inbox in the top bar, the panel, or ⌘K.
    route('support', 'routes/support.tsx'),

    route('catalogue/products', 'routes/catalogue/products.tsx'),
    route('catalogue/categories', 'routes/catalogue/categories.tsx'),
    route('catalogue/listings', 'routes/catalogue/listings.tsx'),
    route('catalogue/requests', 'routes/catalogue/requests.tsx'),

    route('pricing/base', 'routes/pricing/base.tsx'),
    route('pricing/markups', 'routes/pricing/markups.tsx'),
    route('pricing/publish', 'routes/pricing/publish.tsx'),

    route('stock/levels', 'routes/stock/levels.tsx'),
    route('stock/movements', 'routes/stock/movements.tsx'),
    route('stock/receipts', 'routes/stock/receipts.tsx'),

    route('meals/foods', 'routes/meals/foods.tsx'),
    route('meals/library', 'routes/meals/library.tsx'),

    route('planning/plans', 'routes/planning/plans.tsx'),
    route('planning/extras', 'routes/planning/extras.tsx'),
    route('planning/preview', 'routes/planning/preview.tsx'),
    route('planning/generation', 'routes/planning/generation.tsx'),
    route('planning/changes', 'routes/planning/changes.tsx'),

    route('stores', 'routes/stores/stores.tsx'),
    route('stores/cities', 'routes/stores/cities.tsx'),

    route('access/staff', 'routes/access/staff.tsx'),
    route('access/roles', 'routes/access/roles.tsx'),
    route('settings', 'routes/settings.tsx'),
  ]),
  // Component gallery: dev only (or VITE_SHOW_DESIGN_SYSTEM). No sign-in, no API calls.
  route('design-system', 'routes/design-system.tsx'),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
