import {appConfig, PERMISSIONS} from '@grov/models';

import {ComingSoon} from '../../components/coming-soon';
import type {AdminRouteHandle} from '../../lib/route-access';
import type {Route} from './+types/requests';

export const handle = {
  requires: {allOf: [PERMISSIONS.SHOP.REQUESTS_READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Shopper requests · ${appConfig.brandName} admin`},
];

export default function ShopperRequests() {
  return (
    <ComingSoon
      title="Shopper requests"
      description="What shoppers ask us to stock, and how often."
    />
  );
}
