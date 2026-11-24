import {appConfig, PERMISSIONS} from '@grov/models';

import {ComingSoon} from '../../components/coming-soon';
import type {AdminRouteHandle} from '../../lib/route-access';
import type {Route} from './+types/movements';

export const handle = {
  requires: {allOf: [PERMISSIONS.STOCK.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Movements · ${appConfig.brandName} admin`}];

export default function StockMovements() {
  return (
    <ComingSoon
      title="Movements"
      description="Every receipt, adjustment, reservation, transfer and write-off in this store."
      storeScoped
    />
  );
}
