import {Outlet} from 'react-router';

import {
  NoAccess,
  RequireAuth,
  RequirePermission,
  usePermissions,
  useSignOutAndLeave,
} from '@grov/shared';
import {Button} from '@grov/ui';

import {AdminShell} from '../components/admin-shell';
import {useRouteRequirement} from '../lib/route-access';
import {paths} from '../paths';

/** The navigation lives in `lib/nav.ts`; the frame in `components/admin-shell.tsx`. */

export default function ConsoleLayout() {
  return (
    <RequireAuth signInPath={paths.signIn} gatesPath={paths.finishAccount}>
      <RequireAdmin>
        <AdminShell>
          <RoutePermissionGate />
        </AdminShell>
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
