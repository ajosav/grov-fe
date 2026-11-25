import {useMemo} from 'react';

import {useCatalogue} from '@grov/hooks';

import {stockCover} from '../../lib/dashboard/stock-timeline';
import type {DashboardScope} from './use-dashboard-scope';

/** Products by how soon their stock runs out, at the pace they sold over the period. */
export function useStockTimeline(scope: DashboardScope, enabled = true) {
  const catalogue = useCatalogue({
    ...scope.range,
    storeId: scope.storeId,
    sort: 'stock',
    dir: 'asc',
    pageSize: 50,
  });
  const data = catalogue.data;
  const covers = useMemo(() => (data ? stockCover(data.items, data.period.days) : []), [data]);
  return {
    covers,
    periodDays: data?.period.days,
    loading: enabled && catalogue.isPending,
    error: catalogue.error,
    refetch: catalogue.refetch,
  };
}
