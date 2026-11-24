import {useSearchParams} from 'react-router';

import {useInviteCheck} from '@grov/hooks';
import {appConfig} from '@grov/models';
import {AuthLayout, errorMessage} from '@grov/shared';
import {Skeleton} from '@grov/ui';

import {InviteAcceptForm} from '../components/invite/invite-accept-form';
import {InviteLinkProblem} from '../components/invite/invite-link-problem';
import type {Route} from './+types/invite';

export const meta: Route.MetaFunction = () => [
  {title: `Accept your invite · ${appConfig.brandName} admin`},
];

/**
 * Opened from the invite email: `/invite?t=<token>` (doc 32). The link proves
 * the mailbox; the password proves the person. Lands signed in to the console.
 */
export default function Invite() {
  const [params] = useSearchParams();
  const token = params.get('t');
  const check = useInviteCheck(token);

  const body = !token ? (
    <InviteLinkProblem message="This invite link is incomplete. Open it again from the email." />
  ) : check.isPending ? (
    <Skeleton className="h-64" />
  ) : check.isError ? (
    <InviteLinkProblem message={errorMessage(check.error, 'This invite link isn’t valid.')} />
  ) : (
    <InviteAcceptForm token={token} invite={check.data} />
  );

  return (
    <AuthLayout
      badge="Admin"
      title="You’re invited"
      description={`Join the ${appConfig.brandName} admin console.`}
    >
      {body}
    </AuthLayout>
  );
}
