import {CalendarDays} from 'lucide-react';

import {useMe} from '@grov/hooks';
import {appConfig} from '@grov/models';
import {PageHeader} from '@grov/shared';
import {Card, EmptyState} from '@grov/ui';

import type {Route} from './+types/home';

export const meta: Route.MetaFunction = () => [{title: `Home · ${appConfig.brandName}`}];

export default function Home() {
  const {data: me} = useMe();
  return (
    <>
      <PageHeader
        title={`Hello, ${me?.firstName ?? 'there'}`}
        description="Your food plan, basket and orders will live here."
      />
      <Card>
        <EmptyState
          icon={<CalendarDays />}
          title="No plan yet"
          description="Plan set-up, Shop and Orders are the next screens to build on this app."
        />
      </Card>
    </>
  );
}
