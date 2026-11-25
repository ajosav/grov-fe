import {type FormEvent, type ReactNode, useState} from 'react';

import {isApiError} from '@grov/api';
import {useCreateInvite} from '@grov/hooks';
import {errorMessage} from '@grov/shared';
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  toast,
} from '@grov/ui';

import {AccessPicker, type AccessValue} from './access-picker';

export interface InviteDialogProps {
  trigger: ReactNode;
  /** Start with this store ticked (inviting from a store's page). */
  storeId?: string;
}

/** Invite someone to the admin console: email, roles and stores. */
export function InviteDialog({trigger, storeId}: InviteDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent layout="side" className="max-w-xl content-start">
        {open ? <InviteForm storeId={storeId} onDone={() => setOpen(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function InviteForm({storeId, onDone}: {storeId?: string; onDone: () => void}) {
  // One key per "send invite" intent, reused on retry (data.md → Idempotency).
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const create = useCreateInvite();
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [grant, setGrant] = useState<AccessValue>({
    roleIds: [],
    storeIds: storeId ? [storeId] : [],
    allStores: false,
  });
  const [errors, setErrors] = useState<{email?: string; roleIds?: string}>({});

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim().toLowerCase();
    const next = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? undefined : 'Enter their email address',
      roleIds: grant.roleIds.length > 0 ? undefined : 'Pick at least one role',
    };
    setErrors(next);
    if (next.email || next.roleIds) return;
    create.mutate(
      {
        idempotencyKey,
        body: {
          email: trimmed,
          roleIds: grant.roleIds,
          storeIds: grant.allStores ? [] : grant.storeIds,
          allStores: grant.allStores,
          ...(title.trim() ? {title: title.trim()} : {}),
        },
      },
      {
        onSuccess: invite => {
          toast.success(`Invite sent to ${invite.email}`);
          onDone();
        },
        onError: error => {
          if (isApiError(error) && error.fieldError('email')) {
            setErrors({email: error.fieldError('email') ?? undefined});
          }
        },
      }
    );
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Invite staff</DialogTitle>
        <DialogDescription>
          They get an email with a link that works once, for 7 days. You can only give roles and
          stores you have yourself.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} noValidate className="grid gap-5">
        <Field label="Email" error={errors.email}>
          <Input
            type="email"
            inputMode="email"
            autoComplete="off"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Job title" optional hint="Shown in the staff list, like Store manager.">
          <Input
            autoComplete="off"
            maxLength={80}
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </Field>
        <AccessPicker value={grant} onChange={setGrant} errors={{roleIds: errors.roleIds}} />
        {create.isError ? <Alert tone="danger">{errorMessage(create.error)}</Alert> : null}
        <DialogFooter>
          <Button variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending}>
            Send invite
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
