import {type ReactNode, useCallback} from 'react';

import {ArrowLeft, Package} from 'lucide-react';
import {Link, useParams, useSearchParams} from 'react-router';

import {isApiError} from '@grov/api';
import {
  useCategories,
  useFileUrls,
  useMyStores,
  useProduct,
  useProductPricing,
  useProductStock,
} from '@grov/hooks';
import {appConfig, ErrorCode, PERMISSIONS, type Product} from '@grov/models';
import {errorMessage, usePermissions} from '@grov/shared';
import {Alert, Button, Card, EmptyState, Skeleton, Tabs, TabsContent} from '@grov/ui';

import {useDetailsEditor, useSizesPrepEditor} from '../../components/catalogue/product-tabs';
import {ProductAnalyticsTab} from '../../components/catalogue/product/product-analytics-tab';
import {
  type InformationSection,
  ProductInformationTab,
} from '../../components/catalogue/product/product-information-tab';
import {ProductInventoryTab} from '../../components/catalogue/product/product-inventory-tab';
import {ProductOverviewTab} from '../../components/catalogue/product/product-overview-tab';
import {ProductPricingTab} from '../../components/catalogue/product/product-pricing-tab';
import {ProductTabNav} from '../../components/catalogue/product/product-tab-nav';
import {ProductWorkspaceHeader} from '../../components/catalogue/product/product-workspace-header';
import {useUnsavedGuard} from '../../components/common/unsaved-guard';
import type {AdminRouteHandle} from '../../lib/access/route-access';
import {categoryPath} from '../../lib/catalogue/categories';
import {type PeriodValue, readPeriod, writePeriod} from '../../lib/catalogue/insight-format';
import {paths} from '../../paths';
import type {Route} from './+types/product';

export const handle = {
  requires: {allOf: [PERMISSIONS.PRODUCTS.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Product · ${appConfig.brandName} admin`}];

const TABS = ['overview', 'analytics', 'inventory', 'pricing', 'information'] as const;
type Tab = (typeof TABS)[number];
const TAB_LABEL: Record<Tab, string> = {
  overview: 'Overview',
  analytics: 'Performance',
  inventory: 'Stock',
  pricing: 'Pricing',
  information: 'Details',
};
const SECTIONS = ['details', 'sizes', 'more'] as const;

/** Old links (?tab=details|sizes|prep|more) land in Product information. */
function readTab(params: URLSearchParams): {tab: Tab; section: InformationSection} {
  const tab = params.get('tab');
  const legacy = tab === 'prep' ? 'sizes' : tab;
  if (SECTIONS.includes(legacy as InformationSection))
    return {tab: 'information', section: legacy as InformationSection};
  const section = params.get('section');
  return {
    tab: TABS.includes(tab as Tab) ? (tab as Tab) : 'overview',
    section: SECTIONS.includes(section as InformationSection)
      ? (section as InformationSection)
      : 'details',
  };
}

export default function ProductPage() {
  const {productId} = useParams();
  const product = useProduct(productId);

  const back = (
    <Link
      to={paths.products}
      className="mb-3 inline-flex items-center gap-1 text-body-sm text-ink-muted hover:text-ink"
    >
      <ArrowLeft aria-hidden className="size-4" /> Products
    </Link>
  );

  if (product.isPending) {
    return (
      <>
        {back}
        <Skeleton className="mb-5 h-40" />
        <Skeleton className="h-96" />
      </>
    );
  }

  if (product.isError) {
    const code = isApiError(product.error) ? product.error.code : undefined;
    if (code === ErrorCode.PRODUCT_NOT_FOUND || code === ErrorCode.NOT_FOUND) {
      return (
        <>
          {back}
          <Card>
            <EmptyState
              icon={<Package />}
              title="Product not found"
              description="It may have been removed, or the link is wrong."
              action={
                <Button asChild variant="outline">
                  <Link to={paths.products}>All products</Link>
                </Button>
              }
            />
          </Card>
        </>
      );
    }
    return (
      <>
        {back}
        <Alert tone="danger" title="Couldn’t load this product">
          {errorMessage(product.error)}
        </Alert>
      </>
    );
  }

  return <ProductWorkspace data={product.data} back={back} />;
}

interface ProductWorkspaceProps {
  data: Product;
  back: ReactNode;
}

/**
 * The product workspace: one identity banner over every tab.
 * The edit forms live here, not in the Product information tab, so unsaved edits survive
 * moving between tabs.
 */
function ProductWorkspace({data, back}: ProductWorkspaceProps) {
  const [params, setParams] = useSearchParams();
  const {tab, section} = readTab(params);
  const period = readPeriod(params);
  const storeId = params.get('storeId') ?? undefined;
  const {can} = usePermissions();
  const canManage = can(PERMISSIONS.PRODUCTS.MANAGE);

  const setParam = useCallback(
    (patch: (next: URLSearchParams) => void) =>
      setParams(
        previous => {
          const next = new URLSearchParams(previous);
          patch(next);
          return next;
        },
        {replace: true}
      ),
    [setParams]
  );
  const goTo = (next: Tab, nextSection?: InformationSection) =>
    setParam(p => {
      if (next === 'overview') p.delete('tab');
      else p.set('tab', next);
      if (next === 'information' && nextSection && nextSection !== 'details')
        p.set('section', nextSection);
      else p.delete('section');
    });
  const onPeriod = (value: PeriodValue) => setParam(p => writePeriod(p, value));
  const onStore = (value: string | undefined) =>
    setParam(p => (value ? p.set('storeId', value) : p.delete('storeId')));

  const editor = useDetailsEditor(data, invalid => goTo('information', invalid));
  const sizesEditor = useSizesPrepEditor(data);
  const guard = useUnsavedGuard(editor.dirty || sizesEditor.dirty);

  const stores = useMyStores();
  const categories = useCategories();
  const stock = useProductStock(data.id);
  const pricing = useProductPricing(data.id);
  const categoryName = categoryPath(data.categoryId, categories.data ?? []) ?? undefined;
  const cover = useFileUrls(data.imagePaths[0] ? [data.imagePaths[0]] : []);

  const shared = {
    product: data,
    period,
    storeId,
    onPeriod,
    onStore,
    stores: stores.data?.stores,
    canManage,
  };

  return (
    <>
      {guard.dialog}
      {back}
      <Tabs value={tab} onValueChange={value => goTo(value as Tab)}>
        <ProductWorkspaceHeader
          product={data}
          categoryName={categoryName}
          coverUrl={data.imagePaths[0] ? cover.data?.get(data.imagePaths[0]) : undefined}
          pricing={pricing.data}
          stock={stock.data}
          canManage={canManage}
          editsPending={editor.dirty || sizesEditor.dirty}
          onEdit={() => goTo('information')}
        />
        <ProductTabNav tabs={TABS.map(value => ({value, label: TAB_LABEL[value]}))} />

        <div className="@container min-w-0">
          <TabsContent value="overview">
            <ProductOverviewTab {...shared} onTab={goTo} />
          </TabsContent>
          <TabsContent value="analytics">
            <ProductAnalyticsTab {...shared} />
          </TabsContent>
          <TabsContent value="inventory">
            <ProductInventoryTab {...shared} />
          </TabsContent>
          <TabsContent value="pricing">
            <ProductPricingTab {...shared} onEditPrices={() => goTo('information', 'sizes')} />
          </TabsContent>
          <TabsContent value="information">
            <ProductInformationTab
              product={data}
              canManage={canManage}
              section={section}
              onSection={next => goTo('information', next)}
              editor={editor}
              sizesEditor={sizesEditor}
            />
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}
