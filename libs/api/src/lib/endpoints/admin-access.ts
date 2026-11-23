import type {
  CreateRoleBody,
  MyStores,
  PermissionGroup,
  Role,
  SetActiveStoreBody,
} from '@grov/models';

import type {ApiClient} from '../client';

/** Admin console: roles, the permission catalogue and the store this session works in. */
export function adminAccessApi(client: ApiClient) {
  return {
    permissions: () =>
      client.request<PermissionGroup[]>({method: 'get', url: '/v1/admin/permissions'}),
    roles: () => client.request<Role[]>({method: 'get', url: '/v1/admin/roles'}),
    createRole: (body: CreateRoleBody) =>
      client.request<Role>({method: 'post', url: '/v1/admin/roles', data: body}),
    myStores: () => client.request<MyStores>({method: 'get', url: '/v1/admin/active-store'}),
    switchStore: (body: SetActiveStoreBody) =>
      client.request<MyStores>({method: 'put', url: '/v1/admin/active-store', data: body}),
  };
}
export type AdminAccessApi = ReturnType<typeof adminAccessApi>;
