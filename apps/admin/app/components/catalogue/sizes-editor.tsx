import {useState} from 'react';

import {ArrowDown, ArrowUp, Plus, Trash2} from 'lucide-react';

import type {SizeSellMode} from '@grov/models';
import {
  Alert,
  AmountInput,
  Badge,
  Button,
  Card,
  Field,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@grov/ui';

import {
  emptySize,
  MAX_SIZES,
  moveItem,
  removeSize,
  setDefaultSize,
  type SizeDraft,
  type SizeLadderErrors,
} from '../../lib/catalogue/products';
import {
  BASE_UNITS,
  type BaseUnit,
  entryUnits,
  formatAmount,
  isBaseUnit,
  pickEntryUnit,
} from '../../lib/catalogue/units';
import {QuantityInput} from '../common/quantity-input';

interface SellModeCopy {
  label: string;
  hint: string;
  /** What the minimum and step fields show as an example. */
  min: string;
  step: string;
}

/** "Sold as" in the words that fit what is being counted: weight, volume or pieces. */
const SELL_MODES: Record<BaseUnit, Record<SizeSellMode, SellModeCopy>> = {
  g: {
    PACK: {
      label: 'Fixed pack',
      hint: 'Sold whole: a 1 kg bag, a 50 kg sack, a crate.',
      min: '',
      step: '',
    },
    BY_WEIGHT: {
      label: 'By weight',
      hint: 'Sold in any amount from a minimum, in steps: 250 g of beef, then 500 g.',
      min: '250',
      step: '250',
    },
  },
  ml: {
    PACK: {
      label: 'Fixed pack',
      hint: 'Sold whole: a 750 ml bottle, a 4 L jerrycan, a 25 L keg.',
      min: '',
      step: '',
    },
    BY_WEIGHT: {
      label: 'By volume',
      hint: 'Sold in any amount from a minimum, in steps: 500 ml of palm oil, then 250 ml more.',
      min: '500',
      step: '250',
    },
  },
  piece: {
    PACK: {
      label: 'Fixed pack or bundle',
      hint: 'Sold whole: a crate of 30 eggs, a pack of 6, a bundle of 3. Count the pieces inside.',
      min: '',
      step: '',
    },
    BY_WEIGHT: {
      label: 'By piece',
      hint: 'Sold one at a time, or in steps: 1 yam, then 2, 3… or eggs in 6s.',
      min: '1',
      step: '1',
    },
  },
};

const sellModesFor = (unit: string) => SELL_MODES[isBaseUnit(unit) ? unit : 'g'];

export interface SizesEditorProps {
  drafts: SizeDraft[];
  onChange: (drafts: SizeDraft[]) => void;
  errors: SizeLadderErrors;
  unit: string;
  disabled?: boolean;
}

export function SizesEditor({drafts, onChange, errors, unit, disabled}: SizesEditorProps) {
  const modes = sellModesFor(unit);
  // The unit each row is typed in (kg, L…). Only the base amount is stored; this is how it's shown.
  const [entries, setEntries] = useState<Record<string, string>>({});
  const entryFor = (draft: SizeDraft) =>
    entries[draft.key] ?? pickEntryUnit(unit, draft.quantityBase).code;
  const patch = (key: string, changes: Partial<SizeDraft>) =>
    onChange(drafts.map(draft => (draft.key === key ? {...draft, ...changes} : draft)));

  return (
    <div className="grid gap-4">
      {errors.ladder ? <Alert tone="danger">{errors.ladder}</Alert> : null}
      <ol className="grid gap-3" aria-label="Sizes">
        {drafts.map((draft, index) => {
          const row = errors.rows[draft.key] ?? {};
          const entry = entryFor(draft);
          const entryShort = (entryUnits(unit).find(u => u.code === entry) ?? entryUnits(unit)[0]!)
            .short;
          return (
            <li key={draft.key}>
              <Card className="grid gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-label">Size {index + 1}</span>
                    {draft.isDefault ? <Badge tone="night">Default</Badge> : null}
                  </div>
                  {!disabled ? (
                    <div className="flex items-center gap-1">
                      {!draft.isDefault ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onChange(setDefaultSize(drafts, draft.key))}
                        >
                          Make default
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Move size ${index + 1} earlier`}
                        disabled={index === 0}
                        onClick={() => onChange(moveItem(drafts, index, -1))}
                      >
                        <ArrowUp aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Move size ${index + 1} later`}
                        disabled={index === drafts.length - 1}
                        onClick={() => onChange(moveItem(drafts, index, 1))}
                      >
                        <ArrowDown aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove size ${index + 1}`}
                        onClick={() => onChange(removeSize(drafts, draft.key))}
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
                      placeholder="1 kg bag"
                      value={draft.label}
                      disabled={disabled}
                      onChange={event => patch(draft.key, {label: event.target.value})}
                    />
                  </Field>
                  <Field
                    label="Quantity"
                    hint={
                      formatAmount(draft.quantityBase, unit)
                        ? `Shoppers see this as ${formatAmount(draft.quantityBase, unit)}.`
                        : isBaseUnit(unit)
                          ? BASE_UNITS[unit].entryHint
                          : undefined
                    }
                    error={row.quantityBase}
                  >
                    <QuantityInput
                      unit={unit}
                      entry={entry}
                      onEntryChange={code => setEntries(prev => ({...prev, [draft.key]: code}))}
                      placeholder={isBaseUnit(unit) ? BASE_UNITS[unit].placeholder : undefined}
                      value={draft.quantityBase}
                      disabled={disabled}
                      onChange={value => patch(draft.key, {quantityBase: value})}
                    />
                  </Field>
                </div>

                <Field
                  label="Price"
                  hint="Before store markups. Changing it takes effect straight away."
                  error={row.priceKobo}
                >
                  <AmountInput
                    valueKobo={draft.priceKobo}
                    disabled={disabled}
                    onChangeKobo={kobo => patch(draft.key, {priceKobo: kobo})}
                  />
                </Field>

                <Field label="Sold as" hint={modes[draft.sellMode].hint}>
                  <Select
                    value={draft.sellMode}
                    disabled={disabled}
                    onValueChange={value => patch(draft.key, {sellMode: value as SizeSellMode})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(modes) as SizeSellMode[]).map(mode => (
                        <SelectItem key={mode} value={mode}>
                          {modes[mode].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {draft.sellMode === 'BY_WEIGHT' ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Smallest amount" error={row.minQty}>
                      <QuantityInput
                        unit={unit}
                        entry={entry}
                        placeholder={modes.BY_WEIGHT.min}
                        value={draft.minQty}
                        disabled={disabled}
                        onChange={value => patch(draft.key, {minQty: value})}
                      />
                    </Field>
                    <Field label="Step between amounts" error={row.stepQty}>
                      <QuantityInput
                        unit={unit}
                        entry={entry}
                        placeholder={modes.BY_WEIGHT.step}
                        value={draft.stepQty}
                        disabled={disabled}
                        onChange={value => patch(draft.key, {stepQty: value})}
                      />
                    </Field>
                  </div>
                ) : null}

                {unit === 'g' || draft.variableWeight ? (
                  <div className="grid gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid gap-0.5">
                        <label htmlFor={`${draft.key}-variable`} className="text-label">
                          Weight varies
                        </label>
                        <p className="text-body-sm text-ink-muted">
                          For items like a whole fish or a tuber, where each one weighs a little
                          different.
                        </p>
                      </div>
                      <Switch
                        id={`${draft.key}-variable`}
                        checked={draft.variableWeight}
                        disabled={disabled}
                        onCheckedChange={checked => patch(draft.key, {variableWeight: checked})}
                      />
                    </div>
                    {draft.variableWeight ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                          label={`Lightest it can weigh (${entryShort})`}
                          error={row.weightMinBase}
                        >
                          <QuantityInput
                            unit={unit}
                            entry={entry}
                            value={draft.weightMinBase}
                            disabled={disabled}
                            onChange={value => patch(draft.key, {weightMinBase: value})}
                          />
                        </Field>
                        <Field
                          label={`Heaviest it can weigh (${entryShort})`}
                          error={row.weightMaxBase}
                        >
                          <QuantityInput
                            unit={unit}
                            entry={entry}
                            value={draft.weightMaxBase}
                            disabled={disabled}
                            onChange={value => patch(draft.key, {weightMaxBase: value})}
                          />
                        </Field>
                      </div>
                    ) : null}
                  </div>
                ) : null}
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
            disabled={drafts.length >= MAX_SIZES}
            onClick={() => onChange([...drafts, emptySize(drafts.length === 0)])}
          >
            <Plus aria-hidden /> Add a size
          </Button>
        </div>
      ) : null}
    </div>
  );
}
