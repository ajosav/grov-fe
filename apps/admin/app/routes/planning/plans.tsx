import {appConfig, PERMISSIONS} from '@grov/models';

import {ComingSoon} from '../../components/coming-soon';
import type {AdminRouteHandle} from '../../lib/route-access';
import type {Route} from './+types/plans';

export const handle = {
  requires: {allOf: [PERMISSIONS.PLANNING.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Household plans · ${appConfig.brandName} admin`},
];

export default function HouseholdPlans() {
  return (
    <ComingSoon
      title="Household plans"
      description="Look up a household’s plan, its cycles and extras."
    />
  );
}
