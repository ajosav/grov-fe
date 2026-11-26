import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  type AlertListParams,
  type BatchListParams,
  type CountListParams,
  type GrnListParams,
  queryKeys,
  type SupplierListParams,
  type TransferListParams,
  useApi,
} from '@grov/api';
import type {
  CompleteTransferBody,
  CorrectBatchBody,
  CountLinesBody,
  CreateCountBody,
  CreateFarmBody,
  CreateGrnBody,
  CreateLocationBody,
  CreateSupplierBody,
  CreateTransferBody,
  DepartTransferBody,
  GrnChargeBody,
  ReceiveTransferBody,
  RejectCountBody,
  StatusMoveBody,
  UpdateGrnBody,
  UpdateLocationBody,
  UpdateSupplierBody,
  VerifyTransferBody,
  WriteOffBody,
} from '@grov/models';

const keys = queryKeys.adminInventory;

/**
 * Inventory changed: every inventory list, the stock levels that sum it and a product's
 * inventory tab refresh together.
 */
function useInventoryWritten() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({queryKey: keys.all}),
      queryClient.invalidateQueries({queryKey: queryKeys.adminStock.all}),
      queryClient.invalidateQueries({queryKey: queryKeys.adminProductAnalytics.all}),
    ]);
}

// Locations
export function useInventoryLocations() {
  const api = useApi();
  return useQuery({queryKey: keys.locations, queryFn: () => api.adminInventory.locations()});
}

export function useCreateLocation() {
  const api = useApi();
  const written = useInventoryWritten();
  return useMutation({
    mutationFn: ({body, idempotencyKey}: {body: CreateLocationBody; idempotencyKey: string}) =>
      api.adminInventory.createLocation(body, idempotencyKey),
    onSuccess: written,
  });
}

export function useUpdateLocation() {
  const api = useApi();
  const written = useInventoryWritten();
  return useMutation({
    mutationFn: ({id, body}: {id: string; body: UpdateLocationBody}) =>
      api.adminInventory.updateLocation(id, body),
    onSuccess: written,
  });
}

// Batches and balances
export function useInventoryBatches(params: Omit<BatchListParams, 'cursor'> = {}) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: keys.batches(params),
    queryFn: ({pageParam}) => api.adminInventory.batches({...params, cursor: pageParam}),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => page.meta?.nextCursor ?? undefined,
  });
}

export function useInventoryBatch(id: string | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: keys.batch(id ?? ''),
    queryFn: () => api.adminInventory.batch(id as string),
    enabled: !!id,
  });
}

export function useProductBalances(productId: string | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: keys.balances(productId ?? ''),
    queryFn: () => api.adminInventory.balances(productId as string),
    enabled: !!productId,
  });
}

export function useStatusMove() {
  const api = useApi();
  const written = useInventoryWritten();
  return useMutation({
    mutationFn: ({body, idempotencyKey}: {body: StatusMoveBody; idempotencyKey: string}) =>
      api.adminInventory.statusMove(body, idempotencyKey),
    onSuccess: written,
  });
}

export function useWriteOff() {
  const api = useApi();
  const written = useInventoryWritten();
  return useMutation({
    mutationFn: ({body, idempotencyKey}: {body: WriteOffBody; idempotencyKey: string}) =>
      api.adminInventory.writeOff(body, idempotencyKey),
    onSuccess: written,
  });
}

// Reconcile alerts
export function useStockAlerts(params: Omit<AlertListParams, 'cursor'> = {}) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: keys.alerts(params),
    queryFn: ({pageParam}) => api.adminInventory.alerts({...params, cursor: pageParam}),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => page.meta?.nextCursor ?? undefined,
  });
}

export function useResolveAlert() {
  const api = useApi();
  const written = useInventoryWritten();
  return useMutation({
    mutationFn: ({id, note, idempotencyKey}: {id: string; note: string; idempotencyKey: string}) =>
      api.adminInventory.resolveAlert(id, note, idempotencyKey),
    onSuccess: written,
  });
}

// Goods received notes
export function useGrns(params: Omit<GrnListParams, 'cursor'> = {}) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: keys.grns(params),
    queryFn: ({pageParam}) => api.adminInventory.grns({...params, cursor: pageParam}),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => page.meta?.nextCursor ?? undefined,
  });
}

