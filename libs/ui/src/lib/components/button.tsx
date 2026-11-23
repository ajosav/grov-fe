import {type ButtonHTMLAttributes, forwardRef} from 'react';

import {cva, type VariantProps} from 'class-variance-authority';
import {Slot} from 'radix-ui';

import {cn} from '../utils/cn';
import {Spinner} from './spinner';

export const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-pill font-sans text-label',
    'transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.98]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    'disabled:pointer-events-none disabled:bg-action-disabled disabled:text-on-action-disabled disabled:shadow-none',
    '[&_svg]:size-5 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        /** The one main action on a screen: flame fill, ink label (F7, DS2). */
        primary:
          'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-pressed',
        /** Night pill: strong secondary, or primary on cream panels where flame is already used. */
        night: 'bg-night text-on-night hover:bg-night-hi',
        secondary: 'bg-surface-sunken text-ink hover:bg-line',
        outline: 'border border-line-strong bg-transparent text-ink hover:bg-surface-sunken',
        ghost: 'bg-transparent text-ink hover:bg-surface-sunken',
        danger: 'bg-danger text-destructive-foreground hover:opacity-90',
        link: 'h-auto rounded-sm px-0 text-ink underline underline-offset-4 hover:text-flame-strong',
      },
      size: {
        sm: 'h-9 px-4 text-body-sm',
        md: 'h-12 px-6',
        lg: 'h-14 px-8 text-body-lg',
        icon: 'size-12',
        'icon-sm': 'size-9 [&_svg]:size-4',
      },
      block: {true: 'w-full'},
    },
    defaultVariants: {variant: 'primary', size: 'md'},
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Render the child element (e.g. a router `<Link>`) with button styles. */
  asChild?: boolean;
  /** Shows a spinner, sets `aria-busy` and blocks clicks. */
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {className, variant, size, block, asChild = false, loading = false, disabled, children, ...props},
  ref
) {
  const classes = cn(buttonVariants({variant, size, block}), className);
  if (asChild) {
    return (
      <Slot.Root ref={ref} className={classes} {...props}>
        {children}
      </Slot.Root>
    );
  }
  return (
    <button
      ref={ref}
      type={props.type ?? 'button'}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner label="" /> : null}
      {children}
    </button>
  );
});
