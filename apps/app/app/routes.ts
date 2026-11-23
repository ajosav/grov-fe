import {index, layout, route, type RouteConfig} from '@react-router/dev/routes';

export default [
  layout('routes/auth/layout.tsx', [
    route('sign-in', 'routes/auth/sign-in.tsx'),
    route('sign-in/code', 'routes/auth/code.tsx'),
    route('sign-in/profile', 'routes/auth/profile.tsx'),
  ]),
  route('finish-account', 'routes/auth/finish-account.tsx'),
  layout('routes/app-layout.tsx', [
    index('routes/home.tsx'),
    route('shop', 'routes/shop/index.tsx'),
    route('plan', 'routes/plan/index.tsx'),
    route('orders', 'routes/orders/index.tsx'),
    route('savings', 'routes/savings/index.tsx'),
    route('account', 'routes/account/index.tsx'),
  ]),
  // Component gallery: dev only (or VITE_SHOW_DESIGN_SYSTEM). No sign-in, no API calls.
  route('design-system', 'routes/design-system.tsx'),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
