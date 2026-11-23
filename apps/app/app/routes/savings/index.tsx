import {PiggyBank} from 'lucide-react';

import {appConfig} from '@grov/models';
import {PageHeader} from '@grov/shared';
import {Card, EmptyState} from '@grov/ui';

import type {Route} from './+types/index';

export const meta: Route.MetaFunction = () => [{title: `Savings · ${appConfig.brandName}`}];

/** Placeholder until the Savings screens are built (see the design skill for the spec). */
export default function Savings() {
  return (
    <>
      <PageHeader title="Savings" description="What you’ve saved and your Food balance." />
      <Card>
        <EmptyState
          icon={<PiggyBank />}
          title="Nothing saved yet"
          description="Savings against market prices and your Food balance will show here."
        />
      </Card>
    </>
  );
}
