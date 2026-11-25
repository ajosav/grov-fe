import {appConfig} from '@grov/models';
import {PageHeader} from '@grov/shared';
import {Card, CardContent, CardDescription, CardHeader, CardTitle, ThemeToggle} from '@grov/ui';

import {SidebarThemePicker} from '../components/shell/sidebar-theme-picker';
import type {Route} from './+types/settings';

export const meta: Route.MetaFunction = () => [{title: `Settings · ${appConfig.brandName} admin`}];

export default function Settings() {
  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid max-w-3xl gap-6">
        <Card>
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
        <Card>
          <CardHeader>
            <CardTitle>Sidebar theme</CardTitle>
            <CardDescription>
              Colours the sidebar and top bar, text and the Inbox count included. Saved in this
              browser. Also in the palette button next to Settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SidebarThemePicker />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
