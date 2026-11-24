import {appConfig, PERMISSIONS} from '@grov/models';

import {ComingSoon} from '../../components/coming-soon';
import type {AdminRouteHandle} from '../../lib/route-access';
import type {Route} from './+types/base';

export const handle = {
  requires: {allOf: [PERMISSIONS.PRICING.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Base prices · ${appConfig.brandName} admin`},
];

export default function BasePrices() {
  return (
    <ComingSoon
      title="Base prices"
      description="Prices that apply at every store, with stale items and changes."
    />
  );
}
