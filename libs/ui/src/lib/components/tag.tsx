import {type ReactNode} from 'react';

import {cva, type VariantProps} from 'class-variance-authority';

import {cn} from '../utils/cn';

/** Small descriptive label (design system "Tag"). Tags describe; they are not buttons. */
const tagVariants = cva(
  'inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-chip whitespace-nowrap [&_svg]:size-3.5',
  {
    variants: {
      tone: {
        neutral: 'bg-surface-sunken text-ink',
        success: 'bg-leaf-tint text-leaf-strong',
        info: 'bg-sky-tint text-sky-strong',
        estimate: 'bg-palm-tint text-palm-strong',
        changed: 'bg-flame-tint text-flame-strong',
        danger: 'bg-danger-tint text-danger',
        'bright-leaf': 'bg-leaf text-on-bright',
        'bright-flame': 'bg-flame text-on-bright',
        'bright-palm': 'bg-palm text-on-bright',
      },
    },
    defaultVariants: {tone: 'neutral'},
  }
);

export interface TagProps extends VariantProps<typeof tagVariants> {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Tag({tone, icon, children, className}: TagProps) {
  return (
    <span className={cn(tagVariants({tone}), className)}>
      {icon}
      {children}
    </span>
  );
}
