import {appConfig, PERMISSIONS} from '@grov/models';

import {ComingSoon} from '../../components/common/coming-soon';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import type {Route} from './+types/library';

export const handle = {
  requires: {allOf: [PERMISSIONS.MEALS.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Meals · ${appConfig.brandName} admin`}];

export default function Meals() {
  return (
    <ComingSoon
      title="Meals"
      description="Meals and their ingredient lines. Publish and retire them here."
    />
  );
}
