import {type ReactNode, useMemo} from 'react';

import {useMe} from '@grov/hooks';
import type {Access, PermissionKey} from '@grov/models';

/**
 * Permission checks for the UI. The server is the authority (every admin route
 * has `@RequirePermission`); hiding what someone cannot use is a courtesy, not
 * security. Permissions come from `GET /v1/me` → `access.admin.permissions`.
 */
export interface PermissionRequirement {
  /** Every key must be held. */
  allOf?: PermissionKey[];
  /** At least one key must be held. */
  anyOf?: PermissionKey[];
}

export function hasPermissions(
  access: Access | null | undefined,
  {allOf = [], anyOf = []}: PermissionRequirement
): boolean {
  const held = new Set(access?.admin?.permissions ?? []);
  return (
    allOf.every(key => held.has(key)) && (anyOf.length === 0 || anyOf.some(key => held.has(key)))
  );
}

export function usePermissions() {
  const {data: me, isPending} = useMe();
  const access = me?.access ?? null;
  return useMemo(
    () => ({
      isPending,
      access,
      isAdmin: Boolean(access?.admin),
      can: (key: PermissionKey) => hasPermissions(access, {allOf: [key]}),
      check: (requirement: PermissionRequirement) => hasPermissions(access, requirement),
    }),
    [access, isPending]
  );
}

export interface CanProps extends PermissionRequirement {
  /** Shorthand for a single key. */
  permission?: PermissionKey;
  children: ReactNode;
  fallback?: ReactNode;
}

/** Renders children only when the signed-in admin holds the permissions. */
export function Can({permission, allOf = [], anyOf, children, fallback = null}: CanProps) {
  const {check} = usePermissions();
  const required = permission ? [...allOf, permission] : allOf;
  return <>{check({allOf: required, anyOf}) ? children : fallback}</>;
}
