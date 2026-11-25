import {appConfig, PERMISSIONS} from '@grov/models';
import {PageHeader} from '@grov/shared';

import {ActivityFeed} from '../../components/catalogue/activity/activity-feed';
import {AiNotAvailableState} from '../../components/catalogue/ai/ai-not-available';
import {ProductsSectionNav} from '../../components/catalogue/products/products-section-nav';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import type {Route} from './+types/intelligence';

export const handle = {
  requires: {allOf: [PERMISSIONS.PRODUCTS.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [
  {title: `Intelligence centre · ${appConfig.brandName} admin`},
];

/** Catalogue-wide AI intelligence is not built yet (doc 38); the activity feed is real. */
export default function IntelligenceCentre() {
  return (
    <>
      <PageHeader
        title="Intelligence centre"
        description="AI analysis and recommendations across the catalogue."
      />
      <ProductsSectionNav />
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <AiNotAvailableState />
        <ActivityFeed className="xl:sticky xl:top-20" />
      </div>
    </>
  );
}
