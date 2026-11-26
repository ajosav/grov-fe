import type {
  BatchBalance,
  BatchCorrection,
  CompleteTransferBody,
  CorrectBatchBody,
  CountLinesBody,
  CountStatus,
  CreateCountBody,
  CreateFarmBody,
  CreateGrnBody,
  CreateLocationBody,
  CreateSupplierBody,
  CreateTransferBody,
  DepartTransferBody,
  GoodsReceivedNote,
  GrnChargeBody,
  GrnStatus,
  GrnSummary,
  InventoryBatch,
  InventoryBatchDetail,
  InventoryLocation,
  LedgerResult,
  ReceiveTransferBody,
  RejectCountBody,
  StatusMoveBody,
  StockAlert,
  StockCount,
  StockCountSummary,
  StockTransfer,
  StockTransferSummary,
  Supplier,
  SupplierFarm,
  TransferStatus,
  UpdateGrnBody,
  UpdateLocationBody,
  UpdateSupplierBody,
  VerifyTransferBody,
  WriteOffBody,
} from '@grov/models';

import type {ApiClient} from '../client';

export interface BatchListParams {
  productId?: string;
  q?: string;
  /** Only batches with stock still on hand. */
  withStock?: boolean;
  cursor?: string;
  limit?: number;
}

export interface TransferListParams {
  direction?: 'in' | 'out';
  status?: TransferStatus;
  cursor?: string;
  limit?: number;
}

export interface CountListParams {
  status?: CountStatus;
  cursor?: string;
  limit?: number;
}

export interface GrnListParams {
  status?: GrnStatus;
  supplierId?: string;
  cursor?: string;
  limit?: number;
}

export interface SupplierListParams {
  q?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  cursor?: string;
  limit?: number;
}

export interface AlertListParams {
  status?: 'OPEN' | 'RESOLVED';
  cursor?: string;
  limit?: number;
}

const idem = (key: string) => ({'Idempotency-Key': key});

/**
 * Inventory at the store this session switched to: locations, batches, goods received notes,
 * transfers and counts, plus the suppliers goods are bought from. Every write needs an
 * Idempotency-Key, one per user intent and reused on retry.
 */
