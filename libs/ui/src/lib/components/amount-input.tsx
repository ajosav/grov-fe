import {forwardRef, useState} from 'react';

import {cn} from '../utils/cn';
import {Input, type InputProps} from './input';

export interface AmountInputProps extends Omit<
  InputProps,
  'value' | 'onChange' | 'type' | 'defaultValue'
> {
  valueKobo: number | null;
  onChangeKobo: (kobo: number | null) => void;
  maxNaira?: number;
}

const format = (kobo: number | null) =>
  kobo === null ? '' : Math.round(kobo / 100).toLocaleString('en-NG');

export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(function AmountInput(
  {valueKobo, onChangeKobo, maxNaira = 100_000_000, className, ...props},
  ref
) {
  const [text, setText] = useState(() => format(valueKobo));
  const shown = text === '' && valueKobo !== null ? format(valueKobo) : text;
  return (
    <div className="relative">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-body text-ink-muted"
      >
        ₦
      </span>
      <Input
        ref={ref}
        inputMode="numeric"
        autoComplete="off"
        value={shown}
        onChange={event => {
          const digits = event.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
          const naira = digits === '' ? null : Math.min(Number(digits), maxNaira);
          setText(naira === null ? '' : naira.toLocaleString('en-NG'));
          onChangeKobo(naira === null ? null : naira * 100);
        }}
        className={cn('tabular pl-9', className)}
        {...props}
      />
    </div>
  );
});
