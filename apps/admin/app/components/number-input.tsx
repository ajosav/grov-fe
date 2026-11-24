import {forwardRef} from 'react';

import {Input, type InputProps} from '@grov/ui';

import {sanitizeNumber} from '../lib/numbers';

export interface NumberInputProps extends Omit<
  InputProps,
  'value' | 'onChange' | 'type' | 'inputMode' | 'defaultValue'
> {
  value: string;
  onChange: (value: string) => void;
  /** Decimal places allowed. 0 (the default) is a whole number. */
  decimals?: number;
  maxIntegerDigits?: number;
}

/**
 * A text box that takes digits only (and a decimal point when `decimals` > 0). Anything
 * else typed or pasted is dropped. It stays a text input so leading zeros and the point
 * behave, and so phones show the number pad.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {value, onChange, decimals = 0, maxIntegerDigits, ...props},
  ref
) {
  return (
    <Input
      ref={ref}
      inputMode={decimals > 0 ? 'decimal' : 'numeric'}
      autoComplete="off"
      value={value}
      onChange={event => onChange(sanitizeNumber(event.target.value, decimals, maxIntegerDigits))}
      {...props}
    />
  );
});
