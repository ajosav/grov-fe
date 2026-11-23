import {type ReactNode} from 'react';

import {CircleAlert, CircleCheck, Info} from 'lucide-react';

import {cn} from '../utils/cn';
import {Button} from './button';
import {Dialog, DialogContent, DialogDescription, DialogTitle} from './dialog';

const ICONS = {
  success: {icon: CircleCheck, className: 'bg-leaf-tint text-leaf-strong'},
  error: {icon: CircleAlert, className: 'bg-danger-tint text-danger'},
  info: {icon: Info, className: 'bg-sky-tint text-sky-strong'},
} as const;

export interface StatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: keyof typeof ICONS;
  title: ReactNode;
  description?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function StatusDialog({
  open,
  onOpenChange,
  status,
  title,
  description,
  actionLabel = 'Done',
  onAction,
}: StatusDialogProps) {
  const {icon: Icon, className} = ICONS[status];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent layout="sheet" hideClose className="justify-items-center text-center">
        <span className={cn('flex size-14 items-center justify-center rounded-pill', className)}>
          <Icon aria-hidden className="size-7" />
        </span>
        <div className="grid gap-1.5">
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </div>
        <Button className="w-full" onClick={() => (onAction ? onAction() : onOpenChange(false))}>
          {actionLabel}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
