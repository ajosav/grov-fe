import {index, layout, route, type RouteConfig} from '@react-router/dev/routes';

/**
 * Admin console. Same account as the customer app, separate session and
 * cookies (audience ADMIN). Each page declares the permissions it needs in its
 * `handle` (see lib/route-access.ts); the layout enforces them.
 */
export default [
  layout('routes/auth/layout.tsx', [
    route('sign-in', 'routes/auth/sign-in.tsx'),
    route('forgot-password', 'routes/auth/forgot-password.tsx'),
    route('reset-password', 'routes/auth/reset-password.tsx'),
    // grov-be's reset emails link to `<APP_WEB_URL>/r/reset?t=…` (otp.handlers.ts).
    route('r/reset', 'routes/auth/reset-password.tsx', {id: 'reset-password-link'}),
  ]),
  route('finish-account', 'routes/auth/finish-account.tsx'),
  layout('routes/console-layout.tsx', [
    index('routes/dashboard.tsx'),
    route('access/roles', 'routes/access/roles.tsx'),
    route('settings', 'routes/settings.tsx'),
  ]),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
