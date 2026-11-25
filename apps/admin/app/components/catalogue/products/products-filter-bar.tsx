import {Columns3, Search, SlidersHorizontal, X} from 'lucide-react';

import type {AdminStoreOption, Category} from '@grov/models';
import {
  Badge,
  Button,
  Checkbox,
  Field,
  Input,
  Label,
  PeriodPicker,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Segmented,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@grov/ui';

import {
  type CatalogueLayout,
  type CatalogueState,
  type ColumnKey,
  COLUMNS,
  SAVED_VIEWS,
} from '../../../lib/catalogue/catalogue-view';
import {categoryPath} from '../../../lib/catalogue/categories';
import {StoreFilter} from '../../common/store-filter';

const ANY = 'any';

export interface ProductsFilterBarProps {
  /** The search box text; the page debounces it into the URL. */
  text: string;
  onTextChange: (text: string) => void;
  state: CatalogueState;
  onChange: (patch: Partial<CatalogueState>) => void;
  categories: Category[] | undefined;
  stores: readonly AdminStoreOption[] | undefined;
  hidden: ColumnKey[];
  onHidden: (hidden: ColumnKey[]) => void;
}

interface FilterSelectProps<T extends string> {
  label: string;
  value: T | undefined;
  options: {value: T; label: string}[];
  onChange: (value: T | undefined) => void;
}

function FilterSelect<T extends string>({label, value, options, onChange}: FilterSelectProps<T>) {
  return (
    <Field label={label}>
      <Select value={value ?? ANY} onValueChange={v => onChange(v === ANY ? undefined : (v as T))}>
        <SelectTrigger className="h-10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Any</SelectItem>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

/** Search, filters, location, period, columns and layout: everything is kept in the URL by the page. */
export function ProductsFilterBar({
  text,
  onTextChange,
  state,
  onChange,
  categories,
  stores,
  hidden,
  onHidden,
}: ProductsFilterBarProps) {
  const active = [
    state.view,
    state.categoryId,
    state.status,
    state.availability,
    state.performance,
    state.profitability,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
      <div className="relative w-full sm:w-60">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
        />
        <Input
          type="search"
          aria-label="Search products"
          placeholder="Search name, SKU or brand"
          autoComplete="off"
          className="h-9 pl-9"
          value={text}
          onChange={event => onTextChange(event.target.value)}
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <SlidersHorizontal aria-hidden /> Filters
            {active ? <Badge tone="flame">{active}</Badge> : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="grid w-80 gap-3 p-4">
          <FilterSelect
            label="View"
            value={state.view}
            onChange={view => onChange({view})}
            options={SAVED_VIEWS.flatMap(view =>
              view.value ? [{value: view.value, label: view.label}] : []
            )}
          />
          <Field label="Category">
            <Select
              value={state.categoryId ?? ANY}
              onValueChange={v => onChange({categoryId: v === ANY ? undefined : v})}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Any category</SelectItem>
                {categories?.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {categoryPath(category.id, categories) ?? category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <FilterSelect
            label="Publication"
            value={state.status}
            onChange={status => onChange({status})}
            options={[
              {value: 'published', label: 'Published'},
              {value: 'draft', label: 'Draft'},
              {value: 'inactive', label: 'Unpublished'},
            ]}
          />
          <FilterSelect
            label="Availability"
            value={state.availability}
            onChange={availability => onChange({availability})}
            options={[
              {value: 'IN_STOCK', label: 'In stock'},
              {value: 'LOW', label: 'Low somewhere'},
              {value: 'OUT', label: 'Out everywhere'},
              {value: 'UNTRACKED', label: 'Not counted'},
            ]}
          />
          <FilterSelect
            label="Performance (vs previous period)"
            value={state.performance}
            onChange={performance => onChange({performance})}
            options={[
              {value: 'rising', label: 'Sales rising'},
              {value: 'declining', label: 'Revenue declining'},
              {value: 'no_sales', label: 'No sales'},
            ]}
          />
          <FilterSelect
            label="Profitability"
            value={state.profitability}
            onChange={profitability => onChange({profitability})}
            options={[
              {value: 'thin', label: 'Thin margin (under 8%)'},
              {value: 'healthy', label: 'Healthy margin'},
              {value: 'unknown', label: 'No price yet'},
            ]}
          />
          {active ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onChange({
                  view: undefined,
                  categoryId: undefined,
                  status: undefined,
                  availability: undefined,
                  performance: undefined,
                  profitability: undefined,
                })
              }
            >
              <X aria-hidden /> Clear filters
            </Button>
          ) : null}
        </PopoverContent>
      </Popover>

      <StoreFilter
        value={state.storeId}
        stores={stores}
        onChange={storeId => onChange({storeId})}
      />
      <PeriodPicker value={state.period} onChange={period => onChange({period})} />

      <div className="ml-auto flex items-center gap-2">
        {state.layout === 'list' ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3 aria-hidden /> Columns
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="grid w-56 gap-2 p-3">
              {COLUMNS.map(column => {
                const id = `col-${column.key}`;
                const shown = !hidden.includes(column.key);
                return (
                  <div key={column.key} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={shown}
                      onCheckedChange={checked =>
                        onHidden(
                          checked ? hidden.filter(k => k !== column.key) : [...hidden, column.key]
                        )
                      }
                    />
                    <Label htmlFor={id} className="text-body-sm">
                      {column.label}
                    </Label>
                  </div>
                );
              })}
            </PopoverContent>
          </Popover>
        ) : null}
        <Segmented<CatalogueLayout>
          label="Layout"
          value={state.layout}
          onChange={layout => onChange({layout})}
          options={[
            {value: 'detailed', label: 'Detailed'},
            {value: 'list', label: 'List'},
            {value: 'lens', label: 'Lens'},
          ]}
          size="sm"
        />
      </div>
    </div>
  );
}
