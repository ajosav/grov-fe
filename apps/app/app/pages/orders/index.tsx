import {ClipboardList} from 'lucide-react';

import {appConfig} from '@grov/models';
import {PageHeader} from '@grov/shared';
import {Card, EmptyState} from '@grov/ui';

import type {Route} from './+types/index';

export const meta: Route.MetaFunction = () => [{title: `Orders · ${appConfig.brandName}`}];

/** Placeholder until the Orders screens are built (see the design skill for the spec). */
export default function Orders() {
  return (
    <>
      <PageHeader title="Orders" description="Deliveries, receipts and changes." />
      <Card>
        <EmptyState
          icon={<ClipboardList />}
          title="No orders yet"
          description="Orders you place will show here with their delivery status."
        />
      </Card>
    </>
  );
}
