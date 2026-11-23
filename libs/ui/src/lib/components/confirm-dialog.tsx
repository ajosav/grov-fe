import {type ReactNode} from 'react';

import {Button} from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** The button label says what happens ("Delete role"), never just "OK". */
  confirmLabel: string;
  cancelLabel?: string;
  /** Destructive actions get the danger button. */
  tone?: 'default' | 'danger';
  /** Spinner on the confirm button while the mutation runs; the dialog stays open. */
  loading?: boolean;
  onConfirm: () => void;
  children?: ReactNode;
}

/** Ask before an action that can't be undone or costs money. Keep it rare. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'default',
  loading,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={next => (loading ? undefined : onOpenChange(next))}>
      <DialogContent layout="sheet" hideClose role="alertdialog">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
