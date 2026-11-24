import {useInfiniteQuery, useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {queryKeys, useApi} from '@grov/api';
import type {
  AdminInviteStatus,
  CreateInviteBody,
  CreateRoleBody,
  StaffMember,
  StaffStatus,
  UpdateRoleBody,
  UpdateStaffAccessBody,
} from '@grov/models';

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

/** Role edits change holders' permissions and the staff list's role names. */
function useRolesChanged() {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({queryKey: queryKeys.admin.roles}),
      queryClient.invalidateQueries({queryKey: queryKeys.adminStaff.all}),
    ]);
  };
}

export function useUpdateRole() {
  const api = useApi();
  const changed = useRolesChanged();
  return useMutation({
    mutationFn: ({id, body}: {id: string; body: UpdateRoleBody}) =>
      api.adminAccess.updateRole(id, body),
    onSuccess: changed,
  });
}

export function useArchiveRole() {
  const api = useApi();
  const changed = useRolesChanged();
  return useMutation({
    mutationFn: ({id, archived}: {id: string; archived: boolean}) =>
      archived ? api.adminAccess.archiveRole(id) : api.adminAccess.restoreRole(id),
    onSuccess: changed,
  });
}

export interface StaffFilters {
  status?: StaffStatus;
  storeId?: string;
  roleId?: string;
  q?: string;
}

/** Staff with admin access, newest first (cursor-paginated). */
export function useStaff(filters: StaffFilters = {}, enabled = true) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: queryKeys.adminStaff.list(filters),
    queryFn: ({pageParam}) => api.adminAccess.staff({...filters, cursor: pageParam}),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => page.meta?.nextCursor ?? undefined,
    enabled,
  });
}

/** After a change to someone's access: their row, the lists, and role holder counts. */
function useStaffChanged() {
  const queryClient = useQueryClient();
  return async (member?: StaffMember | void) => {
    if (member) queryClient.setQueryData(queryKeys.adminStaff.detail(member.userId), member);
    await Promise.all([
      queryClient.invalidateQueries({queryKey: queryKeys.adminStaff.lists}),
      queryClient.invalidateQueries({queryKey: queryKeys.admin.roles}),
    ]);
  };
}

export function useUpdateStaffAccess() {
  const api = useApi();
  const changed = useStaffChanged();
  return useMutation({
    mutationFn: ({userId, body}: {userId: string; body: UpdateStaffAccessBody}) =>
      api.adminAccess.updateStaffAccess(userId, body),
    onSuccess: changed,
  });
}

export type StaffAction = 'suspend' | 'resume' | 'remove';

export function useStaffAction() {
  const api = useApi();
  const changed = useStaffChanged();
  return useMutation({
    mutationFn: async ({userId, action}: {userId: string; action: StaffAction}) => {
      if (action === 'suspend') return api.adminAccess.suspendStaff(userId);
      if (action === 'resume') return api.adminAccess.resumeStaff(userId);
      await api.adminAccess.removeStaff(userId);
      return undefined;
    },
    onSuccess: changed,
  });
}

export function useInvites(status: AdminInviteStatus, enabled = true) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: queryKeys.adminStaff.invites(status),
    queryFn: ({pageParam}) => api.adminAccess.invites(status, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => page.meta?.nextCursor ?? undefined,
    enabled,
  });
}

function useInvitesChanged() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({queryKey: queryKeys.adminStaff.allInvites});
}

export function useCreateInvite() {
  const api = useApi();
  const changed = useInvitesChanged();
  return useMutation({
    /** `idempotencyKey`: created when the dialog opens, reused on retry (data.md). */
    mutationFn: ({body, idempotencyKey}: {body: CreateInviteBody; idempotencyKey: string}) =>
      api.adminAccess.createInvite(body, idempotencyKey),
    onSuccess: changed,
  });
}

export function useInviteAction() {
  const api = useApi();
  const changed = useInvitesChanged();
  return useMutation({
    mutationFn: async ({id, action}: {id: string; action: 'resend' | 'revoke'}) => {
      if (action === 'resend') return api.adminAccess.resendInvite(id);
      await api.adminAccess.revokeInvite(id);
      return undefined;
    },
    onSuccess: changed,
  });
}
