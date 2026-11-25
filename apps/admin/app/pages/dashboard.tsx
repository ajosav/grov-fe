import {useMe} from '@grov/hooks';
import {appConfig, PERMISSIONS} from '@grov/models';
import {usePermissions} from '@grov/shared';

import {BusinessAnalytics} from '../components/dashboard/business-analytics';
import {DashboardHero} from '../components/dashboard/dashboard-hero';
import {DashboardInsights} from '../components/dashboard/dashboard-insights';
import {OrdersOverview} from '../components/dashboard/orders-overview';
import {RevenueOverview} from '../components/dashboard/revenue-overview';
import {useDashboardScope} from '../components/dashboard/use-dashboard-scope';
import type {Route} from './+types/dashboard';

export const meta: Route.MetaFunction = () => [{title: `Dashboard · ${appConfig.brandName} admin`}];

/**
 * The landing page. First what the season means and what to stock (cards, each with a large "View
 * all"), then how the business is doing, then orders and revenue. Numbers come from what the
 * backend reports today; the assistant, AI explanations and market intelligence (doc 38) arrive
 * with `core/ai` and the data sources. The assistant lives in the shell's "Ask AI" panel.
 */
export default function Dashboard() {
  const {data: me} = useMe();
  const {can} = usePermissions();
  const scope = useDashboardScope();
  const canSeason = can(PERMISSIONS.FOODS.READ);
  const canCatalogue = can(PERMISSIONS.PRODUCTS.READ);
  const canOrders = can(PERMISSIONS.ORDERS.READ);
  const stores = me?.access.admin?.stores;
  const coverage =
    stores === undefined
      ? undefined
      : stores === 'ALL'
        ? 'All stores'
        : `${stores.length} ${stores.length === 1 ? 'store' : 'stores'}`;

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)] gap-10">
      {canSeason ? null : <DashboardHero firstName={me?.firstName} scope={coverage} />}
      <DashboardInsights scope={scope} firstName={me?.firstName} />
      {canCatalogue ? <BusinessAnalytics scope={scope} /> : null}
      {canOrders ? (
        <>
          <OrdersOverview scope={scope} />
          <RevenueOverview scope={scope} />
        </>
      ) : null}
    </div>
  );
}
