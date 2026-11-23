import {appConfig} from '@grov/models';
import {PageHeader} from '@grov/shared';
import {Card, CardContent, CardDescription, CardHeader, CardTitle, ThemeToggle} from '@grov/ui';

import type {Route} from './+types/settings';

export const meta: Route.MetaFunction = () => [{title: `Settings · ${appConfig.brandName} admin`}];

export default function Settings() {
  return (
    <>
      <PageHeader title="Settings" />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Saved to your account. “Device” follows your system setting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>
    </>
  );
}