export function adminInventoryApi(client: ApiClient) {
  const inv = '/v1/admin/store/inventory';
  const grns = '/v1/admin/store/procurement/grns';
  const suppliers = '/v1/admin/suppliers';
  const enc = encodeURIComponent;
  return {
    // Locations
    locations: () => client.request<InventoryLocation[]>({method: 'get', url: `${inv}/locations`}),
    createLocation: (body: CreateLocationBody, key: string) =>
      client.request<InventoryLocation>({
        method: 'post',
        url: `${inv}/locations`,
        data: body,
        headers: idem(key),
      }),
    updateLocation: (id: string, body: UpdateLocationBody) =>
      client.request<InventoryLocation>({
        method: 'patch',
        url: `${inv}/locations/${enc(id)}`,
        data: body,
      }),

    // Batches and balances
    batches: (params: BatchListParams = {}) =>
      client.requestEnvelope<InventoryBatch[]>({method: 'get', url: `${inv}/batches`, params}),
    batch: (id: string) =>
      client.request<InventoryBatchDetail>({method: 'get', url: `${inv}/batches/${enc(id)}`}),
    batchCorrections: (id: string) =>
      client.request<BatchCorrection[]>({
        method: 'get',
        url: `${inv}/batches/${enc(id)}/corrections`,
      }),
    correctBatch: (id: string, body: CorrectBatchBody, key: string) =>
      client.request<BatchCorrection>({
        method: 'post',
        url: `${inv}/batches/${enc(id)}/corrections`,
        data: body,
        headers: idem(key),
      }),
    balances: (productId: string) =>
      client.request<BatchBalance[]>({
        method: 'get',
        url: `/v1/admin/store/stock/${enc(productId)}/balances`,
      }),
    statusMove: (body: StatusMoveBody, key: string) =>
      client.request<LedgerResult[]>({
        method: 'post',
        url: `${inv}/status-moves`,
        data: body,
        headers: idem(key),
      }),
    writeOff: (body: WriteOffBody, key: string) =>
      client.request<LedgerResult[]>({
        method: 'post',
        url: `${inv}/write-offs`,
        data: body,
        headers: idem(key),
      }),

    // Reconcile alerts
    alerts: (params: AlertListParams = {}) =>
      client.requestEnvelope<StockAlert[]>({method: 'get', url: `${inv}/alerts`, params}),
    resolveAlert: (id: string, note: string, key: string) =>
      client.request<StockAlert>({
        method: 'post',
        url: `${inv}/alerts/${enc(id)}/resolve`,
        data: {note},
        headers: idem(key),
      }),

    // Goods received notes
    grns: (params: GrnListParams = {}) =>
      client.requestEnvelope<GrnSummary[]>({method: 'get', url: grns, params}),
    grn: (id: string) =>
      client.request<GoodsReceivedNote>({method: 'get', url: `${grns}/${enc(id)}`}),
    createGrn: (body: CreateGrnBody, key: string) =>
      client.request<GoodsReceivedNote>({
        method: 'post',
        url: grns,
        data: body,
        headers: idem(key),
      }),
    updateGrn: (id: string, body: UpdateGrnBody) =>
      client.request<GoodsReceivedNote>({method: 'patch', url: `${grns}/${enc(id)}`, data: body}),
    cancelGrn: (id: string) =>
      client.request<GoodsReceivedNote>({method: 'delete', url: `${grns}/${enc(id)}`}),
    postGrn: (id: string, key: string) =>
      client.request<GoodsReceivedNote>({
        method: 'post',
        url: `${grns}/${enc(id)}/post`,
        headers: idem(key),
      }),
    addGrnCharge: (id: string, body: GrnChargeBody, key: string) =>
      client.request<GoodsReceivedNote>({
        method: 'post',
        url: `${grns}/${enc(id)}/charges`,
        data: body,
        headers: idem(key),
      }),

    // Transfers
    transfers: (params: TransferListParams = {}) =>
      client.requestEnvelope<StockTransferSummary[]>({
        method: 'get',
        url: `${inv}/transfers`,
        params,
      }),
    transfer: (id: string) =>
      client.request<StockTransfer>({method: 'get', url: `${inv}/transfers/${enc(id)}`}),
    createTransfer: (body: CreateTransferBody, key: string) =>
      client.request<StockTransfer>({
        method: 'post',
        url: `${inv}/transfers`,
        data: body,
        headers: idem(key),
      }),
    transferStep: (
      id: string,
      step: 'dispatch' | 'depart' | 'receive' | 'verify' | 'complete' | 'cancel',
      key: string,
      body?: DepartTransferBody | ReceiveTransferBody | VerifyTransferBody | CompleteTransferBody
    ) =>
      client.request<StockTransfer>({
        method: 'post',
        url: `${inv}/transfers/${enc(id)}/${step}`,
        data: body ?? {},
        headers: idem(key),
      }),

    // Counts
    counts: (params: CountListParams = {}) =>
      client.requestEnvelope<StockCountSummary[]>({method: 'get', url: `${inv}/counts`, params}),
    count: (id: string) =>
      client.request<StockCount>({method: 'get', url: `${inv}/counts/${enc(id)}`}),
    createCount: (body: CreateCountBody, key: string) =>
      client.request<StockCount>({
        method: 'post',
        url: `${inv}/counts`,
        data: body,
        headers: idem(key),
      }),
    putCountLines: (id: string, body: CountLinesBody) =>
      client.request<StockCount>({
        method: 'put',
        url: `${inv}/counts/${enc(id)}/lines`,
        data: body,
      }),
    countStep: (
      id: string,
      step: 'submit' | 'approve' | 'reject',
      key: string,
      body?: RejectCountBody
    ) =>
      client.request<StockCount>({
        method: 'post',
        url: `${inv}/counts/${enc(id)}/${step}`,
        data: body ?? {},
        headers: idem(key),
      }),

    // Suppliers (not store scoped)
    suppliers: (params: SupplierListParams = {}) =>
      client.requestEnvelope<Supplier[]>({method: 'get', url: suppliers, params}),
    supplier: (id: string) =>
      client.request<Supplier>({method: 'get', url: `${suppliers}/${enc(id)}`}),
    createSupplier: (body: CreateSupplierBody, key: string) =>
      client.request<Supplier>({method: 'post', url: suppliers, data: body, headers: idem(key)}),
    updateSupplier: (id: string, body: UpdateSupplierBody) =>
      client.request<Supplier>({method: 'patch', url: `${suppliers}/${enc(id)}`, data: body}),
    createFarm: (supplierId: string, body: CreateFarmBody, key: string) =>
      client.request<SupplierFarm>({
        method: 'post',
        url: `${suppliers}/${enc(supplierId)}/farms`,
        data: body,
        headers: idem(key),
      }),
  };
}
export type AdminInventoryApi = ReturnType<typeof adminInventoryApi>;