export function useGrn(id: string | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: keys.grn(id ?? ''),
    queryFn: () => api.adminInventory.grn(id as string),
    enabled: !!id,
  });
}

export function useCreateGrn() {
  const api = useApi();
  const written = useInventoryWritten();
  return useMutation({
    mutationFn: ({body, idempotencyKey}: {body: CreateGrnBody; idempotencyKey: string}) =>
      api.adminInventory.createGrn(body, idempotencyKey),
    onSuccess: written,
  });
}

export function useUpdateGrn() {
  const api = useApi();
  const written = useInventoryWritten();
  return useMutation({
    mutationFn: ({id, body}: {id: string; body: UpdateGrnBody}) =>
      api.adminInventory.updateGrn(id, body),
    onSuccess: written,
  });
}

export function useCancelGrn() {
  const api = useApi();
  const written = useInventoryWritten();
  return useMutation({
    mutationFn: (id: string) => api.adminInventory.cancelGrn(id),
    onSuccess: written,
  });
}

/** Books a draft note into stock: batches, ledger rows and landed cost in one step. */
export function usePostGrn() {
  const api = useApi();
  const written = useInventoryWritten();
  return useMutation({
    mutationFn: ({id, idempotencyKey}: {id: string; idempotencyKey: string}) =>
      api.adminInventory.postGrn(id, idempotencyKey),
    onSuccess: written,
  });
}

export function useAddGrnCharge() {
  const api = useApi();
  const written = useInventoryWritten();
  return useMutation({
    mutationFn: ({
      id,
      body,
      idempotencyKey,
    }: {
      id: string;
      body: GrnChargeBody;
      idempotencyKey: string;
    }) => api.adminInventory.addGrnCharge(id, body, idempotencyKey),
    onSuccess: written,
  });
}

// Transfers
export function useTransfers(params: Omit<TransferListParams, 'cursor'> = {}) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: keys.transfers(params),
    queryFn: ({pageParam}) => api.adminInventory.transfers({...params, cursor: pageParam}),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => page.meta?.nextCursor ?? undefined,
  });
}

export function useTransfer(id: string | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: keys.transfer(id ?? ''),
    queryFn: () => api.adminInventory.transfer(id as string),
    enabled: !!id,
  });
}

export function useCreateTransfer() {
  const api = useApi();
  const written = useInventoryWritten();
  return useMutation({
    mutationFn: ({body, idempotencyKey}: {body: CreateTransferBody; idempotencyKey: string}) =>
      api.adminInventory.createTransfer(body, idempotencyKey),
    onSuccess: written,
  });
}

export type TransferStep = 'dispatch' | 'depart' | 'receive' | 'verify' | 'complete' | 'cancel';

/** One step of the transfer flow. The body depends on the step (depart, receive, verify, complete). */
export function useTransferStep() {
  const api = useApi();
  const written = useInventoryWritten();
  return useMutation({
    mutationFn: ({
      id,
      step,
      idempotencyKey,
      body,
    }: {
      id: string;
      step: TransferStep;
      idempotencyKey: string;
      body?: DepartTransferBody | ReceiveTransferBody | VerifyTransferBody | CompleteTransferBody;
    }) => api.adminInventory.transferStep(id, step, idempotencyKey, body),
    onSuccess: written,
  });
}

// Counts
export function useCounts(params: Omit<CountListParams, 'cursor'> = {}) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: keys.counts(params),
    queryFn: ({pageParam}) => api.adminInventory.counts({...params, cursor: pageParam}),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => page.meta?.nextCursor ?? undefined,
  });
}

export function useCount(id: string | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: keys.count(id ?? ''),
    queryFn: () => api.adminInventory.count(id as string),
    enabled: !!id,
  });
}

export function useCreateCount() {
  const api = useApi();
  const written = useInventoryWritten();
  return useMutation({
    mutationFn: ({body, idempotencyKey}: {body: CreateCountBody; idempotencyKey: string}) =>
      api.adminInventory.createCount(body, idempotencyKey),
    onSuccess: written,
  });
}

