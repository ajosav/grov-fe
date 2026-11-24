import {appConfig, PERMISSIONS} from '@grov/models';

import {ComingSoon} from '../../components/coming-soon';
import type {AdminRouteHandle} from '../../lib/route-access';
import type {Route} from './+types/preview';

export const handle = {
  requires: {allOf: [PERMISSIONS.PLANNING.PREVIEW]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Plan preview · ${appConfig.brandName} admin`},
];

export default function PlanPreview() {
  return (
    <ComingSoon
      title="Plan preview"
      description="Run the planner for a made-up household. Nothing is saved."
    />
  );
}
