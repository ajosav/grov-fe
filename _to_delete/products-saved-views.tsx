import type {CatalogueView} from '@grov/api';

import type {CatalogueState} from '../../../lib/catalogue/catalogue-view';
import {PillTabs} from '../../common/pill-tabs';

export interface ProductsSavedViewsProps {
  view: CatalogueState['view'];
  onChange: (patch: Partial<CatalogueState>) => void;
}

type ViewKey = CatalogueView | 'all';

const VIEWS: {value: ViewKey; label: string; count: string}[] = [
  {value: 'all', label: 'All products', count: 'Newest edits first'},
  {value: 'best_performing', label: 'Best performing', count: 'Most units sold'},
  {value: 'high_revenue', label: 'High revenue', count: 'Most revenue'},
  {value: 'declining', label: 'Declining', count: 'Revenue down 20%+'},
  {value: 'low_conversion', label: 'Low conversion', count: 'Viewed, rarely bought'},
  {value: 'low_stock', label: 'Low stock', count: 'At or under threshold'},
  {value: 'out_of_stock', label: 'Out of stock', count: 'Nothing available'},
  {value: 'needs_ai_attention', label: 'Needs AI attention', count: 'Open recommendations'},
];

/** Saved views over the catalogue, one tap each. */
export function ProductsSavedViews({view, onChange}: ProductsSavedViewsProps) {
  return (
    <PillTabs<ViewKey>
      label="Saved views"
      className="mb-4"
      tabs={VIEWS}
      value={view ?? 'all'}
      onChange={value => onChange({view: value === 'all' ? undefined : value})}
    />
  );
}
