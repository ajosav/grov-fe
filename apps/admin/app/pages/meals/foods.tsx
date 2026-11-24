import {appConfig, PERMISSIONS} from '@grov/models';

import {ComingSoon} from '../../components/common/coming-soon';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import type {Route} from './+types/foods';

export const handle = {
  requires: {allOf: [PERMISSIONS.FOODS.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Foods · ${appConfig.brandName} admin`}];

export default function Foods() {
  return (
    <ComingSoon
      title="Foods"
      description="Foods, their local names, allergens, substitutes and planner availability."
    />
  );
}
