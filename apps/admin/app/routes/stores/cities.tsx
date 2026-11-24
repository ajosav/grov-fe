import {appConfig, PERMISSIONS} from '@grov/models';

import {ComingSoon} from '../../components/coming-soon';
import type {AdminRouteHandle} from '../../lib/route-access';
import type {Route} from './+types/cities';

export const handle = {
  requires: {allOf: [PERMISSIONS.CITIES.MANAGE]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Cities · ${appConfig.brandName} admin`}];

export default function Cities() {
  return (
    <ComingSoon title="Cities" description="Cities and the delivery defaults their stores share." />
  );
}
