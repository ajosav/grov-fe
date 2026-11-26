import {useMemo, useState} from 'react';

import {useProductBalances, useStatusMove, useWriteOff} from '@grov/hooks';
import type {BatchBalance, StockBalanceStatus} from '@grov/models';
import {errorMessage} from '@grov/shared';
import {
  Alert,
  Button,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  toast,
} from '@grov/ui';

import {pickEntryUnit} from '../../lib/catalogue/units';
import {
  BALANCE_STATUS,
  newKey,
  qtyText,
  WRITE_OFF_REASONS,
} from '../../lib/inventory/inventory-format';
import {QuantityInput} from '../common/quantity-input';

export interface BalanceProduct {
  productId: string;
  name: string;
  sku: string;
  baseUnit: string;
}

interface FormProps {
  product: BalanceProduct;
  /** Start on this batch when the caller already knows it. */
  batchId?: string;
  onDone: () => void;
}

/** What can be taken out of a balance: reserved stock is spoken for. */
function free(balance: BatchBalance): number {
  return Math.max(0, Number(balance.qty) - Number(balance.allocatedQty));
}

const MOVABLE: StockBalanceStatus[] = [
  'AVAILABLE',
  'QUARANTINED',
  'DAMAGED',
  'SPOILED',
  'EXPIRED',
  'RETURNED',
];

const balanceLabel = (balance: BatchBalance, unit: string) =>
  `${balance.batchNumber} · ${balance.locationName} · ${BALANCE_STATUS[balance.status].label} · ${qtyText(String(free(balance)), unit)}`;

