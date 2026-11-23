import {Navigate} from 'react-router';

import {useMe} from '@grov/hooks';
import {appConfig} from '@grov/models';
import {AccountGates, AuthLayout, FullPageSpinner, useSignOutAndLeave} from '@grov/shared';

import {paths} from '../../paths';
import type {Route} from './+types/finish-account';

export const meta: Route.MetaFunction = () => [
  {title: `Finish your account · ${appConfig.brandName}`},
];

/** Pending gates (add phone after Google sign-up, new terms, email check). */
export default function FinishAccount() {
  const {data: me, isPending} = useMe();
  const {signOut} = useSignOutAndLeave(paths.signIn);
  if (isPending) return <FullPageSpinner />;
  if (!me) return <Navigate to={paths.signIn} replace />;
  if (me.gates.length === 0) return <Navigate to={paths.home} replace />;

  return (
    <AuthLayout title="Finish your account" description="One more step before you start.">
      <AccountGates
        termsHref={`${appConfig.websiteUrl}/terms`}
        privacyHref={`${appConfig.websiteUrl}/privacy`}
        onSignOut={signOut}
      />
    </AuthLayout>
  );
}
