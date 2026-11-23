import {type HTMLAttributes, type ReactNode} from 'react';

import {cva, type VariantProps} from 'class-variance-authority';
import {CircleAlert, CircleCheck, Info, TriangleAlert} from 'lucide-react';

import {cn} from '../utils/cn';

const alertVariants = cva(
  'flex gap-3 rounded-md border p-4 text-body [&>svg]:mt-0.5 [&>svg]:size-5 [&>svg]:shrink-0',
  {
    variants: {
      tone: {
        info: 'border-sky-strong/25 bg-sky-tint text-ink [&>svg]:text-sky-strong',
        success: 'border-leaf/30 bg-leaf-tint text-ink [&>svg]:text-leaf-strong',
        warning: 'border-palm/40 bg-palm-tint text-ink [&>svg]:text-palm-strong',
        danger: 'border-danger/30 bg-danger-tint text-ink [&>svg]:text-danger',
      },
    },
    defaultVariants: {tone: 'info'},
  }
);

const ICONS = {info: Info, success: CircleCheck, warning: TriangleAlert, danger: CircleAlert};

export interface AlertProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>, VariantProps<typeof alertVariants> {
  title?: ReactNode;
}

export function Alert({className, tone, title, children, ...props}: AlertProps) {
  const Icon = ICONS[tone ?? 'info'];
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn(alertVariants({tone}), className)}
      {...props}
    >
      <Icon aria-hidden />
      <div className="grid gap-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className="text-ink-muted">{children}</div> : null}
      </div>
    </div>
  );
}
