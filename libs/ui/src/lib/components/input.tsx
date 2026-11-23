import {forwardRef, type InputHTMLAttributes} from 'react';

import {cn} from '../utils/cn';

export const inputClasses = cn(
  'flex h-12 w-full min-w-0 rounded-md border border-line-strong/40 bg-surface px-4 text-body text-ink',
  'placeholder:text-ink-muted transition-[border-color,box-shadow] outline-none',
  'focus-visible:border-ink focus-visible:ring-4 focus-visible:ring-flame/20',
  'aria-invalid:border-danger aria-invalid:ring-danger/15',
  'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-muted',
  'file:border-0 file:bg-transparent file:text-body-sm file:font-semibold'
);

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {className, type = 'text', ...props},
  ref
) {
  return <input ref={ref} type={type} className={cn(inputClasses, className)} {...props} />;
});
