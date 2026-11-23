import type {Access, Me} from '@grov/models';

/** A signed-in customer with no pending gates. Fixture brand-neutral data only. */
export function meFixture(overrides: Partial<Me> = {}): Me {
  return {
    id: '01929b7a-3c3e-7c4a-9f1e-6b2f1c9d8e7a',
    firstName: 'Ngozi',
    lastName: 'Okafor',
    email: 'ngozi@example.com',
    emailVerified: true,
    phone: '+2348031234567',
    locale: 'en-NG',
    theme: 'system',
    gates: [],
    access: accessFixture(),
    createdAt: '2026-11-01T09:00:00Z',
    ...overrides,
  };
}

export function accessFixture(overrides: Partial<Access> = {}): Access {
  return {
    version: 1,
    audiences: ['app'],
    memberships: [{type: 'CLIENT', status: 'ACTIVE'}],
    admin: null,
    ...overrides,
  };
}

/** An admin with the given permissions over every store. */
export function adminMeFixture(permissions: string[], overrides: Partial<Me> = {}): Me {
  return meFixture({
    access: accessFixture({
      audiences: ['app', 'admin'],
      memberships: [
        {type: 'CLIENT', status: 'ACTIVE'},
        {type: 'ADMIN', status: 'ACTIVE'},
      ],
      admin: {roles: ['test-role'], permissions, stores: 'ALL'},
    }),
    ...overrides,
  });
}
