import {describe, expect, it} from 'vitest';

import {canGrantAllStores, canGrantRole} from './grants';

const manager = {
  roles: ['STORE_MANAGER'],
  permissions: ['stock.read', 'stock.write'],
  stores: ['s1'],
};
const superAdmin = {roles: ['SUPER_ADMIN'], permissions: [], stores: 'ALL' as const};

describe('grant rules', () => {
  it('allows roles made only of permissions you hold', () => {
    expect(canGrantRole(manager, {key: 'CLERK', permissionKeys: ['stock.read']})).toBe(true);
    expect(canGrantRole(manager, {key: 'FIN', permissionKeys: ['orders.read']})).toBe(false);
    expect(canGrantRole(manager, {key: 'SUPER_ADMIN', permissionKeys: []})).toBe(false);
    expect(canGrantRole(superAdmin, {key: 'SUPER_ADMIN', permissionKeys: []})).toBe(true);
  });

  it('needs all-store access to grant all stores', () => {
    expect(canGrantAllStores(manager)).toBe(false);
    expect(canGrantAllStores(superAdmin)).toBe(true);
  });
});
