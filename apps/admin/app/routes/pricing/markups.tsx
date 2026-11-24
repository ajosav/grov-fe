import {appConfig, PERMISSIONS} from '@grov/models';

import {ComingSoon} from '../../components/coming-soon';
import type {AdminRouteHandle} from '../../lib/route-access';
import type {Route} from './+types/markups';

export const handle = {
  requires: {allOf: [PERMISSIONS.PRICING.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Store markups · ${appConfig.brandName} admin`},
];

export default function Markups() {
  return (
    <ComingSoon
      title="Store markups"
      description="Markups on the base price for this store: whole store, a category or one size."
      storeScoped
    />
  );
}
