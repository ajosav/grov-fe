import {type HTMLAttributes} from 'react';

import {cva, type VariantProps} from 'class-variance-authority';

import {cn} from '../utils/cn';

/** Chips: 12px bold floor (DS8). Green is status only; crimson is for real errors only. */
export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-chip whitespace-nowrap [&_svg]:size-3.5',
  {
    variants: {
      tone: {
        neutral: 'bg-surface-sunken text-ink',
        flame: 'bg-flame-tint text-flame-strong',
        leaf: 'bg-leaf-tint text-leaf-strong',
        palm: 'bg-palm-tint text-palm-strong',
        sky: 'bg-sky-tint text-sky-strong',
        danger: 'bg-danger-tint text-danger',
        night: 'bg-night text-on-night',
      },
    },
    defaultVariants: {tone: 'neutral'},
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({className, tone, ...props}: BadgeProps) {
  return <span className={cn(badgeVariants({tone}), className)} {...props} />;
}
