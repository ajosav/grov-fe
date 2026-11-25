import {useSearchParams} from 'react-router';

import {
  periodParams,
  type PeriodValue,
  readPeriod,
  writePeriod,
} from '../../lib/catalogue/insight-format';

export interface DashboardScope {
  period: PeriodValue;
  /** One store, or every store the admin can see (`undefined`). */
  storeId: string | undefined;
  /** The `from`/`to` the API needs. */
  range: {from?: string; to?: string};
  setPeriod: (value: PeriodValue) => void;
  setStoreId: (storeId: string | undefined) => void;
}

/**
 * The store and period every figure on the dashboard follows. Kept in the URL (same keys as
 * product analytics) so a reload or a shared link shows the same view.
 */
export function useDashboardScope(): DashboardScope {
  const [params, setParams] = useSearchParams();
  const period = readPeriod(params);
  const storeId = params.get('storeId') ?? undefined;
  const update = (patch: (next: URLSearchParams) => void) =>
    setParams(
      previous => {
        const next = new URLSearchParams(previous);
        patch(next);
        return next;
      },
      {replace: true, preventScrollReset: true}
    );
  return {
    period,
    storeId,
    range: periodParams(period),
    setPeriod: value => update(next => writePeriod(next, value)),
    setStoreId: id => update(next => (id ? next.set('storeId', id) : next.delete('storeId'))),
  };
}
