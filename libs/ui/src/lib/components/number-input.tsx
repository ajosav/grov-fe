import {forwardRef} from 'react';

import {sanitizeNumber} from '../utils/number';
import {Input, type InputProps} from './input';

export interface NumberInputProps extends Omit<
  InputProps,
  'value' | 'onChange' | 'type' | 'inputMode' | 'defaultValue'
> {
  value: string;
  onChange: (value: string) => void;
  decimals?: number;
  maxIntegerDigits?: number;
}

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
