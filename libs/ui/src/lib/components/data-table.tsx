import {type ReactNode, useState} from 'react';

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {ArrowDown, ArrowUp, ArrowUpDown, Search} from 'lucide-react';

import {cn} from '../utils/cn';
import {EmptyState} from './empty-state';
import {Input} from './input';
import {Skeleton} from './skeleton';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from './table';

export type {ColumnDef, RowSelectionState, SortingState} from '@tanstack/react-table';

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  /** Stable row id (the record's id), needed for selection to survive refetches. */
  getRowId: (row: TData) => string;
  loading?: boolean;
  /** Sorting is server-side when `onSortingChange` is given; otherwise the visible page is sorted locally. */
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  onRowClick?: (row: TData) => void;
  /** Toolbar search (debounce it in the caller; the API filters). */
  search?: {value: string; onChange: (value: string) => void; placeholder?: string};
  /** Filters, bulk actions, export, placed beside the search. */
  toolbar?: ReactNode;
  empty?: ReactNode;
  /** Pagination / LoadMore under the table. */
  footer?: ReactNode;
  caption?: string;
  className?: string;
}

/**
 * Admin list tables: TanStack Table for column logic, our Table for looks.
 * Data, paging and filtering come from @grov/hooks; this only renders.
 */
export function DataTable<TData>({
  columns,
  data,
  getRowId,
  loading,
  sorting: sortingProp,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
  onRowClick,
  search,
  toolbar,
  empty,
  footer,
  caption,
  className,
}: DataTableProps<TData>) {
  const [localSorting, setLocalSorting] = useState<SortingState>([]);
  const manualSorting = Boolean(onSortingChange);
  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: {
      sorting: sortingProp ?? localSorting,
      ...(rowSelection ? {rowSelection} : {}),
    },
    onSortingChange: onSortingChange ?? setLocalSorting,
    onRowSelectionChange,
    enableRowSelection: Boolean(onRowSelectionChange),
    manualSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
  });

  const colCount = table.getVisibleLeafColumns().length;
  const rows = table.getRowModel().rows;

  return (
    <div className={cn('grid gap-3', className)}>
      {search || toolbar ? (
        <div className="flex flex-wrap items-center gap-2">
          {search ? (
            <div className="relative min-w-56 flex-1 sm:max-w-sm">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
              />
              <Input
                type="search"
                value={search.value}
                onChange={event => search.onChange(event.target.value)}
                placeholder={search.placeholder ?? 'Search'}
                aria-label={search.placeholder ?? 'Search'}
                className="h-10 pl-9"
              />
            </div>
          ) : null}
          {toolbar ? (
            <div className="ml-auto flex flex-wrap items-center gap-2">{toolbar}</div>
          ) : null}
        </div>
      ) : null}
      <Table aria-busy={loading || undefined}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <TableHeader>
          {table.getHeaderGroups().map(group => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map(header => {
                const sortable = header.column.getCanSort();
                const dir = header.column.getIsSorted();
                const label = header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext());
                return (
                  <TableHead
                    key={header.id}
                    aria-sort={
                      dir === 'asc'
                        ? 'ascending'
                        : dir === 'desc'
                          ? 'descending'
                          : sortable
                            ? 'none'
                            : undefined
                    }
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 uppercase hover:text-ink"
                      >
                        {label}
                        {dir === 'asc' ? (
                          <ArrowUp aria-hidden className="size-3.5" />
                        ) : dir === 'desc' ? (
                          <ArrowDown aria-hidden className="size-3.5" />
                        ) : (
                          <ArrowUpDown aria-hidden className="size-3.5 opacity-50" />
                        )}
                      </button>
                    ) : (
                      label
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading && rows.length === 0 ? (
            Array.from({length: 5}, (_, i) => (
              <TableRow key={`skeleton-${i}`}>
                {Array.from({length: colCount}, (__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full max-w-40" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={colCount}>
                {empty ?? <EmptyState title="Nothing here yet" />}
              </TableCell>
            </TableRow>
          ) : (
            rows.map(row => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? 'selected' : undefined}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={cn(
                  onRowClick && 'cursor-pointer',
                  'data-[state=selected]:bg-flame-tint'
                )}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {footer}
    </div>
  );
}
