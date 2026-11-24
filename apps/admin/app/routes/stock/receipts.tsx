import {appConfig, PERMISSIONS} from '@grov/models';

import {ComingSoon} from '../../components/coming-soon';
import type {AdminRouteHandle} from '../../lib/route-access';
import type {Route} from './+types/receipts';

export const handle = {
  requires: {allOf: [PERMISSIONS.STOCK.WRITE]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Receive stock · ${appConfig.brandName} admin`},
];

export default function StockReceipts() {
  return (
    <ComingSoon
      title="Receive stock"
      description="Record deliveries, counts and write-offs in this store."
      storeScoped
    />
  );
}
