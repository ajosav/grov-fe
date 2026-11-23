# Routing: pages, layouts, guards

_Part of the `frontend` skill. **[enforced]** = checked by ESLint, `check:arch`, typecheck, hooks or CI._

React Router 7, framework mode, config routes. `app` and `admin` are SPAs (`ssr: false`); `website` is prerendered (see `website.md`).

## Add a page

1. Add the URL to `app/paths.ts` and the route to `app/routes.ts` (config-based; no file-system routing). Every file named there must exist and default-export the page **[enforced: `check:arch` route-module]**.
2. Create `app/routes/<area>/<name>.tsx`:

```tsx
import {useOrders} from '@grov/hooks';
import {appConfig} from '@grov/models';
import {PageHeader} from '@grov/shared';

import type {Route} from './+types/orders';

export const meta: Route.MetaFunction = () => [{title: `Orders · ${appConfig.brandName}`}];

export default function Orders() {
  const orders = useOrders();
  // loading → <Skeleton>, error → <Alert>, empty → <EmptyState>, data → list
  return <PageHeader title="Orders" />;
}
```

3. `yarn nx run <app>:typecheck` runs `react-router typegen`, creating `./+types/<name>` **[enforced: typecheck]**.
4. Every page has a `meta` title (`<Page> · ${appConfig.brandName}`; admin adds ` admin`).
5. Link with `<Link to={paths.x}>` / `<NavLink>`; add a nav item to the layout's `NAV` only when the page exists.

## Data in routes

Call `@grov/hooks` inside the page. No `clientLoader` for API data: TanStack Query owns caching, retries and invalidation (`data.md`). Every data view handles loading, empty and error states.

Filters, tabs, search and pagination that should survive reload or be shareable live in the URL (`useSearchParams`), not in component state (`state.md`).

## Guards (from `@grov/shared`)

| Guard                                | Where                             | Does                                                                   |
| ------------------------------------ | --------------------------------- | ---------------------------------------------------------------------- |
| `<RequireAuth signInPath gatesPath>` | layout of signed-in routes        | Signed out → sign-in with `?redirectTo=`; pending gates → gates screen |
| `<RequireGuest>`                     | layout of sign-in routes          | Signed in → `redirectTo` or home                                       |
| `<RequirePermission allOf anyOf>`    | content needing admin permissions | Otherwise `<NoAccess>`                                                 |

- Customer app: every product route sits under `RequireAuth` (D37, no guest mode).
- Redirect targets always go through `safeRedirect()` (same-origin paths only) — see `security.md`.

## Admin page permissions

Declare them on the route module; the console layout enforces them for the whole matched chain:

```tsx
import {PERMISSIONS} from '@grov/models';

import type {AdminRouteHandle} from '../../lib/route-access';

export const handle = {
  requires: {allOf: [PERMISSIONS.PRICING.READ]},
} satisfies AdminRouteHandle;
```

The nav item gets the same `requires`, so nobody sees a link they can't open. Actions inside the page use `<Can>` (`auth.md`). Never key permissions by URL prefix: moving a route would drop its check.

## Errors and 404

Each app's `root.tsx` exports `ErrorBoundary` (`RouteErrorContent`) and `HydrateFallback`; a `*` route renders 404. Add a per-page error boundary only when the page can recover on its own.
