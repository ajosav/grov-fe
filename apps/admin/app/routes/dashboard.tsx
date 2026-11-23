import {useMe} from '@grov/hooks';
import {appConfig} from '@grov/models';
import {PageHeader} from '@grov/shared';
import {Badge, Card, CardContent, CardDescription, CardHeader, CardTitle} from '@grov/ui';

import type {Route} from './+types/dashboard';

export const meta: Route.MetaFunction = () => [{title: `Dashboard · ${appConfig.brandName} admin`}];

export default function Dashboard() {
  const {data: me} = useMe();
  const admin = me?.access.admin;
  return (
    <>
      <PageHeader
        title={`Welcome, ${me?.firstName ?? ''}`}
        description="Catalogue, prices, stock and orders will be managed from here."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your roles</CardTitle>
            <CardDescription>
              {admin?.stores === 'ALL'
                ? 'Across every store, including new ones.'
                : `In ${admin?.stores.length ?? 0} store(s).`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {admin?.roles.length ? (
              admin.roles.map(role => (
                <Badge key={role} tone="flame">
                  {role}
                </Badge>
              ))
            ) : (
              <span className="text-body text-ink-muted">No roles yet.</span>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your permissions</CardTitle>
            <CardDescription>
              {admin?.permissions.length ?? 0} granted by your roles.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {admin?.permissions.map(key => (
              <Badge key={key}>
                <code>{key}</code>
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
