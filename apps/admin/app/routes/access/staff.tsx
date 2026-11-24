import {appConfig, PERMISSIONS} from '@grov/models';

import {ComingSoon} from '../../components/coming-soon';
import type {AdminRouteHandle} from '../../lib/route-access';
import type {Route} from './+types/staff';

export const handle = {
  requires: {allOf: [PERMISSIONS.ACCESS.ROLES_MANAGE]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Staff · ${appConfig.brandName} admin`}];

export default function Staff() {
  return (
    <ComingSoon title="Staff" description="Admins, their roles and the stores they work in." />
  );
}
