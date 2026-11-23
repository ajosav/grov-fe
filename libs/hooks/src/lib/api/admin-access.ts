import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {queryKeys, useApi} from '@grov/api';
import type {CreateRoleBody} from '@grov/models';

export function usePermissionCatalogue(enabled = true) {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.admin.permissions,
    queryFn: api.adminAccess.permissions,
    staleTime: 5 * 60_000,
    enabled,
  });
}

export function useRoles() {
  const api = useApi();
  return useQuery({queryKey: queryKeys.admin.roles, queryFn: api.adminAccess.roles});
}

export function useCreateRole() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRoleBody) => api.adminAccess.createRole(body),
    onSuccess: () => queryClient.invalidateQueries({queryKey: queryKeys.admin.roles}),
  });
}

export function useMyStores(enabled = true) {
  const api = useApi();
  return useQuery({queryKey: queryKeys.admin.myStores, queryFn: api.adminAccess.myStores, enabled});
}

export function useSwitchStore() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storeId: string) => api.adminAccess.switchStore({storeId}),
    onSuccess: async stores => {
      queryClient.setQueryData(queryKeys.admin.myStores, stores);
      await queryClient.invalidateQueries({
        predicate: q => q.queryKey[0] === 'admin' && q.queryKey[1] !== 'my-stores',
      });
    },
  });
}
