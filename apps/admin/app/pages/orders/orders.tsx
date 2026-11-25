import {appConfig, PERMISSIONS} from '@grov/models';

import {ComingSoon} from '../../components/common/coming-soon';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import type {Route} from './+types/orders';

export const handle = {
  requires: {allOf: [PERMISSIONS.ORDERS.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Orders · ${appConfig.brandName} admin`}];

export default function Orders() {
  return (
    <ComingSoon
      title="Orders"
      description="Orders placed at your stores, their drops, items and timeline."
      storeScoped
    />
  );
}
