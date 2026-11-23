import {forwardRef} from 'react';

import {cn} from '../utils/cn';
import {Input, type InputProps} from './input';

/** Nigerian phone field: fixed +234 prefix; accepts 0803… or 803… (D37). */
export const PhoneInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  function PhoneInput({className, ...props}, ref) {
    return (
      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center border-r border-line pl-4 pr-3 text-body text-ink-muted"
        >
          +234
        </span>
        <Input
          ref={ref}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="0803 123 4567"
          className={cn('pl-[4.75rem]', className)}
          {...props}
        />
      </div>
    );
  }
);
