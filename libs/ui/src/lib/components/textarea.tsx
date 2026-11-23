import {forwardRef, type TextareaHTMLAttributes} from 'react';

import {cn} from '../utils/cn';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({className, ...props}, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-28 w-full resize-y rounded-md border border-line-strong/40 bg-surface px-4 py-3 text-body text-ink',
        'placeholder:text-ink-muted outline-none transition-[border-color,box-shadow]',
        'focus-visible:border-ink focus-visible:ring-4 focus-visible:ring-flame/20',
        'aria-invalid:border-danger disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-muted',
        className
      )}
      {...props}
    />
  );
});
