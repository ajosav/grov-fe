import {appConfig, PERMISSIONS} from '@grov/models';

import {ComingSoon} from '../../components/coming-soon';
import type {AdminRouteHandle} from '../../lib/route-access';
import type {Route} from './+types/listings';

export const handle = {
  requires: {allOf: [PERMISSIONS.PRODUCTS.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Store listings · ${appConfig.brandName} admin`},
];

export default function Listings() {
  return (
    <ComingSoon
      title="Store listings"
      description="Which products this store sells. List, delist or pause them."
      storeScoped
    />
  );
}
