import {useMatches} from 'react-router';

import type {PermissionRequirement} from '@grov/shared';

/**
 * What a route module exports as `handle` to declare the permissions it needs:
 *
 *   export const handle = {requires: {allOf: [PERMISSIONS.ACCESS.ROLES_READ]}} satisfies AdminRouteHandle;
 *
 * Keeping the requirement next to the page (not in a path → permission map)
 * means a moved or renamed route can never lose its check.
 */
export interface AdminRouteHandle {
  requires?: PermissionRequirement;
}

/** Every requirement on the matched route chain, merged (parents and child all apply). */
export function useRouteRequirement(): PermissionRequirement {
  const matches = useMatches();
  const allOf: PermissionRequirement['allOf'] = [];
  const anyOf: PermissionRequirement['anyOf'] = [];
  for (const match of matches) {
    const requires = (match.handle as AdminRouteHandle | undefined)?.requires;
    if (requires?.allOf) allOf.push(...requires.allOf);
    if (requires?.anyOf) anyOf.push(...requires.anyOf);
  }
  return {allOf, anyOf};
}
