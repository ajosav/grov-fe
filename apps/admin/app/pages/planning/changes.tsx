import {appConfig, PERMISSIONS} from '@grov/models';

import {ComingSoon} from '../../components/common/coming-soon';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import type {Route} from './+types/changes';

export const handle = {
  requires: {
    anyOf: [PERMISSIONS.PLANNING.GENERATION_REQUEST_CHANGE, PERMISSIONS.PLANNING.GENERATION_REVIEW],
  },
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Planner change requests · ${appConfig.brandName} admin`},
];

export default function PlannerChanges() {
  return (
    <ComingSoon
      title="Planner change requests"
      description="Requests to change how the planner chooses meals, and their review."
    />
  );
}
