import {index, layout, route, type RouteConfig} from '@react-router/dev/routes';

const pg = (page: string) => `pages/${page}.tsx`;
const layoutPg = (layout: string) => `layouts/${layout}.tsx`;

export default [
  layout(layoutPg('auth-layout'), [
    route('sign-in', pg('auth/sign-in')),
    route('sign-in/code', pg('auth/code')),
    route('sign-in/profile', pg('auth/profile')),
  ]),
  route('finish-account', pg('auth/finish-account')),
  layout(layoutPg('app-layout'), [
    index(pg('home')),
    route('shop', pg('shop/index')),
    route('plan', pg('plan/index')),
    route('orders', pg('orders/index')),
    route('savings', pg('savings/index')),
    route('account', pg('account/index')),
  ]),
  // Component gallery: dev only (or VITE_SHOW_DESIGN_SYSTEM). No sign-in, no API calls.
  route('design-system', pg('design-system')),
  route('*', pg('not-found')),
] satisfies RouteConfig;
