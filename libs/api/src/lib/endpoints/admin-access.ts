import type {
  AdminInvite,
  CreateInviteBody,
  CreateRoleBody,
  MyStores,
  PermissionGroup,
  Role,
  SetActiveStoreBody,
  StaffMember,
  StaffStatus,
  UpdateRoleBody,
  UpdateStaffAccessBody,
} from '@grov/models';

import type {ApiClient} from '../client';

export interface StaffListParams {
  status?: StaffStatus;
  storeId?: string;
  roleId?: string;
  q?: string;
  cursor?: string;
  limit?: number;
}

/** Admin console: roles, staff, invites, the permission catalogue and the working store. */
export function adminAccessApi(client: ApiClient) {
  const role = (id: string) => `/v1/admin/roles/${encodeURIComponent(id)}`;
  const staff = (id: string) => `/v1/admin/staff/${encodeURIComponent(id)}`;
  const invite = (id: string) => `/v1/admin/staff/invites/${encodeURIComponent(id)}`;
  return {
    permissions: () =>
      client.request<PermissionGroup[]>({method: 'get', url: '/v1/admin/permissions'}),
    roles: () => client.request<Role[]>({method: 'get', url: '/v1/admin/roles'}),
    createRole: (body: CreateRoleBody) =>
      client.request<Role>({method: 'post', url: '/v1/admin/roles', data: body}),
    updateRole: (id: string, body: UpdateRoleBody) =>
      client.request<Role>({method: 'patch', url: role(id), data: body}),
    archiveRole: (id: string) => client.request<Role>({method: 'post', url: `${role(id)}/archive`}),
    restoreRole: (id: string) => client.request<Role>({method: 'post', url: `${role(id)}/restore`}),

    staff: (params: StaffListParams = {}) =>
      client.requestEnvelope<StaffMember[]>({method: 'get', url: '/v1/admin/staff', params}),
    staffMember: (userId: string) =>
      client.request<StaffMember>({method: 'get', url: staff(userId)}),
    updateStaffAccess: (userId: string, body: UpdateStaffAccessBody) =>
      client.request<StaffMember>({method: 'put', url: `${staff(userId)}/access`, data: body}),
    suspendStaff: (userId: string) =>
      client.request<StaffMember>({method: 'post', url: `${staff(userId)}/suspend`}),
    resumeStaff: (userId: string) =>
      client.request<StaffMember>({method: 'post', url: `${staff(userId)}/resume`}),
    removeStaff: (userId: string) => client.request<void>({method: 'delete', url: staff(userId)}),

    invites: (status: AdminInvite['status'], cursor?: string) =>
      client.requestEnvelope<AdminInvite[]>({
        method: 'get',
        url: '/v1/admin/staff/invites',
        params: {status, cursor},
      }),
    /** grov-be requires an Idempotency-Key: one per user intent, reused on retry. */
    createInvite: (body: CreateInviteBody, idempotencyKey: string) =>
      client.request<AdminInvite>({
        method: 'post',
        url: '/v1/admin/staff/invites',
        data: body,
        headers: {'Idempotency-Key': idempotencyKey},
      }),
    resendInvite: (id: string) =>
      client.request<AdminInvite>({method: 'post', url: `${invite(id)}/resend`}),
    revokeInvite: (id: string) => client.request<void>({method: 'delete', url: invite(id)}),

    myStores: () => client.request<MyStores>({method: 'get', url: '/v1/admin/active-store'}),
    switchStore: (body: SetActiveStoreBody) =>
      client.request<MyStores>({method: 'put', url: '/v1/admin/active-store', data: body}),
  };
}
export type AdminAccessApi = ReturnType<typeof adminAccessApi>;
