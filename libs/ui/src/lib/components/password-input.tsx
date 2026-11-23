import {forwardRef, useState} from 'react';

import {Eye, EyeOff} from 'lucide-react';

import {cn} from '../utils/cn';
import {Input, type InputProps} from './input';

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  function PasswordInput({className, ...props}, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn('pr-12', className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-md text-ink-muted hover:text-ink"
        >
          {visible ? (
            <EyeOff aria-hidden className="size-5" />
          ) : (
            <Eye aria-hidden className="size-5" />
          )}
        </button>
      </div>
    );
  }
);
