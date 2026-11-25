import type {ReactNode} from 'react';

import type {AdminStoreOption, Product} from '@grov/models';
import {PeriodPicker} from '@grov/ui';

import type {PeriodValue} from '../../../lib/catalogue/insight-format';
import {StoreFilter} from '../../common/store-filter';

/** What the page hands every reporting tab: the product, and the period and location in the URL. */
export interface ProductReportProps {
  product: Product;
  period: PeriodValue;
  onPeriod: (period: PeriodValue) => void;
  storeId: string | undefined;
  onStore: (storeId: string | undefined) => void;
  stores: readonly AdminStoreOption[] | undefined;
  canManage: boolean;
}

export interface ProductReportToolbarProps {
  title: string;
  description?: ReactNode;
  period?: PeriodValue;
  onPeriod?: (period: PeriodValue) => void;
  storeId: string | undefined;
  onStore: (storeId: string | undefined) => void;
  stores: readonly AdminStoreOption[] | undefined;
  children?: ReactNode;
}

/** Tab title on the left, location and period on the right, in one row (filters above the charts). */
export function ProductReportToolbar({
  title,
  description,
  period,
  onPeriod,
  storeId,
  onStore,
  stores,
  children,
}: ProductReportToolbarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="grid gap-0.5">
        <h2 className="text-body font-semibold">{title}</h2>
        {description ? <p className="text-body-sm text-ink-muted">{description}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        <StoreFilter value={storeId} onChange={onStore} stores={stores} />
        {period && onPeriod ? <PeriodPicker value={period} onChange={onPeriod} /> : null}
      </div>
    </div>
  );
}
