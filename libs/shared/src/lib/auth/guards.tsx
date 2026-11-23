import {type ReactNode} from 'react';

import {Navigate, Outlet, useLocation} from 'react-router';

import {useMe} from '@grov/hooks';
import {Gate} from '@grov/models';
import {Alert, Button, Spinner} from '@grov/ui';

import {type PermissionRequirement, usePermissions} from './access';

export function FullPageSpinner({label = 'Loading'}: {label?: string}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas text-ink-muted">
      <Spinner className="size-8" label={label} />
    </div>
  );
}

/** Pending gates that send the person to the "finish your account" screen. */
const BLOCKING_GATES: string[] = [
  Gate.VERIFY_EMAIL,
  Gate.ADD_PHONE,
  Gate.ACCEPT_TERMS,
  Gate.MFA,
  Gate.MFA_ENROL,
];

export const safeRedirect = (value: string | null | undefined, fallback = '/'): string =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : fallback;

export interface RequireAuthProps {
  signInPath: string;
  /** Screen that clears pending gates (add phone, accept terms …). */
  gatesPath: string;
  children?: ReactNode;
}

/**
 * Layout guard for signed-in routes (D37: no app without an account).
 * Signed out → sign-in with `?redirectTo=`. Pending gates → the gates screen.
 */
export function RequireAuth({signInPath, gatesPath, children}: RequireAuthProps) {
  const {data: me, isPending, isError, refetch} = useMe();
  const location = useLocation();

  if (isPending) return <FullPageSpinner />;
  if (isError) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-6">
        <Alert tone="danger" title="We couldn’t load your account">
          Check your connection and try again.
        </Alert>
        <Button onClick={() => void refetch()}>Try again</Button>
      </div>
    );
  }
  if (!me) {
    const redirectTo = `${location.pathname}${location.search}`;
    return <Navigate to={`${signInPath}?redirectTo=${encodeURIComponent(redirectTo)}`} replace />;
  }
  if (me.gates.some(gate => BLOCKING_GATES.includes(gate)) && location.pathname !== gatesPath) {
    return <Navigate to={gatesPath} replace />;
  }
  return <>{children ?? <Outlet />}</>;
}

/** Layout guard for sign-in screens: someone already signed in goes on to the app. */
export function RequireGuest({children}: {children?: ReactNode}) {
  const {data: me, isPending} = useMe();
  const location = useLocation();
  if (isPending) return <FullPageSpinner />;
  if (me && me.gates.length === 0) {
    const params = new URLSearchParams(location.search);
    return <Navigate to={safeRedirect(params.get('redirectTo'))} replace />;
  }
  return <>{children ?? <Outlet />}</>;
}

export interface RequirePermissionProps extends PermissionRequirement {
  children: ReactNode;
  fallback?: ReactNode;
}

/** Route-level permission check with a clear "no access" page. */
export function RequirePermission({children, fallback, ...requirement}: RequirePermissionProps) {
  const {check, isPending} = usePermissions();
  if (isPending) return <FullPageSpinner />;
  return <>{check(requirement) ? children : (fallback ?? <NoAccess />)}</>;
}

export function NoAccess({
  title = 'You don’t have access to this page',
  description = 'Ask an admin with “Manage roles” to give your role the permission it needs.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-start gap-3 py-16">
      <h1 className="text-title-lg">{title}</h1>
      <p className="text-body text-ink-muted">{description}</p>
    </div>
  );
}
