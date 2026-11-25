import {forwardRef, useEffect, useState} from 'react';

import {
  NumberInput,
  type NumberInputProps,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@grov/ui';

import {entryUnits, fromBaseAmount, toBaseAmount} from '../../lib/catalogue/units';

export interface QuantityInputProps extends Omit<
  NumberInputProps,
  'value' | 'onChange' | 'decimals'
> {
  /** The amount in the product's base unit (grams, millilitres, pieces), as sent to the API. */
  value: string;
  onChange: (baseValue: string) => void;
  /** The product's base unit. */
  unit: string;
  /** The entry unit's code (`kg`, `l`, `ml`…). Must be one of `entryUnits(unit)`. */
  entry: string;
  /** Shows a picker for the entry unit; without it the unit is plain text after the box. */
  onEntryChange?: (code: string) => void;
}

/**
 * A quantity typed in the unit people say it in: 4 with "L" is stored as 4000 ml. The box keeps
 * its own text so typing "2." isn't rewritten, and re-reads the stored value when it changes
 * from outside (a unit switch, a reload).
 */
export const QuantityInput = forwardRef<HTMLInputElement, QuantityInputProps>(
  function QuantityInput({value, onChange, unit, entry, onEntryChange, disabled, ...props}, ref) {
    const units = entryUnits(unit);
    const current = units.find(candidate => candidate.code === entry) ?? units[0]!;
    const [text, setText] = useState(() => fromBaseAmount(value, current.factor) ?? '');

    useEffect(() => {
      if (toBaseAmount(text, current.factor) === value) return;
      const shown = fromBaseAmount(value, current.factor);
      if (shown !== null) setText(shown);
      // eslint-disable-next-line react-hooks/exhaustive-deps -- only an outside change re-reads the text
    }, [value, current.factor]);

    return (
      <div className="flex items-center gap-2">
        <NumberInput
          ref={ref}
          decimals={3}
          value={text}
          disabled={disabled}
          onChange={next => {
            setText(next);
            onChange(toBaseAmount(next, current.factor));
          }}
          {...props}
        />
        {units.length > 1 && onEntryChange ? (
          <Select value={current.code} disabled={disabled} onValueChange={onEntryChange}>
            <SelectTrigger className="w-24 shrink-0" aria-label="Unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map(candidate => (
                <SelectItem key={candidate.code} value={candidate.code}>
                  {candidate.short}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="shrink-0 text-body-sm text-ink-muted">{current.short}</span>
        )}
      </div>
    );
  }
);
