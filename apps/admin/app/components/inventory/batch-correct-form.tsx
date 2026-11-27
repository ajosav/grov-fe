import {useState} from 'react';

import {useCorrectBatch, useInventoryBatch} from '@grov/hooks';
import {type CorrectBatchBody, type InventoryBatch, PERMISSIONS} from '@grov/models';
import {errorMessage, usePermissions} from '@grov/shared';
import {
  Alert,
  AmountInput,
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
  toast,
} from '@grov/ui';

import {pickEntryUnit} from '../../lib/catalogue/units';
import {
  BALANCE_STATUS,
  newKey,
  qtyText,
  STOCK_COST_MAX_NAIRA,
} from '../../lib/inventory/inventory-format';
import {QuantityInput} from '../common/quantity-input';

const plain = (qty: string) => String(Number(qty));

/**
 * Fixes a batch after it was received: a wrong expiry or harvest date, a wrong quantity or a
 * wrong purchase cost. History is never edited: dates are corrected in place and recorded,
 * quantity and cost write adjustments to the ledger. A reason is required and kept.
 */
export function BatchCorrectForm({batch, onDone}: {batch: InventoryBatch; onDone: () => void}) {
  const {can} = usePermissions();
  const correct = useCorrectBatch();
  const detail = useInventoryBatch(batch.id);
  const [idempotencyKey] = useState(newKey);

  const fromDelivery = batch.sourceType === 'GRN';
  const mayAmount = fromDelivery && can(PERMISSIONS.STOCK.ADJUST_APPROVE);
  const mayCost = mayAmount && can(PERMISSIONS.STOCK.COST_READ) && batch.purchaseCost !== null;

  const [expiresOn, setExpiresOn] = useState(batch.expiresOn ?? '');
  const [harvestedOn, setHarvestedOn] = useState(batch.harvestedOn ?? '');
  const [qty, setQty] = useState(plain(batch.qtyReceived));
  const [entry, setEntry] = useState(() => pickEntryUnit(batch.baseUnit, batch.qtyReceived).code);
  const [cost, setCost] = useState<number | null>(batch.purchaseCost?.kobo ?? null);
  const [place, setPlace] = useState('');
  const [reason, setReason] = useState('');

  const balances = (detail.data?.balances ?? []).filter(b => b.status !== 'IN_TRANSIT');
  const placeKey = place || (balances[0] ? `${balances[0].locationId}|${balances[0].status}` : '');
  const [locationId, status] = placeKey.split('|');

  const body: CorrectBatchBody = {reason: reason.trim()};
  if (expiresOn !== (batch.expiresOn ?? '')) body.expiresOn = expiresOn || null;
  if (harvestedOn !== (batch.harvestedOn ?? '')) body.harvestedOn = harvestedOn || null;
  const qtyChanged = mayAmount && qty !== '' && Number(qty) !== Number(batch.qtyReceived);
  if (qtyChanged) {
    body.qtyReceived = qty;
    if (locationId && status) {
      body.locationId = locationId;
      body.status = status as NonNullable<CorrectBatchBody['status']>;
    }
  }
  const costChanged = mayCost && cost !== null && cost !== batch.purchaseCost?.kobo;
  if (costChanged && cost !== null) body.purchaseCostKobo = cost;

  const changed = Object.keys(body).length > 1;
  const wrongDates = expiresOn !== '' && harvestedOn !== '' && expiresOn < harvestedOn;
  const ready = changed && !wrongDates && reason.trim().length >= 3 && Number(qty) > 0;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Correct batch {batch.batchNumber}</DialogTitle>
        <DialogDescription>
          {batch.productName} · {batch.sku}. Fix what was entered wrongly when it was received. The
          old values stay on record with your reason.
        </DialogDescription>
      </DialogHeader>
      <form
        noValidate
        className="grid gap-5"
        onSubmit={event => {
          event.preventDefault();
          if (!ready) return;
          correct.mutate(
            {id: batch.id, body, idempotencyKey},
            {
              onSuccess: () => {
                toast.success(`Batch ${batch.batchNumber} corrected`);
                onDone();
              },
            }
          );
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Harvested">
            <Input
              type="date"
              value={harvestedOn}
              onChange={event => setHarvestedOn(event.target.value)}
            />
          </Field>
          <Field
            label="Expires"
            error={wrongDates ? 'Expiry can’t be before the harvest date.' : undefined}
          >
            <Input
              type="date"
              value={expiresOn}
              onChange={event => setExpiresOn(event.target.value)}
            />
          </Field>
        </div>

        {mayAmount ? (
          <>
            <Field
              label="Quantity received"
              hint={`Was ${qtyText(batch.qtyReceived, batch.baseUnit)}. Stock on hand moves by the difference.`}
            >
              <QuantityInput
                value={qty}
                onChange={setQty}
                unit={batch.baseUnit}
                entry={entry}
                onEntryChange={setEntry}
              />
            </Field>
            {qtyChanged && balances.length > 1 ? (
              <Field label="Where the difference is" hint="One location in one condition.">
                <Select value={placeKey} onValueChange={setPlace}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {balances.map(b => (
                      <SelectItem
                        key={`${b.locationId}|${b.status}`}
                        value={`${b.locationId}|${b.status}`}
                      >
                        {b.locationName} · {BALANCE_STATUS[b.status].label} ·{' '}
                        {qtyText(b.qty, batch.baseUnit)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            ) : null}
          </>
        ) : null}

        {mayCost ? (
          <Field
            label="Purchase cost"
            hint="What was paid for the whole batch, without extra costs. Only the stock still on hand is restated; what was already sold keeps its cost."
          >
            <AmountInput
              maxNaira={STOCK_COST_MAX_NAIRA}
              aria-label="Purchase cost"
              valueKobo={cost}
              onChangeKobo={setCost}
            />
          </Field>
        ) : null}

        {!fromDelivery ? (
          <Alert tone="info">
            This batch didn’t come from a delivery, so only its dates can be corrected.
          </Alert>
        ) : !mayAmount ? (
          <Alert tone="info">
            Quantity and cost changes need the permission to approve stock adjustments. You can
            correct the dates.
          </Alert>
        ) : null}

        <Field label="Why" hint="Shows in the history of this batch and in the audit log.">
          <Input value={reason} maxLength={200} onChange={event => setReason(event.target.value)} />
        </Field>
        {correct.isError ? <Alert tone="danger">{errorMessage(correct.error)}</Alert> : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" loading={correct.isPending} disabled={!ready}>
            Save correction
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
