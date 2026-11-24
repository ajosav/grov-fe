import {appConfig, PERMISSIONS} from '@grov/models';

import {ComingSoon} from '../../components/coming-soon';
import type {AdminRouteHandle} from '../../lib/route-access';
import type {Route} from './+types/extras';

export const handle = {
  requires: {allOf: [PERMISSIONS.PLANNING.EXTRAS_MANAGE]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Household extras · ${appConfig.brandName} admin`},
];

export default function HouseholdExtras() {
  return (
    <ComingSoon
      title="Household extras"
      description="The tea, sugar, milk, bread and snacks plans add in each city."
    />
  );
}
