import {useState} from 'react';

import {useSetStockSettings} from '@grov/hooks';
import type {StockOverviewRow} from '@grov/models';
import {errorMessage} from '@grov/shared';
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  NumberInput,
  toast,
} from '@grov/ui';

import {pickEntryUnit} from '../../lib/catalogue/units';
import {formatDays} from '../../lib/stock/stock-format';
import {QuantityInput} from '../common/quantity-input';
import {StatusMoveForm, WriteOffForm} from '../inventory/balance-forms';
import type {StockAction} from './stock-row-actions';

export interface StockDialogsProps {
  action: StockAction | null;
  summary: {leadTimeDefaultDays: number; coverTargetDefaultDays: number} | undefined;
  onClose: () => void;
}

/** One dialog host for every per-product stock action, so a page keeps a single piece of state. */
export function StockDialogs({action, summary, onClose}: StockDialogsProps) {
  return (
    <Dialog open={action !== null} onOpenChange={open => (open ? undefined : onClose())}>
      <DialogContent layout="side" className="max-w-lg content-start">
        {action?.kind === 'write_off' ? (
          <WriteOffForm
            product={{
              productId: action.row.productId,
              name: action.row.displayName,
              sku: action.row.sku,
              baseUnit: action.row.baseUnit,
            }}
            onDone={onClose}
          />
        ) : null}
        {action?.kind === 'status_move' ? (
          <StatusMoveForm
            product={{
              productId: action.row.productId,
              name: action.row.displayName,
              sku: action.row.sku,
              baseUnit: action.row.baseUnit,
            }}
            onDone={onClose}
          />
        ) : null}
        {action?.kind === 'settings' ? (
          <SettingsForm row={action.row} summary={summary} onDone={onClose} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function Heading({title, row, hint}: {title: string; row: StockOverviewRow; hint: string}) {
  return (
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>
        {row.displayName} · {row.sku}. {hint}
      </DialogDescription>
    </DialogHeader>
  );
}

function Footer({
  pending,
  label,
  onCancel,
  disabled,
}: {
  pending: boolean;
  label: string;
  onCancel: () => void;
  disabled?: boolean;
}) {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" loading={pending} disabled={disabled}>
        {label}
      </Button>
    </DialogFooter>
  );
}

function SettingsForm({
  row,
  summary,
  onDone,
}: {
  row: StockOverviewRow;
  summary: StockDialogsProps['summary'];
  onDone: () => void;
}) {
  const save = useSetStockSettings();
  const [entry, setEntry] = useState(
    () => pickEntryUnit(row.baseUnit, String(row.lowThresholdQty ?? 0)).code
  );
  const [low, setLow] = useState(row.lowThresholdQty === null ? '' : String(row.lowThresholdQty));
  const [lead, setLead] = useState(row.leadTimeCustom ? String(row.leadTimeDays) : '');
  const [cover, setCover] = useState(row.coverTargetCustom ? String(row.coverTargetDays) : '');
  const leadDefault = summary?.leadTimeDefaultDays ?? 2;
  const coverDefault = summary?.coverTargetDefaultDays ?? 7;

  return (
    <>
      <Heading
        title="Planning settings"
        row={row}
        hint="These shape what the restock planner suggests. Leave a box empty to use the default."
      />
      <form
        noValidate
        className="grid gap-5"
        onSubmit={event => {
          event.preventDefault();
          save.mutate(
            {
              productId: row.productId,
              body: {
                lowThresholdQty: low === '' ? null : low,
                leadTimeDays: lead === '' ? null : Number(lead),
                coverTargetDays: cover === '' ? null : Number(cover),
              },
            },
            {
              onSuccess: () => {
                toast.success('Planning settings saved');
                onDone();
              },
            }
          );
        }}
      >
        <Field label="Low-stock level" hint="Flags the product when available stock falls to this.">
          <QuantityInput
            value={low}
            onChange={setLow}
            unit={row.baseUnit}
            entry={entry}
            onEntryChange={setEntry}
          />
        </Field>
        <Field
          label="Delivery lead time (days)"
          hint={`How long a delivery takes after you order. Default ${formatDays(leadDefault)}.`}
        >
          <NumberInput
            decimals={0}
            placeholder={String(leadDefault)}
            value={lead}
            onChange={setLead}
          />
        </Field>
        <Field
          label="Cover target (days)"
          hint={`How many days of sales a delivery should cover. Default ${formatDays(coverDefault)}.`}
        >
          <NumberInput
            decimals={0}
            placeholder={String(coverDefault)}
            value={cover}
            onChange={setCover}
          />
        </Field>
        {save.isError ? <Alert tone="danger">{errorMessage(save.error)}</Alert> : null}
        <Footer pending={save.isPending} label="Save settings" onCancel={onDone} />
      </form>
    </>
  );
}
