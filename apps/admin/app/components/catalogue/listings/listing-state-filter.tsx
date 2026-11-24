import {Segmented} from '@grov/ui';

import type {ListingState} from '../../../lib/catalogue/listings';

export type StateFilter = 'all' | ListingState;

const FILTERS: readonly StateFilter[] = ['all', 'ACTIVE', 'PAUSED', 'DELISTED'];

export const isStateFilter = (value: string | null): value is StateFilter =>
  FILTERS.some(filter => filter === value);

interface ListingStateFilterProps {
  value: StateFilter;
  onChange: (value: StateFilter) => void;
}

/** The All / Selling / Paused / Delisted switch, kept in the URL by the page. */
export function ListingStateFilter({value, onChange}: ListingStateFilterProps) {
  return (
    <Segmented<StateFilter>
      label="Listing status"
      value={value}
      onChange={onChange}
      options={[
        {value: 'all', label: 'All'},
        {value: 'ACTIVE', label: 'Selling'},
        {value: 'PAUSED', label: 'Paused'},
        {value: 'DELISTED', label: 'Delisted'},
      ]}
      className="[&_button]:h-8"
    />
  );
}
