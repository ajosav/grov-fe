import {appConfig, PERMISSIONS} from '@grov/models';

import {ComingSoon} from '../../components/coming-soon';
import type {AdminRouteHandle} from '../../lib/route-access';
import type {Route} from './+types/products';

export const handle = {
  requires: {allOf: [PERMISSIONS.PRODUCTS.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Products · ${appConfig.brandName} admin`}];

export default function Products() {
  return (
    <ComingSoon
      title="Products"
      description="The global product master: names, units, sizes and images."
    />
  );
}
