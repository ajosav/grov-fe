import {LayoutDashboard, Settings, ShieldCheck} from 'lucide-react';
import {Outlet} from 'react-router';

import {PERMISSIONS} from '@grov/models';
import {
  AppShell,
  type NavItem,
  NoAccess,
  RequireAuth,
  RequirePermission,
  usePermissions,
  UserMenu,
  useSignOutAndLeave,
} from '@grov/shared';
import {Button} from '@grov/ui';

import {StoreSwitcher} from '../components/store-switcher';
import {useRouteRequirement} from '../lib/route-access';
import {paths} from '../paths';

const NAV: NavItem[] = [
  {to: paths.dashboard, label: 'Dashboard', icon: LayoutDashboard, end: true},
  {
    to: paths.roles,
    label: 'Roles and permissions',
    icon: ShieldCheck,
    requires: {allOf: [PERMISSIONS.ACCESS.ROLES_READ]},
  },
  {to: paths.settings, label: 'Settings', icon: Settings},
];

export default function ConsoleLayout() {
  return (
    <RequireAuth signInPath={paths.signIn} gatesPath={paths.finishAccount}>
      <RequireAdmin>
        <AppShell
          nav={NAV}
          badge="Admin"
          headerEnd={
            <>
              <StoreSwitcher />
              <UserMenu signedOutPath={paths.signIn} />
            </>
          }
        >
          <RoutePermissionGate />
        </AppShell>
      </RequireAdmin>
    </RequireAuth>
  );
}

/** Signed in, but `/v1/me` on the admin audience carries no admin block. */
function RequireAdmin({children}: {children: React.ReactNode}) {
  const {isAdmin} = usePermissions();
  const {signOut} = useSignOutAndLeave(paths.signIn);
  if (isAdmin) return <>{children}</>;
  return (
    <main className="mx-auto max-w-md px-6">
      <NoAccess
        title="This account isn’t an admin"
        description="Admin access is given by invitation. If you should have it, ask an admin to invite this email."
      />
      <Button variant="outline" onClick={signOut}>
        Sign out
      </Button>
    </main>
  );
}

function RoutePermissionGate() {
  const requirement = useRouteRequirement();
  return (
    <RequirePermission {...requirement}>
      <Outlet />
    </RequirePermission>
  );
}
