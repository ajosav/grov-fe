import {Store} from 'lucide-react';

import {appConfig} from '@grov/models';
import {PageHeader} from '@grov/shared';
import {Card, EmptyState} from '@grov/ui';

import type {Route} from './+types/index';

export const meta: Route.MetaFunction = () => [{title: `Shop · ${appConfig.brandName}`}];

/** Placeholder until the Shop screens are built (see the design skill for the spec). */
export default function Shop() {
  return (
    <>
      <PageHeader title="Shop" description="Buy single items at this week’s prices." />
      <Card>
        <EmptyState
          icon={<Store />}
          title="Shop is coming"
          description="Browse foods by category and add them to your basket."
        />
      </Card>
    </>
  );
}
