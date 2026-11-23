/**
 * TanStack Query keys, one factory per resource. Keys are arrays so a prefix
 * invalidates a family: `invalidateQueries({queryKey: queryKeys.admin.all})`.
 */
export const queryKeys = {
  me: ['me'] as const,
  config: ['config'] as const,
  admin: {
    all: ['admin'] as const,
    permissions: ['admin', 'permissions'] as const,
    roles: ['admin', 'roles'] as const,
    myStores: ['admin', 'my-stores'] as const,
  },
  // gen:resource:keys
} as const;