/** Picks the balance (batch, place, status) an action works on. */
function BalancePicker({
  balances,
  value,
  onChange,
  unit,
}: {
  balances: BatchBalance[];
  value: string;
  onChange: (key: string) => void;
  unit: string;
}) {
  return (
    <Field label="Stock to use" hint="A batch in one place, in one condition.">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a batch" />
        </SelectTrigger>
        <SelectContent>
          {balances.map(balance => (
            <SelectItem key={balanceKey(balance)} value={balanceKey(balance)}>
              {balanceLabel(balance, unit)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

const balanceKey = (b: BatchBalance) => `${b.batchId}|${b.locationId}|${b.status}`;

function useBalanceChoice(
  product: BalanceProduct,
  batchId: string | undefined,
  allowed: (balance: BatchBalance) => boolean
) {
  const query = useProductBalances(product.productId);
  const balances = useMemo(
    () => (query.data ?? []).filter(balance => allowed(balance) && free(balance) > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `allowed` is a stable module function per form
    [query.data]
  );
  const preferred = balances.find(b => b.batchId === batchId) ?? balances[0];
  const [picked, setPicked] = useState<string | null>(null);
  const key = picked ?? (preferred ? balanceKey(preferred) : '');
  const selected = balances.find(b => balanceKey(b) === key);
  return {query, balances, key, setPicked, selected};
}

const writable = (b: BatchBalance) => b.status !== 'IN_TRANSIT' && b.status !== 'PROCESSING';

export function WriteOffForm({product, batchId, onDone}: FormProps) {
  const writeOff = useWriteOff();
  const [idempotencyKey] = useState(newKey);
  const {query, balances, key, setPicked, selected} = useBalanceChoice(product, batchId, writable);
  const [entry, setEntry] = useState(() => pickEntryUnit(product.baseUnit, '1000').code);
  const [qty, setQty] = useState('');
  const [reasonCode, setReasonCode] = useState<string>(WRITE_OFF_REASONS[0].code);
  const [reason, setReason] = useState('');
  const max = selected ? free(selected) : 0;
  const tooMuch = qty !== '' && Number(qty) > max;
  const ready = !!selected && qty !== '' && Number(qty) > 0 && !tooMuch && reason.trim() !== '';

  return (
    <>
      <DialogHeader>
        <DialogTitle>Write off stock</DialogTitle>
        <DialogDescription>
          {product.name} · {product.sku}. Takes spoiled, damaged or lost stock out of the books.
        </DialogDescription>
      </DialogHeader>
      {query.isPending ? (
        <Skeleton className="h-32" />
      ) : balances.length === 0 ? (
        <Alert tone="info">Nothing on hand can be written off.</Alert>
      ) : (
        <form
          noValidate
          className="grid gap-5"
          onSubmit={event => {
            event.preventDefault();
            if (!ready || !selected) return;
            writeOff.mutate(
              {
                idempotencyKey,
                body: {
                  batchId: selected.batchId,
                  locationId: selected.locationId,
                  status: selected.status as Exclude<
                    StockBalanceStatus,
                    'IN_TRANSIT' | 'PROCESSING'
                  >,
                  qty,
                  reasonCode: reasonCode as (typeof WRITE_OFF_REASONS)[number]['code'],
                  reason: reason.trim(),
                },
              },
              {
                onSuccess: () => {
                  toast.success(`Written off from ${product.name}`);
                  onDone();
                },
              }
            );
          }}
        >
          <BalancePicker
            balances={balances}
            value={key}
            onChange={setPicked}
            unit={product.baseUnit}
          />
          <Field
            label="Quantity"
            error={tooMuch ? 'More than is free. Reserved stock can’t be written off.' : undefined}
          >
            <QuantityInput
              value={qty}
              onChange={setQty}
              unit={product.baseUnit}
              entry={entry}
              onEntryChange={setEntry}
              autoFocus
            />
          </Field>
          <Field label="Why">
            <Select value={reasonCode} onValueChange={setReasonCode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WRITE_OFF_REASONS.map(option => (
                  <SelectItem key={option.code} value={option.code}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Detail" hint="What happened. Shows in the audit log.">
            <Input value={reason} maxLength={200} onChange={e => setReason(e.target.value)} />
          </Field>
          {writeOff.isError ? <Alert tone="danger">{errorMessage(writeOff.error)}</Alert> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onDone}>
              Cancel
            </Button>
            <Button type="submit" loading={writeOff.isPending} disabled={!ready}>
              Write off
            </Button>
          </DialogFooter>
        </form>
      )}
    </>
  );
}

export function StatusMoveForm({product, batchId, onDone}: FormProps) {
  const move = useStatusMove();
  const [idempotencyKey] = useState(newKey);
  const {query, balances, key, setPicked, selected} = useBalanceChoice(product, batchId, writable);
  const [entry, setEntry] = useState(() => pickEntryUnit(product.baseUnit, '1000').code);
  const [qty, setQty] = useState('');
  const [to, setTo] = useState<StockBalanceStatus | ''>('');
  const [reason, setReason] = useState('');
  const options = MOVABLE.filter(status => status !== selected?.status);
  const target = to !== '' && options.includes(to) ? to : '';
  const max = selected ? free(selected) : 0;
  const tooMuch = qty !== '' && Number(qty) > max;
  const ready =
    !!selected &&
    target !== '' &&
    qty !== '' &&
    Number(qty) > 0 &&
    !tooMuch &&
    reason.trim() !== '';

  return (
    <>
      <DialogHeader>
        <DialogTitle>Change condition</DialogTitle>
        <DialogDescription>
          {product.name} · {product.sku}. Hold, release or reclassify part of a batch. Only
          available stock is sold.
        </DialogDescription>
      </DialogHeader>
      {query.isPending ? (
        <Skeleton className="h-32" />
      ) : balances.length === 0 ? (
        <Alert tone="info">Nothing on hand can be moved.</Alert>
      ) : (
        <form
          noValidate
          className="grid gap-5"
          onSubmit={event => {
            event.preventDefault();
            if (!ready || !selected) return;
            move.mutate(
              {
                idempotencyKey,
                body: {
                  batchId: selected.batchId,
                  locationId: selected.locationId,
                  from: selected.status,
                  to: target,
                  qty,
                  reason: reason.trim(),
                },
              },
              {
                onSuccess: () => {
                  toast.success(`Moved to ${BALANCE_STATUS[target].label.toLowerCase()}`);
                  onDone();
                },
              }
            );
          }}
        >
          <BalancePicker
            balances={balances}
            value={key}
            onChange={setPicked}
            unit={product.baseUnit}
          />
          <Field label="Move to">
            <Select value={target} onValueChange={value => setTo(value as StockBalanceStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a condition" />
              </SelectTrigger>
              <SelectContent>
                {options.map(status => (
                  <SelectItem key={status} value={status}>
                    {BALANCE_STATUS[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Quantity" error={tooMuch ? 'More than is free.' : undefined}>
            <QuantityInput
              value={qty}
              onChange={setQty}
              unit={product.baseUnit}
              entry={entry}
              onEntryChange={setEntry}
            />
          </Field>
          <Field label="Reason">
            <Input value={reason} maxLength={200} onChange={e => setReason(e.target.value)} />
          </Field>
          {move.isError ? <Alert tone="danger">{errorMessage(move.error)}</Alert> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onDone}>
              Cancel
            </Button>
            <Button type="submit" loading={move.isPending} disabled={!ready}>
              Move stock
            </Button>
          </DialogFooter>
        </form>
      )}
    </>
  );
}
