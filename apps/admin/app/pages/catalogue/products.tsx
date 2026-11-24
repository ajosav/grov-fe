import {useEffect, useState} from 'react';

import {Package, Plus} from 'lucide-react';
import {useNavigate, useSearchParams} from 'react-router';

import {useCategories, useDebounce, useFileUrls, useMyStores, useProducts} from '@grov/hooks';
import {appConfig, PERMISSIONS} from '@grov/models';
import {Can, errorMessage, PageHeader} from '@grov/shared';
import {Alert, Button, Card, EmptyState, Skeleton} from '@grov/ui';

import {NewProductDialog} from '../../components/catalogue/new-product-dialog';
import {
  ALL,
  isStatusFilter,
  ProductsFilterBar,
  type StatusFilter,
} from '../../components/catalogue/products/products-filter-bar';
import {ProductsTable} from '../../components/catalogue/products/products-table';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import {productPath} from '../../paths';
import type {Route} from './+types/products';

export const handle = {
  requires: {allOf: [PERMISSIONS.PRODUCTS.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Products · ${appConfig.brandName} admin`}];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryId = params.get('categoryId') ?? undefined;
  const storeId = params.get('storeId') ?? undefined;
  const statusParam = params.get('status');
  const status: StatusFilter = isStatusFilter(statusParam) ? statusParam : ALL;
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
  const coverFor = (path: string | undefined) => (path ? covers.data?.get(path) : undefined);

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

      <ProductsFilterBar
        text={text}
        onTextChange={setText}
        categoryId={categoryId}
        storeId={storeId}
        status={status}
        categories={categories.data}
        stores={stores.data?.stores}
        onChange={setFilter}
      />

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
        <ProductsTable
          rows={rows}
          categories={categories.data ?? []}
          coverFor={coverFor}
          onOpen={productId => void navigate(productPath(productId))}
          hasNextPage={products.hasNextPage}
          isFetchingNextPage={products.isFetchingNextPage}
          onLoadMore={() => void products.fetchNextPage()}
        />
      )}
    </>
  );
}
