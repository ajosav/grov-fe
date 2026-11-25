import {appConfig, PERMISSIONS} from '@grov/models';

import {ComingSoon} from '../../components/common/coming-soon';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import type {Route} from './+types/generation';

export const handle = {
  requires: {allOf: [PERMISSIONS.PLANNING.GENERATION_READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `How plans were chosen · ${appConfig.brandName} admin`},
];

export default function GenerationLog() {
  return (
    <ComingSoon
      title="How plans were chosen"
      description="The decisions, scores and rules behind a generated timetable, with replay."
    />
  );
}
