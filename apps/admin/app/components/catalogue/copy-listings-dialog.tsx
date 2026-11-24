import {type ReactNode, useState} from 'react';

import {useCopyListings, useMyStores} from '@grov/hooks';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@grov/ui';

export interface CopyListingsDialogProps {
  /** The store being filled. It is never offered as the source. */
  activeStoreId: string;
  activeStoreName: string;
  trigger: ReactNode;
}

/** Seed this store from another: lists the other store's active products here. */
export function CopyListingsDialog({
  activeStoreId,
  activeStoreName,
  trigger,
}: CopyListingsDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent layout="sheet">
        {open ? (
          <CopyForm
            activeStoreId={activeStoreId}
            activeStoreName={activeStoreName}
            onDone={() => setOpen(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function CopyForm({
  activeStoreId,
  activeStoreName,
  onDone,
}: Omit<CopyListingsDialogProps, 'trigger'> & {onDone: () => void}) {
  const stores = useMyStores();
  const copy = useCopyListings();
  const [sourceId, setSourceId] = useState('');
  const sources = stores.data?.stores.filter(store => store.id !== activeStoreId) ?? [];

  return (
    <>
      <DialogHeader>
        <DialogTitle>Copy listings to {activeStoreName}</DialogTitle>
        <DialogDescription>
          Lists the other store’s active products here. Products this store already lists, paused or
          delisted keep their current state.
        </DialogDescription>
      </DialogHeader>
      {sources.length === 0 && stores.isSuccess ? (
        <p className="text-body text-ink-muted">You have no other store to copy from.</p>
      ) : (
        <Field label="Copy from">
          <Select value={sourceId} onValueChange={setSourceId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a store" />
            </SelectTrigger>
            <SelectContent>
              {sources.map(store => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
      {copy.isError ? <Alert tone="danger">{errorMessage(copy.error)}</Alert> : null}
      <DialogFooter>
        <Button variant="ghost" onClick={onDone} disabled={copy.isPending}>
          Cancel
        </Button>
        <Button
          loading={copy.isPending}
          disabled={!sourceId}
          onClick={() =>
            copy.mutate(sourceId, {
              onSuccess: ({copied}) => {
                toast.success(
                  copied === 0
                    ? 'Nothing new to list. This store already has them all.'
                    : `${copied} ${copied === 1 ? 'product' : 'products'} listed at ${activeStoreName}`
                );
                onDone();
              },
            })
          }
        >
          Copy listings
        </Button>
      </DialogFooter>
    </>
  );
}