export function usePutCountLines() {
  const api = useApi();
  const written = useInventoryWritten();
  return useMutation({
    mutationFn: ({id, body}: {id: string; body: CountLinesBody}) =>
      api.adminInventory.putCountLines(id, body),
    onSuccess: written,
  });
}

export type CountStep = 'submit' | 'approve' | 'reject';

export function useCountStep() {
  const api = useApi();
  const written = useInventoryWritten();
  return useMutation({
    mutationFn: ({
      id,
      step,
      idempotencyKey,
      body,
    }: {
      id: string;
      step: CountStep;
      idempotencyKey: string;
      body?: RejectCountBody;
    }) => api.adminInventory.countStep(id, step, idempotencyKey, body),
    onSuccess: written,
  });
}

// Suppliers
export function useSuppliers(params: Omit<SupplierListParams, 'cursor'> = {}) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: keys.suppliers(params),
    queryFn: ({pageParam}) => api.adminInventory.suppliers({...params, cursor: pageParam}),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => page.meta?.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
  });
}

export function useSupplier(id: string | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: keys.supplier(id ?? ''),
    queryFn: () => api.adminInventory.supplier(id as string),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const api = useApi();
  const written = useInventoryWritten();
  return useMutation({
    mutationFn: ({body, idempotencyKey}: {body: CreateSupplierBody; idempotencyKey: string}) =>
      api.adminInventory.createSupplier(body, idempotencyKey),
    onSuccess: written,
  });
}

export function useUpdateSupplier() {
  const api = useApi();
  const written = useInventoryWritten();
  return useMutation({
    mutationFn: ({id, body}: {id: string; body: UpdateSupplierBody}) =>
      api.adminInventory.updateSupplier(id, body),
    onSuccess: written,
  });
}

export function useCreateFarm() {
  const api = useApi();
  const written = useInventoryWritten();
  return useMutation({
    mutationFn: ({
      supplierId,
      body,
      idempotencyKey,
    }: {
      supplierId: string;
      body: CreateFarmBody;
      idempotencyKey: string;
    }) => api.adminInventory.createFarm(supplierId, body, idempotencyKey),
    onSuccess: written,
  });
}

// Batch corrections
export function useBatchCorrections(batchId: string | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: keys.corrections(batchId ?? ''),
    queryFn: () => api.adminInventory.batchCorrections(batchId as string),
    enabled: !!batchId,
  });
}

/** Fixes a received batch's dates, quantity or cost; the batch, stock and value refresh. */
export function useCorrectBatch() {
  const api = useApi();
  const written = useInventoryWritten();
  return useMutation({
    mutationFn: ({
      id,
      body,
      idempotencyKey,
    }: {
      id: string;
      body: CorrectBatchBody;
      idempotencyKey: string;
    }) => api.adminInventory.correctBatch(id, body, idempotencyKey),
    onSuccess: written,
  });
}

// Bulk stock import (`procurement.stock-receipts`): drafts for review, nothing is posted
export const STOCK_IMPORT_KIND = 'procurement.stock-receipts';

export function useStartStockImport() {
  const api = useApi();
  return useMutation({
    mutationFn: async (input: {
      file: File;
      userId: string;
      storeId: string;
      dryRun: boolean;
      idempotencyKey: string;
    }) => {
      const stored = await api.adminProductAnalytics.uploadImportFile(input.file, input.userId);
      return api.adminProductAnalytics.startImport(
        {
          kind: STOCK_IMPORT_KIND,
          filePath: stored.path,
          storeId: input.storeId,
          dryRun: input.dryRun,
        },
        input.idempotencyKey
      );
    },
  });
}

const IMPORT_RUNNING = new Set(['PENDING', 'VALIDATING', 'PROCESSING']);

/** Polls the import every 2 s while it runs; refreshes the goods received list when it ends. */
export function useStockImportJob(id: string | undefined) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: keys.importJob(id ?? ''),
    queryFn: async () => {
      const job = await api.adminProductAnalytics.importJob(id ?? '');
      if (!IMPORT_RUNNING.has(job.status)) {
        await queryClient.invalidateQueries({queryKey: keys.all});
      }
      return job;
    },
    enabled: Boolean(id),
    refetchInterval: query =>
      query.state.data && !IMPORT_RUNNING.has(query.state.data.status) ? false : 2000,
  });
}
