import {ArrowDown, ArrowUp, Plus, Trash2} from 'lucide-react';

import type {PrepPriceMode} from '@grov/models';
import {
  AmountInput,
  Button,
  Card,
  Field,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@grov/ui';

import {
  emptyPrep,
  MAX_PREP_OPTIONS,
  moveItem,
  PREP_PRICE_MODES,
  type PrepDraft,
  type PrepRowErrors,
} from '../../lib/products';
import {formatAmount, unitNoun} from '../../lib/units';
import {NumberInput} from '../number-input';

export interface PrepOptionsEditorProps {
  drafts: PrepDraft[];
  onChange: (drafts: PrepDraft[]) => void;
  errors: Record<string, PrepRowErrors>;
  /** The product's base unit, which "Price covers" is counted in. */
  unit: string;
  disabled?: boolean;
}

/** Extras a shopper can add to a line: blending, cutting, cleaning. Each has its own price. */
export function PrepOptionsEditor({
  drafts,
  onChange,
  errors,
  unit,
  disabled,
}: PrepOptionsEditorProps) {
  const patch = (key: string, changes: Partial<PrepDraft>) =>
    onChange(drafts.map(draft => (draft.key === key ? {...draft, ...changes} : draft)));

  return (
    <div className="grid gap-4">
      {drafts.length === 0 ? (
        <p className="text-body text-ink-muted">
          No prep options. Add one if shoppers can ask for this product to be blended, cut or
          cleaned for a fee.
        </p>
      ) : null}
      <ol className="grid gap-3" aria-label="Prep options">
        {drafts.map((draft, index) => {
          const row = errors[draft.key] ?? {};
          return (
            <li key={draft.key}>
              <Card className="grid gap-4 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-label">Option {index + 1}</span>
                  {!disabled ? (
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Move option ${index + 1} earlier`}
                        disabled={index === 0}
                        onClick={() => onChange(moveItem(drafts, index, -1))}
                      >
                        <ArrowUp aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Move option ${index + 1} later`}
                        disabled={index === drafts.length - 1}
                        onClick={() => onChange(moveItem(drafts, index, 1))}
                      >
                        <ArrowDown aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove option ${index + 1}`}
                        onClick={() => onChange(drafts.filter(other => other.key !== draft.key))}
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name" error={row.label}>
                    <Input
                      autoComplete="off"
                      placeholder="Blend"
                      value={draft.label}
                      disabled={disabled}
                      onChange={event => patch(draft.key, {label: event.target.value})}
                    />
                  </Field>
                  <Field label="Price" error={row.priceKobo}>
                    <AmountInput
                      valueKobo={draft.priceKobo}
                      disabled={disabled}
                      onChangeKobo={kobo => patch(draft.key, {priceKobo: kobo})}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Charged" hint={PREP_PRICE_MODES[draft.priceMode].hint}>
                    <Select
                      value={draft.priceMode}
                      disabled={disabled}
                      onValueChange={value => patch(draft.key, {priceMode: value as PrepPriceMode})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(PREP_PRICE_MODES) as PrepPriceMode[]).map(mode => (
                          <SelectItem key={mode} value={mode}>
                            {PREP_PRICE_MODES[mode].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  {draft.priceMode === 'PER_QUANTITY' ? (
                    <Field
                      label={`Price covers (${unitNoun(unit)})`}
                      hint={
                        formatAmount(draft.perQuantityBase, unit)
                          ? `The price is charged per ${formatAmount(draft.perQuantityBase, unit)}.`
                          : `In ${unitNoun(unit)}, the same unit as the sizes.`
                      }
                      error={row.perQuantityBase}
                    >
                      <NumberInput
                        decimals={3}
                        placeholder="1000"
                        value={draft.perQuantityBase}
                        disabled={disabled}
                        onChange={value => patch(draft.key, {perQuantityBase: value})}
                      />
                    </Field>
                  ) : null}
                </div>

                <Field label="Note" optional error={row.note}>
                  <Input
                    autoComplete="off"
                    value={draft.note}
                    disabled={disabled}
                    onChange={event => patch(draft.key, {note: event.target.value})}
                  />
                </Field>
              </Card>
            </li>
          );
        })}
      </ol>
      {!disabled ? (
        <div>
          <Button
            type="button"
            variant="outline"
            disabled={drafts.length >= MAX_PREP_OPTIONS}
            onClick={() => onChange([...drafts, emptyPrep()])}
          >
            <Plus aria-hidden /> Add a prep option
          </Button>
        </div>
      ) : null}
    </div>
  );
}
