import {useSearchParams} from 'react-router';

import type {OrderItemType, OrderRevenueSource} from '@grov/models';

/** Meal plans are not an order type yet, so choosing it explains that instead of asking the server. */
export type OrderTypeFilter = OrderItemType | 'ALL' | 'MEAL_PLAN';
export type RevenueSourceFilter = OrderRevenueSource | 'ALL' | 'MEAL_PLAN';

const TYPES: readonly OrderTypeFilter[] = ['ALL', 'FOOD_PACKAGE', 'FOOD_PRODUCT', 'MEAL_PLAN'];
const SOURCES: readonly RevenueSourceFilter[] = ['ALL', 'SAVINGS', 'PURCHASE', 'MEAL_PLAN'];

export interface OrderFilters {
  type: OrderTypeFilter;
  source: RevenueSourceFilter;
  setType: (type: OrderTypeFilter) => void;
  setSource: (source: RevenueSourceFilter) => void;
}

/** The item type and payment filters of the orders and revenue sections, kept in the URL. */
export function useOrderFilters(): OrderFilters {
  const [params, setParams] = useSearchParams();
  const type = TYPES.find(value => value === params.get('orderType')) ?? 'ALL';
  const source = SOURCES.find(value => value === params.get('revenueSource')) ?? 'ALL';
  const write = (key: string, value: string) =>
    setParams(
      previous => {
        const next = new URLSearchParams(previous);
        if (value === 'ALL') next.delete(key);
        else next.set(key, value);
        return next;
      },
      {replace: true, preventScrollReset: true}
    );
  return {
    type,
    source,
    setType: value => write('orderType', value),
    setSource: value => write('revenueSource', value),
  };
}

/** What the server is asked for: only the real item types. "All" and "Meal plans" send nothing. */
export function itemTypeParam(type: OrderTypeFilter): OrderItemType | undefined {
  return type === 'FOOD_PACKAGE' || type === 'FOOD_PRODUCT' ? type : undefined;
}

/** What the server is asked for: only the real payment sources. */
export function sourceParam(source: RevenueSourceFilter): OrderRevenueSource | undefined {
  return source === 'SAVINGS' || source === 'PURCHASE' ? source : undefined;
}
