import {useInfiniteQuery, useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {queryKeys, useApi} from '@grov/api';
import type {
  CreateProductBody,
  Product,
  PutListingBody,
  ReplacePrepOptionsBody,
  ReplaceSizesBody,
  UpdateProductBody,
} from '@grov/models';

export interface ProductFilters {
  categoryId?: string;
  storeId?: string;
  listed?: boolean;
  q?: string;
  active?: boolean;
  draft?: boolean;
}

/** Products, newest first (cursor-paginated). `q` searches name, SKU and brand. */
export function useProducts(filters: ProductFilters = {}) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: queryKeys.adminProducts.list(filters),
    queryFn: ({pageParam}) => api.adminProducts.list({...filters, cursor: pageParam}),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => page.meta?.nextCursor ?? undefined,
  });
}

export function useProduct(id: string | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.adminProducts.detail(id ?? ''),
    queryFn: () => api.adminProducts.get(id ?? ''),
    enabled: Boolean(id),
  });
}

/** Every write returns the whole product: set it, and refresh the lists and category counts. */
function useProductWritten() {
  const queryClient = useQueryClient();
  return async (product: Product) => {
    queryClient.setQueryData(queryKeys.adminProducts.detail(product.id), product);
    await Promise.all([
      queryClient.invalidateQueries({queryKey: queryKeys.adminProducts.lists}),
      queryClient.invalidateQueries({queryKey: queryKeys.adminCategories.all}),
    ]);
  };
}

export function useCreateProduct() {
  const api = useApi();
  const written = useProductWritten();
  return useMutation({
    /** `idempotencyKey`: created when the admin opens the form, reused on retry (data.md). */
    mutationFn: ({body, idempotencyKey}: {body: CreateProductBody; idempotencyKey: string}) =>
      api.adminProducts.create(body, idempotencyKey),
    onSuccess: written,
  });
}

export function useUpdateProduct() {
  const api = useApi();
  const written = useProductWritten();
  return useMutation({
    mutationFn: ({id, body}: {id: string; body: UpdateProductBody}) =>
      api.adminProducts.update(id, body),
    onSuccess: written,
  });
}

export function useReplaceSizes() {
  const api = useApi();
  const written = useProductWritten();
  return useMutation({
    mutationFn: ({id, body}: {id: string; body: ReplaceSizesBody}) =>
      api.adminProducts.replaceSizes(id, body),
    onSuccess: written,
  });
}

export function useReplacePrepOptions() {
  const api = useApi();
  const written = useProductWritten();
  return useMutation({
    mutationFn: ({id, body}: {id: string; body: ReplacePrepOptionsBody}) =>
      api.adminProducts.replacePrepOptions(id, body),
    onSuccess: written,
  });
}

/** Where one product is listed, store by store (only stores this admin can act on). */
export function useProductListings(productId: string | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.adminProducts.listingsOf(productId ?? ''),
    queryFn: () => api.adminProducts.listings(productId ?? ''),
    enabled: Boolean(productId),
  });
}

/** A listing change moves the product between the store's lists and the product lists. */
function useProductListingWritten() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({queryKey: queryKeys.adminProducts.listings}),
      queryClient.invalidateQueries({queryKey: queryKeys.adminProducts.lists}),
      queryClient.invalidateQueries({queryKey: queryKeys.adminListings.all}),
    ]);
}

/** List, pause or resume a product at one store (replaces that listing). */
export function usePutProductListing() {
  const api = useApi();
  const written = useProductListingWritten();
  return useMutation({
    mutationFn: ({
      productId,
      storeId,
      body,
    }: {
      productId: string;
      storeId: string;
      body: PutListingBody;
    }) => api.adminProducts.putListing(productId, storeId, body),
    onSuccess: written,
  });
}

export function useDelistProductAt() {
  const api = useApi();
  const written = useProductListingWritten();
  return useMutation({
    mutationFn: ({productId, storeId}: {productId: string; storeId: string}) =>
      api.adminProducts.delistAt(productId, storeId),
    onSuccess: written,
  });
}
