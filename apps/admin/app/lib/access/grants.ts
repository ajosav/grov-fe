import type {AdminAccess, Role} from '@grov/models';

/**
 * Client copy of grov-be's grant rules (access/domain/grant-rules.ts), used
 * only to disable choices the server would refuse. The server decides.
 */
export const SUPER_ADMIN_ROLE = 'SUPER_ADMIN';

export function isSuperAdmin(admin: AdminAccess | null | undefined): boolean {
  return admin?.roles.includes(SUPER_ADMIN_ROLE) ?? false;
}

export function canGrantRole(
  admin: AdminAccess | null | undefined,
  role: Pick<Role, 'key' | 'permissionKeys'>
): boolean {
  if (!admin) return false;
  if (isSuperAdmin(admin)) return true;
  if (role.key === SUPER_ADMIN_ROLE) return false;
  const held = new Set(admin.permissions);
  return role.permissionKeys.every(key => held.has(key));
}

export function canGrantAllStores(admin: AdminAccess | null | undefined): boolean {
  return admin?.stores === 'ALL';
}
