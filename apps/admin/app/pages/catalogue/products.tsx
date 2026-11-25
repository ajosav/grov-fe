import {useCallback, useEffect, useMemo, useState} from 'react';

import {Download, Package, Plus, Upload} from 'lucide-react';
import {useSearchParams} from 'react-router';

import {
  useCatalogue,
  useCategories,
  useDebounce,
  useExportCatalogue,
  useFileUrls,
  useMe,
  useMyStores,
  useUpdateProduct,
} from '@grov/hooks';
import {appConfig, type CatalogueRow, PERMISSIONS} from '@grov/models';
import {Can, errorMessage, PageHeader, usePermissions} from '@grov/shared';
import {
  Alert,
  Badge,
  Button,
  cn,
  EmptyState,
  Pagination,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  toast,
} from '@grov/ui';

import {NewProductDialog} from '../../components/catalogue/new-product-dialog';
import {ImportPricesDialog} from '../../components/catalogue/products/import-prices-dialog';
import {ProductsDetailedList} from '../../components/catalogue/products/products-detailed-list';
import {ProductsFilterBar} from '../../components/catalogue/products/products-filter-bar';
import {ProductsLensGrid} from '../../components/catalogue/products/products-lens-grid';
import {ProductsSectionNav} from '../../components/catalogue/products/products-section-nav';
import {ProductsSelectionBar} from '../../components/catalogue/products/products-selection-bar';
import {ProductsTable} from '../../components/catalogue/products/products-table';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import {
  catalogueParams,
  type CatalogueState,
  type ColumnKey,
  DEFAULT_HIDDEN,
  PAGE_SIZES,
  readCatalogue,
  writeCatalogue,
} from '../../lib/catalogue/catalogue-view';
import {downloadText, toCsv} from '../../lib/catalogue/csv';
import {formatCount} from '../../lib/catalogue/insight-format';
import type {Route} from './+types/products';

