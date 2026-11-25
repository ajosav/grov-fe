import {useState} from 'react';

import {useSetMarkup, useSetProductMarkup} from '@grov/hooks';
import type {PriceMarkupValue} from '@grov/models';
import {errorMessage} from '@grov/shared';
import {
  Alert,
  AmountInput,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  NumberInput,
  Segmented,
  toast,
} from '@grov/ui';

import {
  MARKUP_KINDS,
  type MarkupDraft,
  markupError,
  type MarkupKind,
  MAX_PERCENT,
  toMarkupDraft,
  toMarkupValue,
} from '../../lib/catalogue/markups';

/** What a markup applies to: everything the store sells, or every size of one product. */
export type MarkupTarget =
  {kind: 'store'; storeName: string} | {kind: 'product'; productId: string; displayName: string};

export interface MarkupDialogProps {
  target: MarkupTarget | null;
  /** The markup in force today, to start from. */
  current: PriceMarkupValue | undefined;
  onClose: () => void;
}

/** Set the markup added to base prices at the active store. Live as soon as it's saved. */
export function MarkupDialog({target, current, onClose}: MarkupDialogProps) {
  return (
    <Dialog open={target !== null} onOpenChange={open => (open ? undefined : onClose())}>
      <DialogContent layout="side" className="max-w-lg content-start">
        {target ? <MarkupForm target={target} current={current} onDone={onClose} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function MarkupForm({
  target,
  current,
  onDone,
}: {
  target: MarkupTarget;
  current: PriceMarkupValue | undefined;
  onDone: () => void;
}) {
  const setStore = useSetMarkup();
  const setProduct = useSetProductMarkup();
  const pending = setStore.isPending || setProduct.isPending;
  const failure = setStore.isError ? setStore.error : setProduct.isError ? setProduct.error : null;
  // One key per "set this markup" intent, reused if the admin retries.
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [draft, setDraft] = useState<MarkupDraft>(() => toMarkupDraft(current));
  const [showError, setShowError] = useState(false);
  const error = showError ? markupError(draft) : undefined;
  const isStore = target.kind === 'store';
  const name = isStore ? target.storeName : target.displayName;

  const submit = () => {
    setShowError(true);
    if (markupError(draft)) return;
    const markup = toMarkupValue(draft);
    const onSuccess = () => {
      toast.success(
        markup.kind === 'NONE' ? `Markup cleared for ${name}` : `Markup saved for ${name}`
      );
      onDone();
    };
    if (target.kind === 'store') {
      setStore.mutate({scope: {kind: 'STORE'}, markup, idempotencyKey}, {onSuccess});
    } else {
      setProduct.mutate({productId: target.productId, markup}, {onSuccess});
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isStore ? 'Store-wide markup' : `Markup for ${name}`}</DialogTitle>
        <DialogDescription>
          {isStore
            ? `Added to the base price of every product at ${name}, unless a product has its own markup.`
            : 'Added to the base price of every size of this product at this store. It overrides the store-wide markup.'}{' '}
          Takes effect as soon as you save.
        </DialogDescription>
      </DialogHeader>
      <form
        onSubmit={event => {
          event.preventDefault();
          submit();
        }}
        noValidate
        className="grid gap-5"
      >
        <div className="grid gap-2">
          <span className="text-label">Markup</span>
          <Segmented<MarkupKind>
            label="Markup"
            value={draft.kind}
            onChange={kind => {
              setDraft({...draft, kind});
              setShowError(false);
            }}
            options={(Object.keys(MARKUP_KINDS) as MarkupKind[]).map(kind => ({
              value: kind,
              label: MARKUP_KINDS[kind].label,
            }))}
            className="w-fit"
          />
          <p className="text-body-sm text-ink-muted">{MARKUP_KINDS[draft.kind].hint}</p>
        </div>

        {draft.kind === 'FIXED' ? (
          <Field label="Amount" error={error}>
            <AmountInput
              valueKobo={draft.amountKobo}
              onChangeKobo={amountKobo => setDraft({...draft, amountKobo})}
            />
          </Field>
        ) : null}
        {draft.kind === 'PERCENT' ? (
          <Field label="Percent" hint={`Up to ${MAX_PERCENT}%.`} error={error}>
            <NumberInput
              decimals={2}
              placeholder="10"
              value={draft.percent}
              onChange={percent => setDraft({...draft, percent})}
            />
          </Field>
        ) : null}

        {failure ? <Alert tone="danger">{errorMessage(failure)}</Alert> : null}
        <DialogFooter>
          <Button variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" loading={pending}>
            Save markup
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
