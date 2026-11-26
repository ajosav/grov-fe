import {Search} from 'lucide-react';

import {Input, Segmented} from '@grov/ui';

import {STOCK_VIEW_TABS, type StockViewState} from '../../lib/stock/stock-view';

export interface StockFilterBarProps {
  /** The search box text; the page debounces it into the URL. */
  text: string;
  onTextChange: (text: string) => void;
  state: StockViewState;
  onChange: (patch: Partial<StockViewState>) => void;
}

/** Search and the views of the stock list; both live in the URL. */
export function StockFilterBar({text, onTextChange, state, onChange}: StockFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-line p-3">
      <div className="relative w-full sm:w-64">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
        />
        <Input
          type="search"
          aria-label="Search stock"
          placeholder="Search name or SKU"
          autoComplete="off"
          className="h-9 pl-9"
          value={text}
          onChange={event => onTextChange(event.target.value)}
        />
      </div>
      <Segmented
        size="sm"
        label="Stock view"
        value={state.view}
        onChange={view => onChange({view})}
        options={STOCK_VIEW_TABS}
      />
    </div>
  );
}