export const handle = {
  requires: {allOf: [PERMISSIONS.PRODUCTS.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Products · ${appConfig.brandName} admin`}];

function exportRows(rows: CatalogueRow[]) {
  const csv = toCsv([
    [
      'SKU',
      'Product',
      'Category',
      'Status',
      'Default size',
      'Price from (NGN)',
      'Price to (NGN)',
      'Margin %',
      'Available',
      'Unit',
      'Stock',
      'Sold',
      'Orders',
      'Viewers',
      'Conversion %',
      'Revenue (NGN)',
      'Revenue change %',
      'Updated',
    ],
    ...rows.map(row => [
      row.sku,
      row.displayName,
      row.categoryName,
      row.draft ? 'Draft' : row.active ? 'Published' : 'Unpublished',
      row.defaultSizeLabel,
      row.priceMin ? row.priceMin.kobo / 100 : null,
      row.priceMax ? row.priceMax.kobo / 100 : null,
      row.marginBps === null ? null : row.marginBps / 100,
      row.availableQty,
      row.baseUnit,
      row.stockState,
      row.qtySold,
      row.orders,
      row.viewers,
      row.conversionBps === null ? null : row.conversionBps / 100,
      row.revenue.kobo / 100,
      row.revenueChangeBps === null ? null : row.revenueChangeBps / 100,
      row.updatedAt.slice(0, 10),
    ]),
  ]);
  downloadText(csv, `products-${new Date().toISOString().slice(0, 10)}.csv`);
}

export default function Products() {
  const [params, setParams] = useSearchParams();
  const state = useMemo(() => readCatalogue(params), [params]);
  const {can} = usePermissions();
  const canManage = can(PERMISSIONS.PRODUCTS.MANAGE);

  const update = useCallback(
    (patch: Partial<CatalogueState>) =>
      setParams(previous => writeCatalogue(previous, patch), {replace: true}),
    [setParams]
  );

  // Typing updates the box at once and the URL (and so the request) after a pause.
  const [text, setText] = useState(state.q);
  const q = useDebounce(text.trim(), 300);
  useEffect(() => {
    if (q !== state.q.trim()) update({q});
  }, [q, state.q, update]);

  const query = catalogueParams(state);
  const catalogue = useCatalogue(query);
  const categories = useCategories();
  const stores = useMyStores();
  const me = useMe();
  const rows = useMemo(() => catalogue.data?.items ?? [], [catalogue.data]);
  const covers = useFileUrls(rows.flatMap(row => (row.coverImagePath ? [row.coverImagePath] : [])));
  const coverFor = (path: string | null) => (path ? covers.data?.get(path) : undefined);

  const [hidden, setHidden] = useState<ColumnKey[]>(DEFAULT_HIDDEN);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  // A new filter or page shows other products: start the selection again.
  const listKey = JSON.stringify(query);
  useEffect(() => setSelected(new Set()), [listKey]);

  const updateProduct = useUpdateProduct();
  const exporter = useExportCatalogue();

  const setPublished = async (targets: CatalogueRow[], publish: boolean) => {
    const changing = targets.filter(row => (publish ? !row.active : row.active));
    if (changing.length === 0) {
      toast.info(publish ? 'Already published' : 'Already unpublished');
      return;
    }
    setBusy(true);
    const results = await Promise.allSettled(
      changing.map(row =>
        updateProduct.mutateAsync({
          id: row.id,
          body: publish ? (row.draft ? {draft: false} : {active: true}) : {active: false},
        })
      )
    );
    setBusy(false);
    const failed = results.filter(r => r.status === 'rejected');
    const done = results.length - failed.length;
    if (done)
      toast.success(
        `${done} product${done === 1 ? '' : 's'} ${publish ? 'published' : 'unpublished'}`
      );
    const first = failed[0];
    if (first && first.status === 'rejected') {
      toast.error(`${failed.length} couldn’t be changed: ${errorMessage(first.reason)}`);
    }
  };

  const selectedRows = rows.filter(row => selected.has(row.id));
  const toggle = (id: string) =>
    setSelected(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = (checked: boolean) =>
    setSelected(checked ? new Set(rows.map(row => row.id)) : new Set());

  const filtered = Boolean(
    state.q ||
    state.view ||
    state.categoryId ||
    state.status ||
    state.availability ||
    state.performance ||
    state.profitability ||
    state.storeId
  );
  const layoutProps = {
    rows,
    coverFor,
    selected,
    onToggle: toggle,
    onToggleAll: toggleAll,
    canManage,
    onPublish: (row: CatalogueRow, publish: boolean) => void setPublished([row], publish),
  };
  const total = catalogue.data?.total ?? 0;

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage, monitor and optimise your product catalogue."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              loading={exporter.isPending}
              onClick={() =>
                exporter.mutate(query, {
                  onSuccess: all => {
                    exportRows(all);
                    toast.success(`Exported ${all.length} products`);
                  },
                  onError: error => toast.error(errorMessage(error)),
                })
              }
            >
              <Download aria-hidden /> Export
            </Button>
            <Can permission={PERMISSIONS.PRODUCTS.MANAGE}>
              {me.data ? (
                <ImportPricesDialog
                  userId={me.data.id}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Upload aria-hidden /> Import prices
                    </Button>
                  }
                />
              ) : null}
              <NewProductDialog
                trigger={
                  <Button size="sm">
                    <Plus aria-hidden /> Add product
                  </Button>
                }
              />
            </Can>
          </>
        }
      />
      <ProductsSectionNav />

      <section
        aria-labelledby="products-list"
        className="@container min-w-0 overflow-clip rounded-lg border border-line bg-surface"
      >
        <header className="flex items-center gap-2 px-4 pt-4">
          <h2 id="products-list" className="text-body font-semibold">
            Products
          </h2>
          <Badge>{catalogue.data ? formatCount(total) : '…'}</Badge>
        </header>
        <ProductsFilterBar
          text={text}
          onTextChange={setText}
          state={state}
          onChange={update}
          categories={categories.data}
          stores={stores.data?.stores}
          hidden={hidden}
          onHidden={setHidden}
        />
        {catalogue.isPending ? (
          <div className="grid gap-2 p-4">
            {Array.from({length: 6}, (_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : catalogue.isError ? (
          <Alert tone="danger" title="Couldn’t load products" className="m-4">
            <div className="flex flex-wrap items-center gap-3">
              {errorMessage(catalogue.error)}
              <Button variant="outline" size="sm" onClick={() => void catalogue.refetch()}>
                Try again
              </Button>
            </div>
          </Alert>
        ) : rows.length === 0 ? (
          <div className="p-4">
            {filtered ? (
              <EmptyState
                icon={<Package />}
                title="No products match"
                description="Try another view, search, filter or location."
                action={
                  <Button
                    variant="outline"
                    onClick={() => {
                      setText('');
                      setParams({}, {replace: true});
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={<Package />}
                title="No products yet"
                description="Add the first product: its name, category and the sizes shoppers can buy."
                action={
                  <Can permission={PERMISSIONS.PRODUCTS.MANAGE}>
                    <NewProductDialog
                      trigger={
                        <Button>
                          <Plus aria-hidden /> Add product
                        </Button>
                      }
                    />
                  </Can>
                }
              />
            )}
          </div>
        ) : (
          <>
            <ProductsSelectionBar
              count={selectedRows.length}
              pageCount={rows.length}
              showSelectAll={state.layout !== 'list'}
              canManage={canManage}
              busy={busy}
              onToggleAll={toggleAll}
              onPublish={() => void setPublished(selectedRows, true)}
              onUnpublish={() => void setPublished(selectedRows, false)}
              onExport={() => exportRows(selectedRows)}
              onClear={() => setSelected(new Set())}
            />
            <div
              className={cn(
                state.layout !== 'list' && 'p-4',
                catalogue.isPlaceholderData && 'opacity-60 transition-opacity'
              )}
            >
              {state.layout === 'detailed' ? (
                <ProductsDetailedList {...layoutProps} />
              ) : state.layout === 'lens' ? (
                <ProductsLensGrid {...layoutProps} />
              ) : (
                <ProductsTable
                  {...layoutProps}
                  hidden={hidden}
                  state={state}
                  onSort={sort =>
                    update({
                      sort,
                      dir: state.sort === sort && state.dir === 'desc' ? 'asc' : 'desc',
                    })
                  }
                />
              )}
            </div>
          </>
        )}

        {total > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-line px-4 py-3">
            <Pagination
              page={state.page}
              pageCount={Math.ceil(total / state.pageSize)}
              total={total}
              pageSize={state.pageSize}
              onPageChange={page => update({page})}
              className="min-w-0 flex-1 basis-80"
            />
            <Select
              value={String(state.pageSize)}
              onValueChange={v => update({pageSize: Number(v)})}
            >
              <SelectTrigger
                aria-label="Products per page"
                className="h-9 w-40 shrink-0 whitespace-nowrap"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map(size => (
                  <SelectItem key={size} value={String(size)}>
                    {size} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </section>
      {catalogue.data ? (
        <p className="mt-3 text-body-sm text-ink-muted">
          Metrics cover {catalogue.data.period.days} days by order date. Viewers are signed-in
          shoppers whose latest view fell in the period.
        </p>
      ) : null}
    </>
  );
}
