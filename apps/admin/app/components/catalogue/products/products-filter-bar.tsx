import {Search} from 'lucide-react';

import type {AdminStoreOption, Category} from '@grov/models';
import {
  Input,
  Segmented,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@grov/ui';

import {categoryPath} from '../../../lib/catalogue/categories';

export const ALL = 'all';

export type StatusFilter = 'all' | 'active' | 'inactive' | 'draft';

export const isStatusFilter = (value: string | null): value is StatusFilter =>
  value === 'active' || value === 'inactive' || value === 'draft';

interface ProductsFilterBarProps {
  text: string;
  onTextChange: (text: string) => void;
  categoryId: string | undefined;
  storeId: string | undefined;
  status: StatusFilter;
  categories: Category[] | undefined;
  stores: AdminStoreOption[] | undefined;
  onChange: (key: 'categoryId' | 'storeId' | 'status', value: string | undefined) => void;
}

/** Search, category, store and status, all kept in the URL by the page. */
export function ProductsFilterBar({
  text,
  onTextChange,
  categoryId,
  storeId,
  status,
  categories,
  stores,
  onChange,
}: ProductsFilterBarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative w-full sm:w-72">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
        />
        <Input
          type="search"
          aria-label="Search products"
          placeholder="Search name, SKU or brand"
          autoComplete="off"
          className="h-10 pl-9"
          value={text}
          onChange={event => onTextChange(event.target.value)}
        />
      </div>
      <Select
        value={categoryId ?? ALL}
        onValueChange={value => onChange('categoryId', value === ALL ? undefined : value)}
      >
        <SelectTrigger aria-label="Category" className="h-10 w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All categories</SelectItem>
          {categories?.map(category => (
            <SelectItem key={category.id} value={category.id}>
              {categoryPath(category.id, categories) ?? category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={storeId ?? ALL}
        onValueChange={value => onChange('storeId', value === ALL ? undefined : value)}
      >
        <SelectTrigger aria-label="Store" className="h-10 w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All stores</SelectItem>
          {stores?.map(store => (
            <SelectItem key={store.id} value={store.id}>
              {store.status === 'ACTIVE' ? store.name : `${store.name} (inactive)`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Segmented<StatusFilter>
        label="Status"
        value={status}
        onChange={value => onChange('status', value === ALL ? undefined : value)}
        options={[
          {value: ALL, label: 'All'},
          {value: 'active', label: 'Active'},
          {value: 'inactive', label: 'Inactive'},
          {value: 'draft', label: 'Drafts'},
        ]}
        className="[&_button]:h-8"
      />
    </div>
  );
}
