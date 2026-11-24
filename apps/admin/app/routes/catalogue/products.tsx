import {useEffect, useState} from 'react';

import {Package, Plus, Search} from 'lucide-react';
import {Link, useNavigate, useSearchParams} from 'react-router';

import {useCategories, useDebounce, useFileUrls, useMyStores, useProducts} from '@grov/hooks';
import {appConfig, PERMISSIONS} from '@grov/models';
import {Can, errorMessage, PageHeader} from '@grov/shared';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Segmented,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@grov/ui';

import {ActiveBadge} from '../../components/catalogue/category-badges';
import {NewProductDialog} from '../../components/catalogue/new-product-dialog';
import {ProductThumb} from '../../components/catalogue/product-thumb';
import {categoryPath} from '../../lib/categories';
import {formatDay} from '../../lib/dates';
import type {AdminRouteHandle} from '../../lib/route-access';
import {productPath} from '../../paths';
import type {Route} from './+types/products';

export const handle = {
  requires: {allOf: [PERMISSIONS.PRODUCTS.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Products · ${appConfig.brandName} admin`}];

const ALL = 'all';
type StatusFilter = 'all' | 'active' | 'inactive' | 'draft';
const isStatus = (value: string | null): value is StatusFilter =>
  value === 'active' || value === 'inactive' || value === 'draft';

export default function Products() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryId = params.get('categoryId') ?? undefined;
  const storeId = params.get('storeId') ?? undefined;
  const statusParam = params.get('status');
  const status: StatusFilter = isStatus(statusParam) ? statusParam : ALL;
  const urlQuery = params.get('q') ?? '';

  // Typing updates the box at once and the URL (and so the request) after a pause.
  const [text, setText] = useState(urlQuery);
  const q = useDebounce(text.trim(), 300);
  useEffect(() => {
    if (q === urlQuery.trim()) return;
    setParams(
      previous => {
        const next = new URLSearchParams(previous);
        if (q) next.set('q', q);
        else next.delete('q');
        return next;
      },
      {replace: true}
    );
  }, [q, urlQuery, setParams]);

  const setFilter = (key: 'categoryId' | 'storeId' | 'status', value: string | undefined) =>
    setParams(
      previous => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      {replace: true}
    );

  const products = useProducts({
    categoryId,
    storeId,
    q: urlQuery.trim() || undefined,
    ...(status === 'active' ? {active: true} : {}),
    ...(status === 'inactive' ? {active: false, draft: false} : {}),
    ...(status === 'draft' ? {draft: true} : {}),
  });
  const categories = useCategories();
  const stores = useMyStores();
  const rows = products.data?.pages.flatMap(page => page.data) ?? [];
  const covers = useFileUrls(rows.flatMap(row => (row.imagePaths[0] ? [row.imagePaths[0]] : [])));
  const filtered = Boolean(categoryId || storeId || urlQuery.trim() || status !== ALL);

  return (
    <>
      <PageHeader
        title="Products"
        description="The global product master. Each product has a size ladder shoppers buy from; stores list the products they sell."
        actions={
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
            onChange={event => setText(event.target.value)}
          />
        </div>
        <Select
          value={categoryId ?? ALL}
          onValueChange={value => setFilter('categoryId', value === ALL ? undefined : value)}
        >
          <SelectTrigger aria-label="Category" className="h-10 w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {categories.data?.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {categoryPath(category.id, categories.data) ?? category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={storeId ?? ALL}
          onValueChange={value => setFilter('storeId', value === ALL ? undefined : value)}
        >
          <SelectTrigger aria-label="Store" className="h-10 w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All stores</SelectItem>
            {stores.data?.stores.map(store => (
              <SelectItem key={store.id} value={store.id}>
                {store.status === 'ACTIVE' ? store.name : `${store.name} (inactive)`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Segmented<StatusFilter>
          label="Status"
          value={status}
          onChange={value => setFilter('status', value === ALL ? undefined : value)}
          options={[
            {value: ALL, label: 'All'},
            {value: 'active', label: 'Active'},
            {value: 'inactive', label: 'Inactive'},
            {value: 'draft', label: 'Drafts'},
          ]}
          className="[&_button]:h-8"
        />
      </div>

      {products.isPending ? (
        <Skeleton className="h-64" />
      ) : products.isError ? (
        <Alert tone="danger" title="Couldn’t load products">
          {errorMessage(products.error)}
        </Alert>
      ) : rows.length === 0 ? (
        <Card>
          {filtered ? (
            <EmptyState
              icon={<Package />}
              title="No products match"
              description="Try another search, category, store or status."
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
        </Card>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Sold at</TableHead>
                <TableHead className="hidden lg:table-cell">Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(product => (
                <TableRow
                  key={product.id}
                  className="cursor-pointer"
                  onClick={event => {
                    // The name is the real link; the row is a bigger target for mouse users.
                    if ((event.target as HTMLElement).closest('a')) return;
                    void navigate(productPath(product.id));
                  }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ProductThumb
                        url={
                          product.imagePaths[0]
                            ? covers.data?.get(product.imagePaths[0])
                            : undefined
                        }
                        name={product.displayName}
                      />
                      <div className="min-w-0">
                        <Link
                          to={productPath(product.id)}
                          className="font-semibold text-ink underline-offset-4 hover:underline"
                        >
                          {product.displayName}
                        </Link>
                        <div className="truncate text-body-sm text-ink-muted">
                          {product.sku}
                          {product.brand ? ` · ${product.brand}` : ''}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-body-sm">
                    {categoryPath(product.categoryId, categories.data ?? []) ?? '—'}
                  </TableCell>
                  <TableCell>
                    <ActiveBadge active={product.active} draft={product.draft} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {product.availableAtAllStores ? (
                      <Badge tone="sky">All stores</Badge>
                    ) : (
                      <span className="text-body-sm text-ink-muted">Per store</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-body-sm tabular text-ink-muted lg:table-cell">
                    {formatDay(product.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {products.hasNextPage ? (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                loading={products.isFetchingNextPage}
                onClick={() => void products.fetchNextPage()}
              >
                Show more
              </Button>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
