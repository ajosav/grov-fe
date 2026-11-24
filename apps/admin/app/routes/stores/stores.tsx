import {appConfig, PERMISSIONS} from '@grov/models';

import {ComingSoon} from '../../components/coming-soon';
import type {AdminRouteHandle} from '../../lib/route-access';
import type {Route} from './+types/stores';

export const handle = {
  requires: {allOf: [PERMISSIONS.STORES.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Stores · ${appConfig.brandName} admin`}];

export default function Stores() {
  return (
    <ComingSoon
      title="Stores"
      description="Stores, their status, delivery zones and pin coverage."
    />
  );
}
