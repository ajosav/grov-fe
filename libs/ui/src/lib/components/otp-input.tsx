import {type ComponentProps} from 'react';

import {OTPInput, type SlotProps} from 'input-otp';

import {cn} from '../utils/cn';

export interface OtpInputProps extends Omit<
  ComponentProps<typeof OTPInput>,
  'maxLength' | 'render' | 'children'
> {
  length?: number;
}

/** 6-digit code entry with paste and SMS/email autofill (`autocomplete="one-time-code"`). */
export function OtpInput({length = 6, className, ...props}: OtpInputProps) {
  return (
    <OTPInput
      maxLength={length}
      inputMode="numeric"
      pattern="^\d+$"
      autoComplete="one-time-code"
      containerClassName={cn('flex items-center gap-2 has-disabled:opacity-60', className)}
      render={({slots}) => (
        <>
          {slots.map((slot, index) => (
            <Slot key={index} {...slot} />
          ))}
        </>
      )}
      {...props}
    />
  );
}

function Slot({char, hasFakeCaret, isActive}: SlotProps) {
  return (
    <div
      className={cn(
        'relative flex h-14 w-12 items-center justify-center rounded-md border border-line-strong/40 bg-surface',
        'font-display text-title-lg text-ink tabular transition-[border-color,box-shadow]',
        isActive && 'border-ink ring-4 ring-flame/20'
      )}
    >
      {char}
      {hasFakeCaret ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span className="h-6 w-px animate-pulse bg-ink" />
        </span>
      ) : null}
    </div>
  );
}
