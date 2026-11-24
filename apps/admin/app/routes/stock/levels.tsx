import {appConfig, PERMISSIONS} from '@grov/models';

import {ComingSoon} from '../../components/coming-soon';
import type {AdminRouteHandle} from '../../lib/route-access';
import type {Route} from './+types/levels';

export const handle = {
  requires: {allOf: [PERMISSIONS.STOCK.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Stock levels · ${appConfig.brandName} admin`},
];

export default function StockLevels() {
  return (
    <ComingSoon
      title="Stock levels"
      description="On hand, reserved and available for each product in this store."
      storeScoped
    />
  );
}
