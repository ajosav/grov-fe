import {screen, waitFor} from '@testing-library/react';

import type {Api} from '@grov/api';
import {PERMISSIONS} from '@grov/models';
import {adminMeFixture, meFixture, renderRoutes} from '@grov/test-utils';

import {Can, hasPermissions} from './access';
import {RequireAuth} from './guards';

const meApi = (me: unknown) =>
  ({me: {get: vi.fn().mockResolvedValue(me)}}) as unknown as Partial<Api>;

function routes() {
  return [
    {
      element: <RequireAuth signInPath="/sign-in" gatesPath="/finish" />,
      children: [{path: '/', element: <p>Home</p>}],
    },
    {path: '/sign-in', element: <p>Sign in page</p>},
    {path: '/finish', element: <p>Finish page</p>},
  ];
}

describe('RequireAuth', () => {
  it('sends signed-out people to sign-in', async () => {
    renderRoutes(routes(), {api: meApi(null)});
    expect(await screen.findByText('Sign in page')).toBeInTheDocument();
  });

  it('sends people with pending gates to the gates screen', async () => {
    renderRoutes(routes(), {api: meApi(meFixture({gates: ['ADD_PHONE']}))});
    expect(await screen.findByText('Finish page')).toBeInTheDocument();
  });

  it('renders the page for a signed-in person', async () => {
    renderRoutes(routes(), {api: meApi(meFixture())});
    await waitFor(() => expect(screen.getByText('Home')).toBeInTheDocument());
  });
});

describe('permissions', () => {
  const access = adminMeFixture([PERMISSIONS.ACCESS.ROLES_READ]).access;

  it('checks allOf and anyOf', () => {
    expect(hasPermissions(access, {allOf: [PERMISSIONS.ACCESS.ROLES_READ]})).toBe(true);
    expect(hasPermissions(access, {allOf: [PERMISSIONS.ACCESS.ROLES_MANAGE]})).toBe(false);
    expect(
      hasPermissions(access, {
        anyOf: [PERMISSIONS.ACCESS.ROLES_MANAGE, PERMISSIONS.ACCESS.ROLES_READ],
      })
    ).toBe(true);
    expect(hasPermissions(null, {allOf: [PERMISSIONS.ACCESS.ROLES_READ]})).toBe(false);
  });

  it('<Can> hides what the admin cannot use', async () => {
    renderRoutes(
      [
        {
          path: '/',
          element: (
            <>
              <Can permission={PERMISSIONS.ACCESS.ROLES_READ}>
                <p>See roles</p>
              </Can>
              <Can permission={PERMISSIONS.ACCESS.ROLES_MANAGE} fallback={<p>Read only</p>}>
                <p>Edit roles</p>
              </Can>
            </>
          ),
        },
      ],
      {api: meApi(adminMeFixture([PERMISSIONS.ACCESS.ROLES_READ]))}
    );
    expect(await screen.findByText('See roles')).toBeInTheDocument();
    expect(screen.getByText('Read only')).toBeInTheDocument();
    expect(screen.queryByText('Edit roles')).not.toBeInTheDocument();
  });
});
