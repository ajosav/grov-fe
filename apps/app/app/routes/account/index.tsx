import {useMe} from '@grov/hooks';
import {appConfig} from '@grov/models';
import {PageHeader, useSignOutAndLeave} from '@grov/shared';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  formatNigerianPhone,
  ThemeToggle,
} from '@grov/ui';

import {paths} from '../../paths';
import type {Route} from './+types/index';

export const meta: Route.MetaFunction = () => [{title: `Account · ${appConfig.brandName}`}];

export default function Account() {
  const {data: me} = useMe();
  const {signOut, isPending} = useSignOutAndLeave(paths.signIn);
  if (!me) return null;
  return (
    <>
      <PageHeader title="Account" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-body">
              <Row label="Name" value={[me.firstName, me.lastName].filter(Boolean).join(' ')} />
              <Row label="Email" value={me.email} />
              <Row label="Phone" value={me.phone ? formatNigerianPhone(me.phone) : 'Not added'} />
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Saved to your account, so it follows you to other devices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeToggle />
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <Button variant="outline" loading={isPending} onClick={signOut}>
          Sign out
        </Button>
      </div>
    </>
  );
}

function Row({label, value}: {label: string; value: string}) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-line pb-3 last:border-0 last:pb-0">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
