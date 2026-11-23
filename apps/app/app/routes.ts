import {index, layout, route, type RouteConfig} from '@react-router/dev/routes';

/**
 * Customer web app. Auth-first (D37): every product screen sits under the
 * signed-in layout; sign-in screens send signed-in people on.
 */
export default [
  layout('routes/auth/layout.tsx', [
    route('sign-in', 'routes/auth/sign-in.tsx'),
    route('sign-in/code', 'routes/auth/code.tsx'),
    route('sign-in/profile', 'routes/auth/profile.tsx'),
  ]),
  route('finish-account', 'routes/auth/finish-account.tsx'),
  layout('routes/app-layout.tsx', [
    index('routes/home.tsx'),
    route('account', 'routes/account/index.tsx'),
  ]),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
