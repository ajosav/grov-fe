import type {ReactNode} from 'react';

import {ArrowLeft, Package} from 'lucide-react';
import {Link, useParams, useSearchParams} from 'react-router';

import {isApiError} from '@grov/api';
import {useProduct, useUpdateProduct} from '@grov/hooks';
import {appConfig, ErrorCode, PERMISSIONS, type Product} from '@grov/models';
import {errorMessage, usePermissions} from '@grov/shared';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from '@grov/ui';

import {ActiveBadge} from '../../components/catalogue/category-badges';
import {
  DetailsTab,
  MoreTab,
  SizesPrepTab,
  useDetailsEditor,
  useSizesPrepEditor,
} from '../../components/catalogue/product-tabs';
import {useUnsavedGuard} from '../../components/unsaved-guard';
import type {AdminRouteHandle} from '../../lib/route-access';
import {unitNoun} from '../../lib/units';
import {paths} from '../../paths';
import type {Route} from './+types/product';

export const handle = {
  requires: {allOf: [PERMISSIONS.PRODUCTS.READ]},
} satisfies AdminRouteHandle;

export const meta: Route.MetaFunction = () => [{title: `Product · ${appConfig.brandName} admin`}];

const TABS = ['details', 'sizes', 'more'] as const;
type Tab = (typeof TABS)[number];
const isTab = (value: string | null): value is Tab => TABS.includes(value as Tab);
// Prep options, photos and where it's sold used to be their own tabs; old links still land in the right place.
const tabOf = (value: string | null): Tab =>
  value === 'prep' ? 'sizes' : isTab(value) ? value : 'details';

export default function ProductPage() {
  const {productId} = useParams();
  const [params, setParams] = useSearchParams();
  const tab = tabOf(params.get('tab'));
  const product = useProduct(productId);
  const {can} = usePermissions();
  const canManage = can(PERMISSIONS.PRODUCTS.MANAGE);

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
        <Skeleton className="mb-6 h-10 w-72" />
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

  return (
    <ProductView
      data={product.data}
      canManage={canManage}
      back={back}
      tab={tab}
      onTab={value =>
        setParams(
          previous => {
            const next = new URLSearchParams(previous);
            if (value === 'details') next.delete('tab');
            else next.set('tab', value);
            return next;
          },
          {replace: true}
        )
      }
    />
  );
}

interface ProductViewProps {
  data: Product;
  canManage: boolean;
  back: ReactNode;
  tab: Tab;
  onTab: (tab: Tab) => void;
}

/** Split out so the edit form (one Save for Details and More information) lives below the loading states. */
function ProductView({data, canManage, back, tab, onTab}: ProductViewProps) {
  const editor = useDetailsEditor(data, onTab);
  const sizesEditor = useSizesPrepEditor(data);
  const guard = useUnsavedGuard(editor.dirty || sizesEditor.dirty);
  const publish = useUpdateProduct();
  const liveSizes = data.sizes.filter(size => size.active).length;
  const livePrep = data.prepOptions.filter(option => option.active).length;

  return (
    <>
      {guard.dialog}
      {back}
      <header className="grid gap-1 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-title-lg">{data.displayName}</h1>
          <ActiveBadge active={data.active} draft={data.draft} />
          {data.availableAtAllStores ? <Badge tone="sky">All stores</Badge> : null}
        </div>
        <p className="text-body text-ink-muted">
          {data.sku}
          {data.brand ? ` · ${data.brand}` : ''} · counted in {unitNoun(data.baseUnit)}
        </p>
      </header>

      {data.draft ? (
        <Alert tone="info" title="This product is a draft" className="mb-5 max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              {publish.isError
                ? errorMessage(publish.error)
                : 'Shoppers can’t see it yet. Give every size a price, then publish it. Save your edits first.'}
            </span>
            {canManage ? (
              <Button
                loading={publish.isPending}
                disabled={editor.dirty || sizesEditor.dirty}
                onClick={() =>
                  publish.mutate(
                    {id: data.id, body: {draft: false}},
                    {onSuccess: () => toast.success(`${data.displayName} is live`)}
                  )
                }
              >
                Publish
              </Button>
            ) : null}
          </div>
        </Alert>
      ) : null}

      <Tabs value={tab} onValueChange={value => onTab(value as Tab)}>
        <TabsList className="mb-5 max-w-full justify-start overflow-x-auto [&_button]:h-8 [&_button]:shrink-0 [&_button]:whitespace-nowrap">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="sizes">Sizes &amp; prep options ({liveSizes + livePrep})</TabsTrigger>
          <TabsTrigger value="more">More information</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <DetailsTab product={data} canManage={canManage} editor={editor} />
        </TabsContent>
        <TabsContent value="sizes">
          <SizesPrepTab product={data} canManage={canManage} editor={sizesEditor} />
        </TabsContent>
        <TabsContent value="more">
          <MoreTab product={data} canManage={canManage} editor={editor} />
        </TabsContent>
      </Tabs>
    </>
  );
}
