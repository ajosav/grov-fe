import {appConfig, PERMISSIONS} from '@grov/models';

import {ComingSoon} from '../../components/coming-soon';
import type {AdminRouteHandle} from '../../lib/route-access';
import type {Route} from './+types/publish';

export const handle = {
  requires: {allOf: [PERMISSIONS.PRICING.PUBLISH]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Review and publish · ${appConfig.brandName} admin`},
];

export default function PublishPrices() {
  return (
    <ComingSoon
      title="Review and publish"
      description="Review draft base prices and markups, then make them live for shoppers."
    />
  );
}
